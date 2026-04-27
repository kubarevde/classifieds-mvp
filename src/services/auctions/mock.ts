import type { AuctionEvent, AuctionState, Bid } from "@/entities/auction/model";
import { auctionMocks } from "@/mocks/auctions";
import { createMockFeatureGateService } from "@/services/feature-gate/mock";

import type { AuctionService, PlaceBidInput } from "./index";
import { canPlaceBid, deriveAuctionStatus, isValidBidAmount, resolveProxyBids } from "./rules";
const ANTISNIPING_TRIGGER_WINDOW_MS = 2 * 60_000;

let memoryAuctions = auctionMocks.map(cloneAuction);

function cloneBid(bid: Bid): Bid {
  return {
    ...bid,
    placedAt: new Date(bid.placedAt),
  };
}

function cloneAuction(auction: AuctionState): AuctionState {
  return {
    ...auction,
    startAt: new Date(auction.startAt),
    endAt: new Date(auction.endAt),
    bids: auction.bids.map(cloneBid),
  };
}

function withDerivedStatus(auction: AuctionState): AuctionState {
  return {
    ...auction,
    status: deriveAuctionStatus(auction),
  };
}

function finalizeBidStatuses(auction: AuctionState): AuctionState {
  const sorted = [...auction.bids].sort((a, b) => a.placedAt.getTime() - b.placedAt.getTime());
  const proxyResult = resolveProxyBids(sorted);
  const winningBidId = proxyResult?.winnerBidId ?? sorted[sorted.length - 1]?.id;
  const winnerBid = sorted.find((bid) => bid.id === winningBidId);
  const winnerId = winnerBid?.bidderId;

  const bids = sorted.map((bid) => {
    if (bid.id === winningBidId) {
      if (auction.status === "ended") {
        return { ...bid, status: "won" as const };
      }
      return { ...bid, status: "winning" as const };
    }
    return { ...bid, status: "outbid" as const };
  });

  return {
    ...auction,
    bids,
    currentBid: proxyResult?.price ?? auction.currentBid,
    winnerId: auction.status === "ended" ? winnerId : undefined,
  };
}

function getAuctionOrNull(auctionId: string): AuctionState | null {
  const found = memoryAuctions.find((auction) => auction.id === auctionId);
  if (!found) {
    return null;
  }
  return finalizeBidStatuses(withDerivedStatus(cloneAuction(found)));
}

function emit<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

export const mockAuctionService: AuctionService = {
  async createAuction(input) {
    const featureGate = createMockFeatureGateService(input.creator.subscription, input.creator.role);
    if (!featureGate.canUse("auction_create")) {
      throw new Error(featureGate.getUpgradeReason("auction_create") || "Feature auction_create is not available");
    }
    const now = Date.now();
    const created: AuctionState = {
      id: `auc-${Date.now()}`,
      listingId: input.listingId,
      status: input.startAt.getTime() > now ? "scheduled" : "live",
      startPrice: input.startPrice,
      reservePrice: input.reservePrice,
      currentBid: input.startPrice,
      bidCount: 0,
      startAt: new Date(input.startAt),
      endAt: new Date(input.endAt),
      bids: [],
      antiSnipingExtension: input.antiSnipingExtension,
      minBidIncrement: input.minBidIncrement,
    };
    created.status = deriveAuctionStatus(created, now);
    memoryAuctions = [cloneAuction(created), ...memoryAuctions];
    auctionMocks.unshift(cloneAuction(created));
    return emit(created);
  },

  async getAll() {
    const items = memoryAuctions.map((auction) => finalizeBidStatuses(withDerivedStatus(cloneAuction(auction))));
    return emit(items);
  },

  async getByListing(listingId) {
    const found = memoryAuctions.find((auction) => auction.listingId === listingId);
    return emit(found ? finalizeBidStatuses(withDerivedStatus(cloneAuction(found))) : null);
  },

  async getById(auctionId) {
    return emit(getAuctionOrNull(auctionId));
  },

  async getActive() {
    const active = (await this.getAll())
      .filter((auction) => auction.status === "live" || auction.status === "ending_soon");
    return emit(active);
  },

  async getByStatus(status) {
    const byStatus = (await this.getAll())
      .filter((auction) => auction.status === status);
    return emit(byStatus);
  },

  async getBidHistory(auctionId) {
    const auction = getAuctionOrNull(auctionId);
    return emit(auction ? [...auction.bids].sort((a, b) => b.placedAt.getTime() - a.placedAt.getTime()) : []);
  },

  async placeBid(input: PlaceBidInput) {
    const current = getAuctionOrNull(input.auctionId);
    if (!current) {
      throw new Error("Auction not found");
    }
    if (current.status === "ended" || current.status === "cancelled") {
      throw new Error("Auction is not active");
    }
    if (!canPlaceBid(current)) {
      throw new Error("Auction is not live yet");
    }
    if (
      input.bidder.bidderEligibility === "guest" ||
      input.bidder.bidderEligibility === "unverified" ||
      input.bidder.bidderEligibility === "funding_required"
    ) {
      throw new Error("У пользователя нет допуска к ставкам");
    }
    if (!input.bidder.auctionTermsAccepted) {
      throw new Error("Подтвердите условия участия в аукционе");
    }
    if (input.bidder.requiresFundingApproval || input.bidder.paymentReadiness !== "confirmed") {
      throw new Error("Подтвердите способ оплаты для участия");
    }
    if (input.autoBidMax && !input.bidder.autoBidAllowed) {
      throw new Error("Auto-bid доступен только в Premium");
    }

    const validity = isValidBidAmount(current, input.amount);
    if (!validity.valid) {
      throw new Error(validity.reason);
    }

    const events: AuctionEvent[] = [];
    const now = new Date();
    const prevWinning = [...current.bids]
      .sort((a, b) => b.placedAt.getTime() - a.placedAt.getTime())
      .find((bid) => bid.status === "winning" || bid.status === "won");

    const remainingMs = current.endAt.getTime() - now.getTime();
    let nextEndAt = current.endAt;
    if (remainingMs <= ANTISNIPING_TRIGGER_WINDOW_MS) {
      nextEndAt = new Date(current.endAt.getTime() + current.antiSnipingExtension * 60_000);
      events.push({
        type: "extended",
        auctionId: current.id,
        payload: { extendedTo: nextEndAt, extensionMinutes: current.antiSnipingExtension },
        timestamp: now,
      });
    }

    const nextBid: Bid = {
      id: `bid-${current.id}-${Date.now()}`,
      auctionId: current.id,
      bidderId: input.bidder.bidderId,
      bidderName: input.bidder.bidderName,
      amount: input.amount,
      isAutoBid: Boolean(input.autoBidMax),
      maxAutoBid: input.autoBidMax,
      placedAt: now,
      status: "winning",
    };

    const updatedAuction: AuctionState = finalizeBidStatuses(
      withDerivedStatus({
        ...current,
        endAt: nextEndAt,
        bids: [...current.bids, nextBid],
        bidCount: current.bidCount + 1,
        currentBid: input.amount,
      }),
    );

    memoryAuctions = memoryAuctions.map((auction) => (auction.id === updatedAuction.id ? cloneAuction(updatedAuction) : auction));

    events.push({
      type: "bid_placed",
      auctionId: updatedAuction.id,
      payload: { bid: nextBid },
      timestamp: now,
    });

    if (prevWinning && prevWinning.bidderId !== nextBid.bidderId) {
      events.push({
        type: "outbid",
        auctionId: updatedAuction.id,
        payload: { previousBidderId: prevWinning.bidderId, previousBidderName: prevWinning.bidderName },
        timestamp: now,
      });
    }

    if (updatedAuction.reservePrice && updatedAuction.currentBid < updatedAuction.reservePrice) {
      events.push({
        type: "reserve_not_met",
        auctionId: updatedAuction.id,
        payload: { reserveReached: false },
        timestamp: now,
      });
    }

    return emit({ auction: updatedAuction, events });
  },
};
