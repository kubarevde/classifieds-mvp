import { dealsService } from "@/services/deals";
import { messagesService, REVIEWS_SYSTEM_USER_ID } from "@/services/messages";

import type { Review, ReviewEligibility, ReviewReply, ReviewStatus, ReviewSummary, ReviewTargetType } from "./types";

const reviewsById = new Map<string, Review>();
let seeded = false;

function uid(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeBuyerTargetId(raw: string): string {
  if (raw.startsWith("buyer-account:")) return raw.slice("buyer-account:".length);
  return raw;
}

function normalizeTargetKey(targetId: string, targetType: ReviewTargetType): string {
  return targetType === "buyer" ? normalizeBuyerTargetId(targetId) : targetId;
}

function storeSlugFromSellerId(sellerFull: string): string {
  return sellerFull.startsWith("seller-account:") ? sellerFull.slice("seller-account:".length) : sellerFull;
}

const authorLabels: Record<string, string> = {
  "buyer-dmitriy": "Дмитрий П.",
  "buyer-maria": "Мария К.",
  "buyer-anna": "Анна В.",
  "buyer-ksenia": "Ксения Л.",
  "buyer-vadim": "Вадим С.",
  "buyer-svetlana": "Светлана Н.",
  "buyer-oleg": "Олег П.",
  "buyer-katya": "Катя Л.",
  "buyer-nikita": "Никита Г.",
  "buyer-lera": "Лера Д.",
  "buyer-ruslan": "Руслан С.",
  "seller-account:marina-tech": "Marina Tech",
  "seller-account:alexey-drive": "АвтоГрад Алексей",
  "seller-account:ildar-estate": "Ильдар · Недвижимость",
  "seller-account:agro-tech": "АгроТех",
};

function labelFor(userId: string): string {
  return authorLabels[userId] ?? userId;
}

function put(r: Review) {
  reviewsById.set(r.id, { ...r, reply: r.reply ? { ...r.reply } : undefined });
}

function seedReviews(): void {
  if (seeded) return;
  seeded = true;

  const mk = (
    id: string,
    dealId: string,
    authorId: string,
    targetType: ReviewTargetType,
    targetId: string,
    rating: Review["rating"],
    text: string,
    status: ReviewStatus,
    opts: { reply?: ReviewReply; flagReason?: string; createdOffsetDays?: number } = {},
  ) => {
    const createdAt = new Date(Date.now() - (opts.createdOffsetDays ?? 3) * 86400000).toISOString();
    put({
      id,
      dealId,
      authorId,
      authorDisplayName: labelFor(authorId),
      targetId,
      targetType,
      rating,
      text,
      createdAt,
      reply: opts.reply,
      status,
      flagReason: opts.flagReason,
    });
  };

  mk("rv-1", "deal-demo-completed-mt", "buyer-dmitriy", "store", "marina-tech", 5, "Всё честно, товар как в описании. Рекомендую.", "published", {
    reply: {
      authorId: "seller-account:marina-tech",
      text: "Спасибо, будем рады снова помочь с подбором.",
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    createdOffsetDays: 12,
  });

  mk("rv-2", "deal-rv-seed-0", "buyer-maria", "store", "marina-tech", 4, "Хорошая коммуникация, небольшая задержка на доставку.", "published", {
    createdOffsetDays: 9,
  });
  mk("rv-3", "deal-rv-seed-1", "buyer-anna", "store", "marina-tech", 5, "Проверенная сделка, документы в порядке.", "published", { createdOffsetDays: 8 });
  mk("rv-4", "deal-rv-seed-2", "buyer-ksenia", "store", "alexey-drive", 5, "Авто ровно как на фото, пробег подтверждён.", "published", {
    reply: { authorId: "seller-account:alexey-drive", text: "Благодарим за отзыв!", createdAt: new Date(Date.now() - 86400000).toISOString() },
    createdOffsetDays: 11,
  });
  mk("rv-5", "deal-rv-seed-3", "buyer-vadim", "store", "agro-tech", 5, "Надёжный поставщик, техника в срок.", "published", { createdOffsetDays: 7 });
  mk("rv-6", "deal-rv-seed-4", "buyer-svetlana", "store", "ildar-estate", 4, "Профессиональный подход к просмотру.", "published", { createdOffsetDays: 6 });
  mk("rv-7", "deal-rv-seed-5", "buyer-oleg", "store", "marina-tech", 3, "Товар ок, но хотелось бы больше фото заранее.", "flagged", {
    flagReason: "ложная информация",
    createdOffsetDays: 5,
  });
  mk("rv-8", "deal-rv-seed-6", "buyer-katya", "store", "alexey-drive", 2, "Не сошлись ожидания по комплектации.", "published", { createdOffsetDays: 4 });
  mk("rv-9", "deal-rv-seed-7", "buyer-nikita", "store", "marina-tech", 5, "Быстро отвечает, всё прозрачно.", "published", { createdOffsetDays: 3 });
  mk("rv-10", "deal-rv-seed-8", "buyer-lera", "store", "ildar-estate", 4, "Хорошая консультация по ипотеке.", "published", { createdOffsetDays: 2 });
  mk("rv-11", "deal-rv-seed-9", "buyer-ruslan", "store", "agro-tech", 5, "Качество на уровне, документы полные.", "published", { createdOffsetDays: 1 });

  mk("rv-12", "deal-demo-completed-ad2", "seller-account:alexey-drive", "buyer", "buyer-dmitriy", 5, "Пунктуальный покупатель, сделка без сюрпризов.", "published", {
    createdOffsetDays: 10,
  });

  mk("rv-13", "deal-rv-seed-0", "seller-account:marina-tech", "buyer", "buyer-maria", 5, "Адекватный диалог, рекомендую как покупателя.", "published", {
    createdOffsetDays: 9,
  });

  mk("rv-14", "deal-rv-seed-2", "seller-account:alexey-drive", "buyer", "buyer-ksenia", 4, "Всё по договорённости.", "published", { createdOffsetDays: 7 });

  mk("rv-15", "deal-rv-seed-4", "seller-account:ildar-estate", "buyer", "buyer-svetlana", 5, "Ответственный клиент.", "published", { createdOffsetDays: 5 });

  mk("rv-16", "deal-rv-mod-only", "buyer-dmitriy", "store", "marina-tech", 1, "Удалённый демо-отзыв (контент удалён модератором).", "removed", {
    flagReason: "оскорбление",
    createdOffsetDays: 20,
  });

  mk("rv-17", "deal-rv-seed-3", "buyer-vadim", "store", "alexey-drive", 4, "Жалоба в модерации (демо).", "flagged", { flagReason: "спам", createdOffsetDays: 2 });

}

async function postDealThreadReviewNote(dealId: string, line: string): Promise<void> {
  const deal = dealsService.getDealById(dealId);
  if (!deal) return;
  const threads = await messagesService.getThreadsByListingId(deal.listingId);
  const thread = threads.find((t) => t.participantIds.includes(deal.buyerId) && t.participantIds.includes(deal.sellerId));
  if (!thread) return;
  await messagesService.sendMessage({
    threadId: thread.id,
    senderId: REVIEWS_SYSTEM_USER_ID,
    senderRole: "support",
    content: line,
  });
}

function distributionFrom(rows: Review[]): ReviewSummary["distribution"] {
  const d: ReviewSummary["distribution"] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of rows) {
    d[r.rating] += 1;
  }
  return d;
}

function highlightsFrom(rows: Review[]): string[] {
  const h: string[] = [];
  if (rows.some((r) => r.rating >= 4 && /быстро|ответ/i.test(r.text))) h.push("Быстро отвечает");
  if (rows.some((r) => r.rating >= 4 && /описан|соответств/i.test(r.text))) h.push("Товар соответствует описанию");
  if (rows.some((r) => r.rating >= 4 && /надёжн|пунктуальн/i.test(r.text))) h.push("Надёжный контрагент");
  return h.slice(0, 3);
}

function computeSummary(targetId: string, targetType: ReviewTargetType, publicOnly: boolean): ReviewSummary {
  const rows = [...reviewsById.values()].filter((r) => {
    if (r.targetType !== targetType) return false;
    if (normalizeTargetKey(r.targetId, targetType) !== targetId) return false;
    if (publicOnly && r.status !== "published") return false;
    if (!publicOnly && r.status === "removed") return false;
    return true;
  });
  const total = rows.length;
  const avg = total ? rows.reduce((s, r) => s + r.rating, 0) / total : 0;
  return {
    targetId,
    targetType,
    avgRating: total ? Math.round(avg * 10) / 10 : 0,
    totalCount: total,
    distribution: distributionFrom(rows),
    highlights: highlightsFrom(rows),
  };
}

export function createMockReviewsService() {
  seedReviews();

  function getReviewEligibilityImpl(dealId: string, actorId: string): ReviewEligibility {
    const deal = dealsService.getDealById(dealId);
    if (!deal) {
      return { dealId, actorId, canReview: false, reason: "deal_not_found" };
    }
    if (deal.buyerId !== actorId && deal.sellerId !== actorId) {
      return { dealId, actorId, canReview: false, reason: "not_participant" };
    }
    if (deal.status !== "completed" || !deal.reviewEligible) {
      return { dealId, actorId, canReview: false, reason: "deal_not_completed" };
    }
    const exists = [...reviewsById.values()].some((r) => r.dealId === dealId && r.authorId === actorId);
    if (exists) {
      return { dealId, actorId, canReview: false, reason: "already_reviewed" };
    }
    if (deal.buyerId === actorId) {
      return {
        dealId,
        actorId,
        canReview: true,
        targetId: storeSlugFromSellerId(deal.sellerId),
        targetType: "store",
      };
    }
    return {
      dealId,
      actorId,
      canReview: true,
      targetId: normalizeBuyerTargetId(deal.buyerId),
      targetType: "buyer",
    };
  }

  return {
    getReviewById(id: string) {
      const r = reviewsById.get(id);
      return r ? { ...r, reply: r.reply ? { ...r.reply } : undefined } : undefined;
    },

    getReviewsForTarget(targetId: string, targetType: ReviewTargetType) {
      const key = normalizeTargetKey(targetId, targetType);
      return [...reviewsById.values()].filter(
        (r) => r.targetType === targetType && normalizeTargetKey(r.targetId, targetType) === key,
      );
    },

    getReviewsAuthoredByUser(userId: string) {
      const raw = normalizeBuyerTargetId(userId);
      return [...reviewsById.values()].filter((r) => r.authorId === userId || r.authorId === raw || normalizeBuyerTargetId(r.authorId) === raw);
    },

    getReviewsForListing(listingId: string) {
      const dealIds = new Set(dealsService.getDealsForListing(listingId).map((d) => d.id));
      return [...reviewsById.values()].filter((r) => dealIds.has(r.dealId));
    },

    getReviewSummary(targetId: string, targetType: ReviewTargetType) {
      const key = normalizeTargetKey(targetId, targetType);
      return computeSummary(key, targetType, true);
    },

    getFlaggedReviews() {
      return [...reviewsById.values()].filter((r) => r.status === "flagged");
    },

    getPendingReplyReviewsForSeller(sellerId: string) {
      const slug = sellerId.startsWith("seller-account:") ? sellerId.slice("seller-account:".length) : sellerId;
      return [...reviewsById.values()].filter(
        (r) => r.targetType === "store" && r.targetId === slug && r.status === "published" && !r.reply,
      );
    },

    getReviewEligibility(dealId: string, actorId: string): ReviewEligibility {
      return getReviewEligibilityImpl(dealId, actorId);
    },

    async createReview(params: { dealId: string; authorId: string; rating: Review["rating"]; text: string }): Promise<Review> {
      const el = getReviewEligibilityImpl(params.dealId, params.authorId);
      if (!el.canReview || !el.targetId || !el.targetType) {
        throw new Error(el.reason ?? "Нельзя оставить отзыв");
      }
      const deal = dealsService.getDealById(params.dealId);
      if (!deal) throw new Error("Сделка не найдена");
      const r: Review = {
        id: uid("rv"),
        dealId: params.dealId,
        authorId: params.authorId,
        authorDisplayName: labelFor(params.authorId),
        targetId: el.targetId,
        targetType: el.targetType,
        rating: params.rating,
        text: params.text.trim(),
        createdAt: new Date().toISOString(),
        status: "published",
      };
      put(r);
      const who = deal.buyerId === params.authorId ? "Покупатель" : "Продавец";
      await postDealThreadReviewNote(params.dealId, `${who} оставил отзыв по сделке (${params.rating}★).`);
      return { ...r };
    },

    async replyToReview(reviewId: string, authorId: string, text: string): Promise<Review> {
      const r = reviewsById.get(reviewId);
      if (!r) throw new Error("Отзыв не найден");
      if (r.reply) throw new Error("Ответ уже опубликован");
      if (r.targetType === "store") {
        const expected = `seller-account:${r.targetId}`;
        if (authorId !== expected) throw new Error("Только владелец магазина может ответить");
      } else if (r.targetType === "buyer") {
        const buyerNorm = normalizeBuyerTargetId(r.targetId);
        const okBuyer = authorId === buyerNorm || authorId === `buyer-account:${buyerNorm}`;
        if (!okBuyer) throw new Error("Только покупатель может ответить на этот отзыв");
      }
      const next: Review = {
        ...r,
        reply: { authorId, text: text.trim(), createdAt: new Date().toISOString() },
      };
      put(next);
      await postDealThreadReviewNote(r.dealId, "Опубликован ответ на отзыв по сделке.");
      return { ...next, reply: next.reply ? { ...next.reply } : undefined };
    },

    async flagReview(reviewId: string, actorId: string, reason: string): Promise<Review> {
      void actorId;
      const r = reviewsById.get(reviewId);
      if (!r) throw new Error("Отзыв не найден");
      const next: Review = { ...r, status: "flagged", flagReason: reason };
      put(next);
      return { ...next };
    },

    async approveReview(reviewId: string, actorId: string): Promise<Review> {
      void actorId;
      const r = reviewsById.get(reviewId);
      if (!r) throw new Error("Отзыв не найден");
      const next: Review = { ...r, status: "published", flagReason: undefined };
      put(next);
      return { ...next };
    },

    async removeReview(reviewId: string, actorId: string, reason?: string): Promise<Review> {
      void actorId;
      const r = reviewsById.get(reviewId);
      if (!r) throw new Error("Отзыв не найден");
      const next: Review = { ...r, status: "removed", flagReason: reason ?? r.flagReason };
      put(next);
      return { ...next };
    },
  };
}

export type MockReviewsService = ReturnType<typeof createMockReviewsService>;
