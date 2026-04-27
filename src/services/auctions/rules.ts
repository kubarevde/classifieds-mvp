import type { AuctionState, Bid } from "@/entities/auction/model";

export const ENDING_SOON_THRESHOLD_MS = 2 * 60_000;

export function deriveAuctionStatus(auction: AuctionState, nowMs = Date.now()): AuctionState["status"] {
  if (auction.status === "cancelled" || auction.status === "draft") {
    return auction.status;
  }
  if (nowMs < auction.startAt.getTime()) {
    return "scheduled";
  }
  if (nowMs >= auction.endAt.getTime()) {
    return "ended";
  }
  if (auction.endAt.getTime() - nowMs <= ENDING_SOON_THRESHOLD_MS) {
    return "ending_soon";
  }
  return "live";
}

export function canPlaceBid(auction: AuctionState, nowMs = Date.now()) {
  const status = deriveAuctionStatus(auction, nowMs);
  return status === "live" || status === "ending_soon";
}

export function getBidIncrement(currentBid: number, forcedIncrement?: number) {
  if (forcedIncrement && forcedIncrement > 0) {
    return forcedIncrement;
  }
  if (currentBid < 1_000) {
    return 50;
  }
  if (currentBid < 10_000) {
    return 100;
  }
  if (currentBid < 100_000) {
    return 500;
  }
  return 1_000;
}

export function getMinimumNextBid(auction: AuctionState) {
  return auction.currentBid + getBidIncrement(auction.currentBid, auction.minBidIncrement);
}

export function isValidBidAmount(auction: AuctionState, amount: number) {
  const minimum = getMinimumNextBid(auction);
  const increment = getBidIncrement(auction.currentBid, auction.minBidIncrement);
  if (amount < minimum) {
    return {
      valid: false,
      minimum,
      increment,
      reason: `Ставка должна быть не ниже ${minimum.toLocaleString("ru-RU")} ₽`,
    };
  }
  if ((amount - minimum) % increment !== 0) {
    return {
      valid: false,
      minimum,
      increment,
      reason: `Следующий шаг для этого аукциона — ${increment.toLocaleString("ru-RU")} ₽`,
    };
  }
  return { valid: true, minimum, increment };
}

export function resolveProxyBids(bids: Bid[]) {
  const ranked = bids
    .map((bid) => ({
      bid,
      max: bid.maxAutoBid ?? bid.amount,
      placedAtMs: bid.placedAt.getTime(),
    }))
    .sort((a, b) => {
      if (b.max !== a.max) {
        return b.max - a.max;
      }
      return a.placedAtMs - b.placedAtMs;
    });

  const winner = ranked[0];
  const challenger = ranked[1];
  if (!winner) {
    return null;
  }

  if (!challenger) {
    return { winnerBidId: winner.bid.id, price: winner.bid.amount };
  }

  const increment = getBidIncrement(challenger.max);
  const targetPrice = Math.min(winner.max, challenger.max + increment);
  return { winnerBidId: winner.bid.id, price: Math.max(targetPrice, winner.bid.amount) };
}
