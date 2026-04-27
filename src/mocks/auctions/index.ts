import type { AuctionState, Bid } from "@/entities/auction/model";

const now = Date.now();
const minute = 60_000;
const hour = 60 * minute;

function makeBid(
  id: string,
  auctionId: string,
  bidderId: string,
  bidderName: string,
  amount: number,
  placedAt: Date,
  status: Bid["status"],
  options?: { isAutoBid?: boolean; maxAutoBid?: number },
): Bid {
  return {
    id,
    auctionId,
    bidderId,
    bidderName,
    amount,
    isAutoBid: options?.isAutoBid ?? false,
    maxAutoBid: options?.maxAutoBid,
    placedAt,
    status,
  };
}

export const auctionMocks: AuctionState[] = [
  {
    id: "auc-1",
    listingId: "1",
    status: "live",
    startPrice: 2_200_000,
    reservePrice: 2_450_000,
    currentBid: 2_390_000,
    bidCount: 8,
    startAt: new Date(now - 5 * hour),
    endAt: new Date(now + 3 * hour),
    antiSnipingExtension: 5,
    bids: [
      makeBid("b-1-1", "auc-1", "u-101", "Илья", 2_230_000, new Date(now - 4.5 * hour), "outbid"),
      makeBid("b-1-2", "auc-1", "u-102", "Марина", 2_260_000, new Date(now - 4 * hour), "outbid"),
      makeBid("b-1-3", "auc-1", "u-103", "Артем", 2_390_000, new Date(now - 35 * minute), "winning"),
    ],
  },
  {
    id: "auc-2",
    listingId: "2",
    status: "ending_soon",
    startPrice: 70_000,
    reservePrice: 90_000,
    currentBid: 89_500,
    bidCount: 14,
    startAt: new Date(now - 9 * hour),
    endAt: new Date(now + 90 * 1000),
    antiSnipingExtension: 5,
    bids: [
      makeBid("b-2-1", "auc-2", "u-201", "Екатерина", 80_000, new Date(now - 2 * hour), "outbid"),
      makeBid("b-2-2", "auc-2", "u-202", "Влад", 85_500, new Date(now - 20 * minute), "outbid", {
        isAutoBid: true,
        maxAutoBid: 91_000,
      }),
      makeBid("b-2-3", "auc-2", "u-203", "Даниил", 89_500, new Date(now - 2 * minute), "winning"),
    ],
  },
  {
    id: "auc-3",
    listingId: "5",
    status: "live",
    startPrice: 90_000,
    reservePrice: 120_000,
    currentBid: 118_000,
    bidCount: 6,
    startAt: new Date(now - 2 * hour),
    endAt: new Date(now + 26 * hour),
    antiSnipingExtension: 5,
    bids: [
      makeBid("b-3-1", "auc-3", "u-301", "Светлана", 102_000, new Date(now - 110 * minute), "outbid"),
      makeBid("b-3-2", "auc-3", "u-302", "Николай", 112_000, new Date(now - 40 * minute), "outbid"),
      makeBid("b-3-3", "auc-3", "u-303", "Дмитрий", 118_000, new Date(now - 11 * minute), "winning"),
    ],
  },
  {
    id: "auc-4",
    listingId: "8",
    status: "ended",
    startPrice: 45_000,
    reservePrice: 52_000,
    currentBid: 54_000,
    bidCount: 10,
    startAt: new Date(now - 2 * 24 * hour),
    endAt: new Date(now - 6 * hour),
    winnerId: "u-405",
    antiSnipingExtension: 5,
    bids: [
      makeBid("b-4-1", "auc-4", "u-401", "Руслан", 49_000, new Date(now - 30 * hour), "outbid"),
      makeBid("b-4-2", "auc-4", "u-404", "Лена", 52_500, new Date(now - 9 * hour), "outbid"),
      makeBid("b-4-3", "auc-4", "u-405", "Андрей", 54_000, new Date(now - 6 * hour), "won"),
    ],
  },
  {
    id: "auc-5",
    listingId: "7",
    status: "ending_soon",
    startPrice: 1_850_000,
    reservePrice: 2_050_000,
    currentBid: 2_010_000,
    bidCount: 11,
    startAt: new Date(now - 7 * hour),
    endAt: new Date(now + 5 * minute),
    antiSnipingExtension: 5,
    bids: [
      makeBid("b-5-1", "auc-5", "u-501", "Ирина", 1_920_000, new Date(now - 4 * hour), "outbid"),
      makeBid("b-5-2", "auc-5", "u-502", "Кирилл", 1_990_000, new Date(now - 80 * minute), "outbid"),
      makeBid("b-5-3", "auc-5", "u-503", "Олег", 2_010_000, new Date(now - 80 * 1000), "winning"),
    ],
  },
  {
    id: "auc-6",
    listingId: "10",
    status: "ended",
    startPrice: 12_000_000,
    reservePrice: 15_800_000,
    currentBid: 15_100_000,
    bidCount: 4,
    startAt: new Date(now - 3 * 24 * hour),
    endAt: new Date(now - 20 * hour),
    antiSnipingExtension: 5,
    bids: [
      makeBid("b-6-1", "auc-6", "u-601", "Сергей", 13_000_000, new Date(now - 68 * hour), "outbid"),
      makeBid("b-6-2", "auc-6", "u-602", "Юлия", 14_200_000, new Date(now - 42 * hour), "outbid"),
      makeBid("b-6-3", "auc-6", "u-603", "Павел", 15_100_000, new Date(now - 21 * hour), "winning"),
    ],
  },
];
