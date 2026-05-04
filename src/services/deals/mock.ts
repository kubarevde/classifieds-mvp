import { unifiedCatalogListings } from "@/lib/listings";
import { DEALS_SYSTEM_USER_ID, messagesService } from "@/services/messages";

import type { Deal, DealEvent, DealEventType, Offer } from "./types";

const DEMO_BUYER_ID = "buyer-dmitriy";

function makeSellerAccountId(storeId: string): string {
  return `seller-account:${storeId}`;
}

function pickListingId(i: number): string {
  const listing = unifiedCatalogListings[i % unifiedCatalogListings.length];
  return listing ? listing.id : "1";
}

function pickPrice(i: number): number {
  const listing = unifiedCatalogListings[i % unifiedCatalogListings.length];
  return listing ? Math.round(listing.priceValue) : 10000;
}

function isoMinusDays(d: number): string {
  return new Date(Date.now() - d * 86400000).toISOString();
}

function uid(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function ev(type: DealEventType, actorId: string, note?: string): DealEvent {
  return { id: uid("ev"), type, actorId, timestamp: new Date().toISOString(), note };
}

function normalizeSellerId(raw: string): string {
  if (raw.startsWith("seller-account:")) return raw;
  return `seller-account:${raw}`;
}

function normalizeUserIdForParty(uid: string): { buyerRaw?: string; sellerFull?: string } {
  if (uid.startsWith("buyer-account:")) {
    return { buyerRaw: uid.slice("buyer-account:".length) };
  }
  if (uid.startsWith("buyer-")) {
    return { buyerRaw: uid };
  }
  if (uid.startsWith("seller-account:")) {
    return { sellerFull: uid };
  }
  return { sellerFull: makeSellerAccountId(uid) };
}

function userMatchesDealParty(userId: string, deal: Deal): boolean {
  const { buyerRaw, sellerFull } = normalizeUserIdForParty(userId);
  if (buyerRaw && deal.buyerId === buyerRaw) return true;
  if (sellerFull && deal.sellerId === sellerFull) return true;
  return false;
}

const offersById = new Map<string, Offer>();
const dealsById = new Map<string, Deal>();
const offerThreadByOfferId = new Map<string, string>();

let seeded = false;

async function resolveListingThread(listingId: string, buyerId: string, sellerFull: string): Promise<string> {
  const threads = await messagesService.getThreadsByListingId(listingId);
  const found = threads.find((t) => t.participantIds.includes(buyerId) && t.participantIds.includes(sellerFull));
  if (found) return found.id;
  const storeId = sellerFull.startsWith("seller-account:") ? sellerFull.slice("seller-account:".length) : sellerFull;
  const t = await messagesService.createThread({
    starterId: buyerId,
    otherUserId: sellerFull,
    listingId,
    storeId,
  });
  return t.id;
}

async function postSystemMessage(threadId: string, text: string): Promise<void> {
  await messagesService.sendMessage({
    threadId,
    senderId: DEALS_SYSTEM_USER_ID,
    senderRole: "support",
    content: text,
  });
}

function putOffer(o: Offer) {
  offersById.set(o.id, { ...o });
}

function putDeal(d: Deal) {
  dealsById.set(d.id, { ...d, timeline: [...d.timeline] });
}

function seedDemo(): void {
  if (seeded) return;
  seeded = true;

  const L1 = pickListingId(1);
  const L2 = pickListingId(2);
  const L3 = pickListingId(3);
  const L4 = pickListingId(5);
  const L5 = pickListingId(8);
  const L6 = pickListingId(6);
  const p1 = pickPrice(1);
  const p2 = pickPrice(2);
  const p3 = pickPrice(3);
  const p4 = pickPrice(5);
  const p5 = pickPrice(8);
  const p6 = pickPrice(6);

  const marina = makeSellerAccountId("marina-tech");
  const alexey = makeSellerAccountId("alexey-drive");
  const ildar = makeSellerAccountId("ildar-estate");

  const offerPending: Offer = {
    id: "offer-seed-pending-1001",
    listingId: L1,
    buyerId: DEMO_BUYER_ID,
    sellerId: marina,
    amount: Math.round(p1 * 0.92),
    status: "pending",
    message: "Готов забрать сегодня вечером.",
    createdAt: isoMinusDays(1),
  };
  offerThreadByOfferId.set(offerPending.id, "thread-1001");
  putOffer(offerPending);

  const offerCountered: Offer = {
    id: "offer-seed-countered-1011",
    listingId: L5,
    buyerId: DEMO_BUYER_ID,
    sellerId: marina,
    amount: Math.round(p5 * 0.88),
    counterAmount: Math.round(p5 * 0.93),
    status: "countered",
    message: "Можем уложиться в бюджет?",
    createdAt: isoMinusDays(2),
  };
  offerThreadByOfferId.set(offerCountered.id, "thread-1011");
  putOffer(offerCountered);

  const offerActiveDeal1: Offer = {
    id: "offer-seed-accepted-ad",
    listingId: L2,
    buyerId: DEMO_BUYER_ID,
    sellerId: alexey,
    amount: Math.round(p2 * 0.91),
    status: "accepted",
    createdAt: isoMinusDays(3),
  };
  offerThreadByOfferId.set(offerActiveDeal1.id, "thread-1002");
  putOffer(offerActiveDeal1);

  const dealActive1: Deal = {
    id: "deal-demo-active-ad",
    offerId: offerActiveDeal1.id,
    listingId: L2,
    buyerId: DEMO_BUYER_ID,
    sellerId: alexey,
    amount: offerActiveDeal1.amount,
    status: "active",
    reviewEligible: false,
    buyerCompleted: false,
    sellerCompleted: false,
    timeline: [ev("deal_created", DEALS_SYSTEM_USER_ID), ev("offer_accepted", alexey)],
  };
  putDeal(dealActive1);

  const offerActiveDeal2: Offer = {
    id: "offer-seed-accepted-ie",
    listingId: L3,
    buyerId: DEMO_BUYER_ID,
    sellerId: ildar,
    amount: Math.round(p3 * 0.95),
    status: "accepted",
    createdAt: isoMinusDays(4),
  };
  offerThreadByOfferId.set(offerActiveDeal2.id, "thread-1003");
  putOffer(offerActiveDeal2);

  const dealActive2: Deal = {
    id: "deal-demo-active-ie",
    offerId: offerActiveDeal2.id,
    listingId: L3,
    buyerId: DEMO_BUYER_ID,
    sellerId: ildar,
    amount: offerActiveDeal2.amount,
    status: "active",
    reviewEligible: false,
    buyerCompleted: true,
    sellerCompleted: false,
    timeline: [
      ev("deal_created", DEALS_SYSTEM_USER_ID),
      ev("offer_accepted", ildar),
      ev("buyer_marked_complete", DEMO_BUYER_ID),
    ],
  };
  putDeal(dealActive2);

  const offerDone1: Offer = {
    id: "offer-seed-done-mt",
    listingId: L1,
    buyerId: DEMO_BUYER_ID,
    sellerId: marina,
    amount: Math.round(p1 * 0.94),
    status: "accepted",
    createdAt: isoMinusDays(10),
  };
  putOffer(offerDone1);

  const dealDone1: Deal = {
    id: "deal-demo-completed-mt",
    offerId: offerDone1.id,
    listingId: L1,
    buyerId: DEMO_BUYER_ID,
    sellerId: marina,
    amount: offerDone1.amount,
    status: "completed",
    completedAt: isoMinusDays(8),
    reviewEligible: true,
    buyerCompleted: true,
    sellerCompleted: true,
    timeline: [
      ev("deal_created", DEALS_SYSTEM_USER_ID),
      ev("offer_accepted", marina),
      ev("buyer_marked_complete", DEMO_BUYER_ID),
      ev("seller_marked_complete", marina),
      ev("deal_completed", DEALS_SYSTEM_USER_ID),
    ],
  };
  putDeal(dealDone1);

  const offerDone2: Offer = {
    id: "offer-seed-done-1012",
    listingId: L4,
    buyerId: DEMO_BUYER_ID,
    sellerId: alexey,
    amount: Math.round(p4 * 0.9),
    status: "accepted",
    createdAt: isoMinusDays(6),
  };
  offerThreadByOfferId.set(offerDone2.id, "thread-1012");
  putOffer(offerDone2);

  const dealDone2: Deal = {
    id: "deal-demo-completed-ad2",
    offerId: offerDone2.id,
    listingId: L4,
    buyerId: DEMO_BUYER_ID,
    sellerId: alexey,
    amount: offerDone2.amount,
    status: "completed",
    completedAt: isoMinusDays(5),
    reviewEligible: true,
    buyerCompleted: true,
    sellerCompleted: true,
    timeline: [
      ev("deal_created", DEALS_SYSTEM_USER_ID),
      ev("offer_accepted", alexey),
      ev("seller_marked_complete", alexey),
      ev("buyer_marked_complete", DEMO_BUYER_ID),
      ev("deal_completed", DEALS_SYSTEM_USER_ID),
    ],
  };
  putDeal(dealDone2);

  const offerCancelled: Offer = {
    id: "offer-seed-cancelled",
    listingId: L5,
    buyerId: DEMO_BUYER_ID,
    sellerId: marina,
    amount: Math.round(p5 * 0.85),
    status: "accepted",
    createdAt: isoMinusDays(7),
  };
  putOffer(offerCancelled);

  const dealCancelled: Deal = {
    id: "deal-demo-cancelled",
    offerId: offerCancelled.id,
    listingId: L5,
    buyerId: DEMO_BUYER_ID,
    sellerId: marina,
    amount: offerCancelled.amount,
    status: "cancelled",
    cancelReason: "Передумал",
    reviewEligible: false,
    buyerCompleted: false,
    sellerCompleted: false,
    timeline: [
      ev("deal_created", DEALS_SYSTEM_USER_ID),
      ev("offer_accepted", marina),
      ev("deal_cancelled", DEMO_BUYER_ID, "Передумал"),
    ],
  };
  putDeal(dealCancelled);

  const offerDisputed: Offer = {
    id: "offer-seed-disputed",
    listingId: L6,
    buyerId: DEMO_BUYER_ID,
    sellerId: alexey,
    amount: Math.round(p6 * 0.82),
    status: "accepted",
    createdAt: isoMinusDays(1),
  };
  putOffer(offerDisputed);

  const dealDisputed: Deal = {
    id: "deal-demo-disputed",
    offerId: offerDisputed.id,
    listingId: L6,
    buyerId: DEMO_BUYER_ID,
    sellerId: alexey,
    amount: offerDisputed.amount,
    status: "disputed",
    reviewEligible: false,
    buyerCompleted: false,
    sellerCompleted: false,
    timeline: [
      ev("deal_created", DEALS_SYSTEM_USER_ID),
      ev("offer_accepted", alexey),
      ev("deal_disputed", DEMO_BUYER_ID, "Расхождение по состоянию товара"),
    ],
  };
  putDeal(dealDisputed);

  /** Дополнительные завершённые сделки для демо отзывов (P33), без дубля buyer+deal. */
  const extraBuyers = [
    "buyer-maria",
    "buyer-anna",
    "buyer-ksenia",
    "buyer-vadim",
    "buyer-svetlana",
    "buyer-oleg",
    "buyer-katya",
    "buyer-nikita",
    "buyer-lera",
    "buyer-ruslan",
  ];
  const sellerRot = [marina, alexey, ildar, makeSellerAccountId("agro-tech")];
  for (let i = 0; i < 10; i++) {
    const buyer = extraBuyers[i] ?? DEMO_BUYER_ID;
    const seller = sellerRot[i % sellerRot.length]!;
    const listingId = pickListingId(10 + i);
    const offerId = `offer-rv-seed-${i}`;
    const dealId = `deal-rv-seed-${i}`;
    const amount = 5000 + i * 250;
    const o: Offer = {
      id: offerId,
      listingId,
      buyerId: buyer,
      sellerId: seller,
      amount,
      status: "accepted",
      createdAt: isoMinusDays(22 - i),
    };
    putOffer(o);
    putDeal({
      id: dealId,
      offerId: offerId,
      listingId,
      buyerId: buyer,
      sellerId: seller,
      amount,
      status: "completed",
      completedAt: isoMinusDays(16 - i),
      reviewEligible: true,
      buyerCompleted: true,
      sellerCompleted: true,
      timeline: [
        ev("deal_created", DEALS_SYSTEM_USER_ID),
        ev("offer_accepted", seller),
        ev("buyer_marked_complete", buyer),
        ev("seller_marked_complete", seller),
        ev("deal_completed", DEALS_SYSTEM_USER_ID),
      ],
    });
  }

  const offerMod = "offer-rv-mod-only";
  putOffer({
    id: offerMod,
    listingId: pickListingId(20),
    buyerId: DEMO_BUYER_ID,
    sellerId: marina,
    amount: 3333,
    status: "accepted",
    createdAt: isoMinusDays(30),
  });
  putDeal({
    id: "deal-rv-mod-only",
    offerId: offerMod,
    listingId: pickListingId(20),
    buyerId: DEMO_BUYER_ID,
    sellerId: marina,
    amount: 3333,
    status: "completed",
    completedAt: isoMinusDays(28),
    reviewEligible: true,
    buyerCompleted: true,
    sellerCompleted: true,
    timeline: [
      ev("deal_created", DEALS_SYSTEM_USER_ID),
      ev("offer_accepted", marina),
      ev("buyer_marked_complete", DEMO_BUYER_ID),
      ev("seller_marked_complete", marina),
      ev("deal_completed", DEALS_SYSTEM_USER_ID),
    ],
  });
}

export type MockDealsService = {
  getDealById(id: string): Deal | undefined;
  getDealsForUser(userId: string): Deal[];
  getDealsForSeller(sellerId: string): Deal[];
  getActiveDealsForListing(listingId: string): Deal[];
  getDealsForListing(listingId: string): Deal[];
  getOffersForListing(listingId: string): Offer[];
  getOffersForUser(userId: string): Offer[];
  createOffer(params: {
    listingId: string;
    buyerId: string;
    sellerId: string;
    amount: number;
    message?: string;
  }): Promise<Offer>;
  acceptOffer(offerId: string, actorId: string): Promise<Deal>;
  declineOffer(offerId: string, actorId: string, note?: string): Promise<Offer>;
  counterOffer(offerId: string, actorId: string, counterAmount: number, note?: string): Promise<Offer>;
  markDealCompletedByBuyer(dealId: string, actorId: string): Promise<Deal>;
  markDealCompletedBySeller(dealId: string, actorId: string): Promise<Deal>;
  cancelDeal(dealId: string, actorId: string, reason: string): Promise<Deal>;
  openDisputeForDeal(dealId: string, actorId: string, note?: string): Promise<Deal>;
};

export function createMockDealsService(): MockDealsService {
  seedDemo();

  function cloneDeal(id: string): Deal {
    const row = dealsById.get(id);
    if (!row) throw new Error("Сделка не найдена");
    return { ...row, timeline: [...row.timeline] };
  }

  return {
    getDealById(id: string) {
      const row = dealsById.get(id);
      return row ? { ...row, timeline: [...row.timeline] } : undefined;
    },

    getDealsForUser(userId: string) {
      return [...dealsById.values()].filter((d) => userMatchesDealParty(userId, d));
    },

    getDealsForSeller(sellerId: string) {
      const full = normalizeSellerId(sellerId);
      return [...dealsById.values()].filter((d) => d.sellerId === full);
    },

    getActiveDealsForListing(listingId: string) {
      return [...dealsById.values()].filter(
        (d) => d.listingId === listingId && (d.status === "active" || d.status === "disputed"),
      );
    },

    getDealsForListing(listingId: string) {
      return [...dealsById.values()]
        .filter((d) => d.listingId === listingId)
        .map((d) => ({ ...d, timeline: [...d.timeline] }));
    },

    getOffersForListing(listingId: string) {
      return [...offersById.values()].filter((o) => o.listingId === listingId);
    },

    getOffersForUser(userId: string) {
      const { buyerRaw, sellerFull } = normalizeUserIdForParty(userId);
      return [...offersById.values()].filter((o) => {
        if (buyerRaw && o.buyerId === buyerRaw) return true;
        if (sellerFull && o.sellerId === sellerFull) return true;
        return false;
      });
    },

    async createOffer(params) {
      seedDemo();
      if (params.amount <= 0) {
        throw new Error("Сумма должна быть больше нуля");
      }
      const sellerFull = normalizeSellerId(params.sellerId);
      const offer: Offer = {
        id: uid("offer"),
        listingId: params.listingId,
        buyerId: params.buyerId,
        sellerId: sellerFull,
        amount: params.amount,
        status: "pending",
        message: params.message,
        createdAt: new Date().toISOString(),
      };
      putOffer(offer);
      const threadId = await resolveListingThread(params.listingId, params.buyerId, sellerFull);
      offerThreadByOfferId.set(offer.id, threadId);
      const parts = [
        `Новое предложение цены: ${params.amount.toLocaleString("ru-RU")} ₽`,
        params.message ? `Комментарий покупателя: ${params.message}` : null,
      ].filter(Boolean);
      await postSystemMessage(threadId, parts.join("\n\n"));
      return { ...offer };
    },

    async acceptOffer(offerId, actorId) {
      seedDemo();
      const offer = offersById.get(offerId);
      if (!offer) throw new Error("Предложение не найдено");
      if (offer.sellerId !== actorId) throw new Error("Только продавец может принять предложение");
      if (offer.status !== "pending" && offer.status !== "countered") {
        throw new Error("Предложение уже обработано");
      }
      const finalAmount = offer.counterAmount ?? offer.amount;
      const updatedOffer: Offer = { ...offer, status: "accepted" };
      putOffer(updatedOffer);

      const deal: Deal = {
        id: uid("deal"),
        offerId: offer.id,
        listingId: offer.listingId,
        buyerId: offer.buyerId,
        sellerId: offer.sellerId,
        amount: finalAmount,
        status: "active",
        reviewEligible: false,
        buyerCompleted: false,
        sellerCompleted: false,
        timeline: [ev("offer_accepted", actorId), ev("deal_created", DEALS_SYSTEM_USER_ID)],
      };
      putDeal(deal);

      const threadId = offerThreadByOfferId.get(offerId) ?? (await resolveListingThread(offer.listingId, offer.buyerId, offer.sellerId));
      offerThreadByOfferId.set(offerId, threadId);
      await postSystemMessage(
        threadId,
        `Продавец принял предложение. Создана сделка на сумму ${finalAmount.toLocaleString("ru-RU")} ₽.\n\nОткрыть сделку: /deals/${deal.id}`,
      );
      return cloneDeal(deal.id);
    },

    async declineOffer(offerId, actorId, note) {
      seedDemo();
      const offer = offersById.get(offerId);
      if (!offer) throw new Error("Предложение не найдено");
      if (offer.sellerId !== actorId) throw new Error("Только продавец может отклонить предложение");
      if (offer.status !== "pending" && offer.status !== "countered") {
        throw new Error("Предложение уже обработано");
      }
      const next: Offer = { ...offer, status: "declined" };
      putOffer(next);
      const threadId = offerThreadByOfferId.get(offerId) ?? (await resolveListingThread(offer.listingId, offer.buyerId, offer.sellerId));
      await postSystemMessage(threadId, `Продавец отклонил предложение.${note ? ` Комментарий: ${note}` : ""}`);
      return { ...next };
    },

    async counterOffer(offerId, actorId, counterAmount, note) {
      seedDemo();
      const offer = offersById.get(offerId);
      if (!offer) throw new Error("Предложение не найдено");
      if (offer.sellerId !== actorId) throw new Error("Только продавец может сделать встречное предложение");
      if (offer.status !== "pending" && offer.status !== "countered") {
        throw new Error("Предложение уже обработано");
      }
      if (counterAmount <= 0) throw new Error("Сумма должна быть больше нуля");
      const next: Offer = { ...offer, status: "countered", counterAmount };
      putOffer(next);
      const threadId = offerThreadByOfferId.get(offerId) ?? (await resolveListingThread(offer.listingId, offer.buyerId, offer.sellerId));
      await postSystemMessage(
        threadId,
        `Продавец сделал встречное предложение: ${counterAmount.toLocaleString("ru-RU")} ₽.${note ? ` Комментарий: ${note}` : ""}`,
      );
      return { ...next };
    },

    async markDealCompletedByBuyer(dealId, actorId) {
      seedDemo();
      const deal = dealsById.get(dealId);
      if (!deal) throw new Error("Сделка не найдена");
      if (deal.buyerId !== actorId) throw new Error("Только покупатель может отметить с этой стороны");
      if (deal.status !== "active") throw new Error("Сделка не в статусе «активна»");
      const next: Deal = {
        ...deal,
        buyerCompleted: true,
        timeline: [...deal.timeline, ev("buyer_marked_complete", actorId)],
      };
      if (next.sellerCompleted) {
        next.status = "completed";
        next.completedAt = new Date().toISOString();
        next.reviewEligible = true;
        next.timeline = [...next.timeline, ev("deal_completed", DEALS_SYSTEM_USER_ID)];
      }
      putDeal(next);
      const threadId = await resolveListingThread(next.listingId, next.buyerId, next.sellerId);
      await postSystemMessage(
        threadId,
        next.status === "completed"
          ? `Сделка завершена обеими сторонами. Можно оставить отзыв: /reviews/new?dealId=${next.id}`
          : "Покупатель отметил сделку как завершённую со своей стороны.",
      );
      return cloneDeal(dealId);
    },

    async markDealCompletedBySeller(dealId, actorId) {
      seedDemo();
      const deal = dealsById.get(dealId);
      if (!deal) throw new Error("Сделка не найдена");
      if (deal.sellerId !== actorId) throw new Error("Только продавец может отметить с этой стороны");
      if (deal.status !== "active") throw new Error("Сделка не в статусе «активна»");
      const next: Deal = {
        ...deal,
        sellerCompleted: true,
        timeline: [...deal.timeline, ev("seller_marked_complete", actorId)],
      };
      if (next.buyerCompleted) {
        next.status = "completed";
        next.completedAt = new Date().toISOString();
        next.reviewEligible = true;
        next.timeline = [...next.timeline, ev("deal_completed", DEALS_SYSTEM_USER_ID)];
      }
      putDeal(next);
      const threadId = await resolveListingThread(next.listingId, next.buyerId, next.sellerId);
      await postSystemMessage(
        threadId,
        next.status === "completed"
          ? `Сделка завершена обеими сторонами. Можно оставить отзыв: /reviews/new?dealId=${next.id}`
          : "Продавец отметил сделку как завершённую со своей стороны.",
      );
      return cloneDeal(dealId);
    },

    async cancelDeal(dealId, actorId, reason) {
      seedDemo();
      const deal = dealsById.get(dealId);
      if (!deal) throw new Error("Сделка не найдена");
      if (deal.buyerId !== actorId && deal.sellerId !== actorId) {
        throw new Error("Нет прав на отмену этой сделки");
      }
      if (deal.status !== "active") throw new Error("Можно отменить только активную сделку");
      const next: Deal = {
        ...deal,
        status: "cancelled",
        cancelReason: reason,
        reviewEligible: false,
        timeline: [...deal.timeline, ev("deal_cancelled", actorId, reason)],
      };
      putDeal(next);
      const threadId = await resolveListingThread(next.listingId, next.buyerId, next.sellerId);
      await postSystemMessage(threadId, `Сделка отменена. Причина: ${reason}`);
      return cloneDeal(dealId);
    },

    async openDisputeForDeal(dealId, actorId, note) {
      seedDemo();
      const deal = dealsById.get(dealId);
      if (!deal) throw new Error("Сделка не найдена");
      if (deal.buyerId !== actorId && deal.sellerId !== actorId) {
        throw new Error("Нет прав на спор по этой сделке");
      }
      if (deal.status !== "active") throw new Error("Спор можно открыть только для активной сделки");
      const next: Deal = {
        ...deal,
        status: "disputed",
        timeline: [...deal.timeline, ev("deal_disputed", actorId, note)],
      };
      putDeal(next);
      const threadId = await resolveListingThread(next.listingId, next.buyerId, next.sellerId);
      await postSystemMessage(threadId, `Открыт спор по сделке.${note ? ` Комментарий: ${note}` : ""}`);
      return cloneDeal(dealId);
    },
  };
}
