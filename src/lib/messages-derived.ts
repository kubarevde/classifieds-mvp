import type { Message, MessageThread } from "@/services/messages";

export type ThreadContextKind = "listing" | "request" | "store" | "none";

export type SellerLeadState = "new_lead" | "waiting_reply" | "active" | "none";

export function getThreadContextKind(thread: MessageThread): ThreadContextKind {
  if (thread.type === "support") return "none";
  if (thread.listingId) return "listing";
  if (thread.requestId) return "request";
  if (thread.storeId) return "store";
  return "none";
}

export function filterThreadsByContext(threads: MessageThread[], filter: "all" | ThreadContextKind): MessageThread[] {
  if (filter === "all") return threads;
  return threads.filter((t) => getThreadContextKind(t) === filter);
}

/** sellerActorId = `seller-account:{storeId}` */
export function getSellerLeadState(
  thread: MessageThread,
  messages: Message[],
  sellerActorId: string,
): SellerLeadState {
  const sorted = [...messages].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const buyerIds = thread.participantIds.filter((id) => id !== sellerActorId);
  const hasSellerMessage = sorted.some((m) => m.senderId === sellerActorId);
  if (!hasSellerMessage) return "new_lead";
  const last = sorted[sorted.length - 1];
  if (last && buyerIds.includes(last.senderId) && thread.unreadCount > 0) return "waiting_reply";
  if (sorted.length >= 2 && last && last.senderId === sellerActorId) return "active";
  return "none";
}

export function sellerLeadLabel(state: SellerLeadState): "Новый лид" | "Ждёт ответа" | "Активный диалог" | null {
  if (state === "new_lead") return "Новый лид";
  if (state === "waiting_reply") return "Ждёт ответа";
  if (state === "active") return "Активный диалог";
  return null;
}

export function sortThreadsForSellerInbox(
  threads: MessageThread[],
  messagesByThread: Map<string, Message[]>,
  sellerActorId: string,
): MessageThread[] {
  const score = (t: MessageThread) => {
    const msgs = messagesByThread.get(t.id) ?? [];
    const lead = getSellerLeadState(t, msgs, sellerActorId);
    const p =
      lead === "new_lead" ? 4 : lead === "waiting_reply" ? 3 : lead === "active" ? 1 : 0;
    const u = t.unreadCount > 0 ? 2 : 0;
    return p + u;
  };
  return [...threads].sort((a, b) => {
    const sb = score(b) - score(a);
    if (sb !== 0) return sb;
    return +new Date(b.lastMessageAt) - +new Date(a.lastMessageAt);
  });
}

export function partitionSellerInbox(threads: MessageThread[], messagesByThread: Map<string, Message[]>, sellerActorId: string) {
  const sorted = sortThreadsForSellerInbox(threads, messagesByThread, sellerActorId);
  const needsReply = sorted.filter((t) => {
    const lead = getSellerLeadState(t, messagesByThread.get(t.id) ?? [], sellerActorId);
    return lead === "new_lead" || lead === "waiting_reply" || t.unreadCount > 0;
  });
  const rest = sorted.filter((t) => !needsReply.some((x) => x.id === t.id));
  return { needsReply, rest };
}

export type SellerMessagingSummary = {
  avgReplyMinutes: number | null;
  answeredRatio: number;
  unreadNeedingReply: number;
  hint: string;
};

export function computeSellerMessagingSummary(
  threads: MessageThread[],
  messagesByThread: Map<string, Message[]>,
  sellerActorId: string,
): SellerMessagingSummary {
  const buyerReplyGaps: number[] = [];
  let answered = 0;
  let total = 0;
  let unreadNeedingReply = 0;

  for (const thread of threads) {
    const msgs = [...(messagesByThread.get(thread.id) ?? [])].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    if (msgs.length === 0) continue;
    total += 1;
    const hasSellerMessage = msgs.some((m) => m.senderId === sellerActorId);
    if (hasSellerMessage) answered += 1;
    const lead = getSellerLeadState(thread, msgs, sellerActorId);
    if (lead === "waiting_reply") unreadNeedingReply += 1;

    let lastBuyerAt: number | null = null;
    for (const m of msgs) {
      if (m.senderId === sellerActorId) {
        if (lastBuyerAt !== null) {
          const gapMin = (new Date(m.timestamp).getTime() - lastBuyerAt) / 60000;
          if (gapMin >= 0 && gapMin < 7 * 24 * 60) buyerReplyGaps.push(gapMin);
        }
        lastBuyerAt = null;
      } else if (!m.senderId.startsWith("seller-account:")) {
        lastBuyerAt = new Date(m.timestamp).getTime();
      }
    }
  }

  const avgReplyMinutes =
    buyerReplyGaps.length > 0 ? Math.round(buyerReplyGaps.reduce((a, b) => a + b, 0) / buyerReplyGaps.length) : null;
  const answeredRatio = total > 0 ? answered / total : 1;

  let hint = "Отвечаете стабильно — держите темп.";
  if (unreadNeedingReply > 0) {
    hint = "Есть диалоги, которые ждут ответа.";
  } else if (avgReplyMinutes !== null && avgReplyMinutes <= 30) {
    hint = "Отвечаете быстро — это повышает доверие покупателей.";
  } else if (avgReplyMinutes !== null && avgReplyMinutes > 120) {
    hint = "Можно ускорить ответы в «горячих» диалогах.";
  }

  return { avgReplyMinutes, answeredRatio, unreadNeedingReply, hint };
}

export function sortThreadsForBuyerInbox(threads: MessageThread[], pinnedIds: Set<string>): MessageThread[] {
  return [...threads].sort((a, b) => {
    const ap = pinnedIds.has(a.id) ? 1 : 0;
    const bp = pinnedIds.has(b.id) ? 1 : 0;
    if (ap !== bp) return bp - ap;
    if (a.unreadCount !== b.unreadCount) return b.unreadCount - a.unreadCount;
    return +new Date(b.lastMessageAt) - +new Date(a.lastMessageAt);
  });
}

export function formatUsualReplyMinutes(trustResponseTime: "fast" | "normal" | "slow" | undefined): string {
  if (trustResponseTime === "fast") return "Обычно отвечает за ~15 мин";
  if (trustResponseTime === "normal") return "Обычно отвечает в течение нескольких часов";
  if (trustResponseTime === "slow") return "Ответ может занять до суток";
  return "Обычно отвечает в рабочее время";
}
