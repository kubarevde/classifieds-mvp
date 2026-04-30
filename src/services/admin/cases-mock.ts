export type AdminCaseBlock = {
  title: string;
  body: string;
  href?: string;
};

export type AdminCaseMock = {
  id: string;
  headline: string;
  summary: string;
  subjectUserHref: string;
  subjectLabel: string;
  blocks: AdminCaseBlock[];
  timeline: { at: string; label: string }[];
};

const CASES: AdminCaseMock[] = [
  {
    id: "case-marina-billing",
    headline: "Marina Select · биллинг и жалобы",
    summary: "Связка магазина, подписки в past due и открытого тикета по оплате (mock-кейс).",
    subjectLabel: "Marina Select",
    subjectUserHref: "/admin/users/seller-account%3Amarina-tech",
    blocks: [
      { title: "Магазин", body: "Marina Select", href: "/admin/stores/marina-tech" },
      { title: "Подписка", body: "Past due / retry", href: "/admin/subscriptions/sub-marina-tech" },
      { title: "Тикет поддержки", body: "ticket-2 — вопрос по счёту", href: "/admin/support/ticket-2" },
      { title: "Модерация", body: "Очередь жалоб", href: "/admin/moderation/reports" },
    ],
    timeline: [
      { at: new Date(Date.now() - 86400000 * 3).toISOString(), label: "Создан кейс (mock)" },
      { at: new Date(Date.now() - 86400000).toISOString(), label: "Связаны сущности в консоли" },
    ],
  },
  {
    id: "case-buyer-safety",
    headline: "Дмитрий П. · безопасность и поддержка",
    summary: "Покупатель: открытые тикеты и контекст модерации (mock).",
    subjectLabel: "Дмитрий П.",
    subjectUserHref: "/admin/users/buyer-account%3Abuyer-dmitriy",
    blocks: [
      { title: "Профиль", body: "Дмитрий П.", href: "/admin/users/buyer-account%3Abuyer-dmitriy" },
      { title: "Поддержка", body: "ticket-1 — вход по почте", href: "/admin/support/ticket-1" },
      { title: "Жалобы", body: "Очередь T&S", href: "/admin/moderation/reports" },
      { title: "Продвижение", body: "prm-001 — риск / подозрительный CTR (mock)", href: "/admin/promotions/prm-001" },
    ],
    timeline: [{ at: new Date(Date.now() - 3600000).toISOString(), label: "Кейс для обзора (mock)" }],
  },
];

export function getAdminCaseById(id: string): AdminCaseMock | null {
  return CASES.find((c) => c.id === id) ?? null;
}

export function listAdminCaseSummaries(): { id: string; headline: string }[] {
  return CASES.map((c) => ({ id: c.id, headline: c.headline }));
}
