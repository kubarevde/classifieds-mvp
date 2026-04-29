import type {
  ReportReason,
  ReportTargetType,
  SafetyCaseStatus,
  SafetyEvidence,
  SafetyGuideArticle,
  SafetyReport,
} from "./types";

const DEMO_BUYER_ID = "buyer-dmitriy";
const DEMO_SELLER_ID = "marina-tech";

function uid(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const SAFETY_GUIDES: SafetyGuideArticle[] = [
  {
    id: "sg1",
    slug: "oplata-vne-platformy",
    title: "Почему нельзя платить «на карту» в обход Classify",
    summary: "Переводы сторонним реквизитам лишают вас защиты сделки и усложняют расследование мошенничества.",
    content: `## Риски оплаты вне платформы

Мошенники часто просят перевести предоплату на личную карту, криптокошелёк или «друга курьера».

### Что делать

- Оплачивайте только через согласованные на Classify способы, когда они доступны.
- Если продавец настаивает на внешнем переводе — **пожалуйтесь** через центр безопасности.

### Если уже перевели

Сохраните переписку и чеки, оформите жалобу с типом **мошенничество** и опишите хронологию.`,
  },
  {
    id: "sg2",
    slug: "priznaki-moshennika",
    title: "Признаки мошеннического продавца",
    summary: "Давление, слишком низкая цена, отказ от осмотра и увод в другие мессенджеры — тревожные сигналы.",
    content: `## Типичные схемы

1. **Слишком выгодное предложение** при активном спросе на категорию.
2. **Срочность**: «только сегодня», «другие уже едут».
3. **Перенос переговоров** в Telegram/WhatsApp без следа на платформе.
4. **Предоплата 100%** до осмотра товара.

Жалобу можно подать по объявлению, пользователю или магазину — укажите скриншоты переписки в поле доказательств.`,
  },
  {
    id: "sg3",
    slug: "vstrecha-i-osmotr",
    title: "Безопасная встреча и осмотр товара",
    summary: "Выбирайте публичные места, не берите с собой крупную наличность без необходимости.",
    content: `## Рекомендации

- Встречайтесь в **людных местах** (ТЦ, фойе банка).
- Для крупной техники договоритесь об осмотре в сервисе или с экспертом.
- Не соглашайтесь на «только у меня дома», если вам это некомфортно.

При угрозах или давлении — прекратите контакт и сообщите о нарушении.`,
  },
  {
    id: "sg4",
    slug: "proverka-prodavca",
    title: "Как проверить профиль продавца и магазина",
    summary: "Сверьте срок на платформе, отзывы, совпадение контактов и историю объявлений.",
    content: `## На что смотреть

- **Витрина магазина** и стабильность контактов.
- **Согласованность** фото товара с описанием.
- **Жалобы** в прошлом (в beta — по косвенным признакам демо-данных).

Подозрительный профиль можно отправить модерации через форму жалобы.`,
  },
  {
    id: "sg5",
    slug: "kak-pozhalovatsya",
    title: "Как пожаловаться на объявление или пользователя",
    summary: "Единый поток жалоб: выберите объект, причину и опишите ситуацию — дальше работает команда доверия.",
    content: `## Шаги

1. Откройте **Центр безопасности** или кнопку «Пожаловаться» в карточке.
2. Укажите **тип объекта** (объявление, магазин, сообщение…).
3. Выберите **причину** и опишите факты (от 20 символов).
4. Приложите **ссылки** на скриншоты или чаты.

Статус жалобы можно отслеживать в разделе **Мои жалобы**. Отдельно от тикетов поддержки по аккаунту и тарифам.`,
  },
];

const seedReports: SafetyReport[] = [
  {
    id: "safety-seed-1",
    userId: DEMO_BUYER_ID,
    targetType: "listing",
    targetId: "listing-demo-1",
    targetLabel: "iPhone 14 Pro — подозрительно низкая цена",
    reason: "fraud",
    description:
      "Продавец попросил перевести предоплату 15 000 ₽ на карту физлица и удалил переписку после отказа. Сохранил скриншоты.",
    status: "under_review",
    createdAt: "2026-04-20T10:00:00.000Z",
    updatedAt: "2026-04-21T14:30:00.000Z",
    evidence: [
      { id: "e1", type: "text", value: "Скрин переписки (фрагмент): «переведите на карту …»" },
      { id: "e2", type: "link", value: "https://example.com/screenshot-placeholder" },
    ],
    adminNote: null,
  },
  {
    id: "safety-seed-2",
    userId: DEMO_BUYER_ID,
    targetType: "store",
    targetId: DEMO_SELLER_ID,
    targetLabel: "АгроТех Торговый двор",
    reason: "counterfeit",
    description:
      "Подозрение на контрафактные запчасти: маркировка не совпадает с официальной базой производителя, упаковка отличается от серии.",
    status: "action_taken",
    createdAt: "2026-04-10T09:15:00.000Z",
    updatedAt: "2026-04-18T11:00:00.000Z",
    evidence: [{ id: "e3", type: "text", value: "Фото упаковки и этикетки приложены к описанию жалобы." }],
    adminNote: "Материалы переданы на проверку поставщику; часть карточек временно скрыта из выдачи.",
  },
  {
    id: "safety-seed-3",
    userId: DEMO_SELLER_ID,
    targetType: "message",
    targetId: "conv-demo-2",
    targetLabel: "Переписка: покупатель «Алексей»",
    reason: "harassment",
    description:
      "В чате угрозы и оскорбления после отказа в скидке. Прошу принять меры и зафиксировать нарушение.",
    status: "submitted",
    createdAt: "2026-04-28T16:45:00.000Z",
    updatedAt: "2026-04-28T16:45:00.000Z",
    evidence: [],
    adminNote: null,
  },
];

let reportsState: SafetyReport[] = seedReports.map((r) => ({
  ...r,
  evidence: r.evidence.map((ev) => ({ ...ev })),
}));

export type CreateSafetyReportInput = {
  userId: string;
  targetType: ReportTargetType;
  targetId?: string | null;
  targetLabel?: string | null;
  reason: ReportReason;
  description: string;
  evidenceLines?: string[];
};

export function getSafetyGuides(): SafetyGuideArticle[] {
  return SAFETY_GUIDES.map((g) => ({ ...g }));
}

export function getSafetyGuideBySlug(slug: string): SafetyGuideArticle | null {
  return SAFETY_GUIDES.find((g) => g.slug === slug) ?? null;
}

export function getUserSafetyReports(userId: string): SafetyReport[] {
  return reportsState
    .filter((r) => r.userId === userId)
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .map((r) => ({
      ...r,
      evidence: r.evidence.map((e) => ({ ...e })),
    }));
}

export function getSafetyReportById(id: string): SafetyReport | null {
  const r = reportsState.find((row) => row.id === id);
  if (!r) {
    return null;
  }
  return { ...r, evidence: r.evidence.map((e) => ({ ...e })) };
}

export function getSafetyReportForUser(userId: string, id: string): SafetyReport | null {
  const r = reportsState.find((row) => row.id === id && row.userId === userId);
  if (!r) {
    return null;
  }
  return { ...r, evidence: r.evidence.map((e) => ({ ...e })) };
}

export function createSafetyReport(input: CreateSafetyReportInput): SafetyReport {
  const now = new Date().toISOString();
  const evidence: SafetyEvidence[] = (input.evidenceLines ?? [])
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8)
    .map((value) => ({
      id: uid("ev"),
      type: value.startsWith("http://") || value.startsWith("https://") ? ("link" as const) : ("text" as const),
      value,
    }));

  const report: SafetyReport = {
    id: uid("safety"),
    userId: input.userId,
    targetType: input.targetType,
    targetId: input.targetId?.trim() || null,
    targetLabel: input.targetLabel?.trim() || null,
    reason: input.reason,
    description: input.description.trim(),
    status: "submitted",
    createdAt: now,
    updatedAt: now,
    evidence,
    adminNote: null,
  };
  reportsState = [report, ...reportsState];
  return { ...report, evidence: report.evidence.map((e) => ({ ...e })) };
}

export type QuickSafetyTip = { id: string; title: string; body: string };

export function getQuickSafetyTips(): QuickSafetyTip[] {
  return [
    {
      id: "tip-1",
      title: "Не переводите деньги вне платформы",
      body: "Оплата «на карту» или криптой без защиты сделки — главный признак мошенничества.",
    },
    {
      id: "tip-2",
      title: "Встречайтесь в публичных местах",
      body: "Осмотр товара — в людном месте; для крупных покупок можно привлечь эксперта.",
    },
    {
      id: "tip-3",
      title: "Проверяйте профиль продавца",
      body: "Сверьте контакты, историю объявлений и отзывы; расхождения — повод насторожиться.",
    },
    {
      id: "tip-4",
      title: "Слишком низкая цена — red flag",
      body: "Если предложение сильно ниже рынка без объяснения, запросите документы и осмотр.",
    },
    {
      id: "tip-5",
      title: "Сохраняйте переписку на Classify",
      body: "Перенос в сторонние мессенджеры ухудшает доказательную базу при рассмотрении жалобы.",
    },
    {
      id: "tip-6",
      title: "Жалоба ≠ тикет поддержки",
      body: "Нарушения и мошенничество — через центр безопасности; аккаунт и тарифы — через поддержку.",
    },
  ];
}

export function resetSafetyReportsForTests() {
  reportsState = seedReports.map((r) => ({
    ...r,
    evidence: r.evidence.map((ev) => ({ ...ev })),
  }));
}

export function safetyStatusLabelRu(status: SafetyCaseStatus): string {
  const map: Record<SafetyCaseStatus, string> = {
    submitted: "Получена",
    under_review: "На рассмотрении",
    action_taken: "Приняты меры",
    resolved: "Решено",
    closed: "Закрыто",
  };
  return map[status];
}
