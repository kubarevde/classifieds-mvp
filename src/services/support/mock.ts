import type { HelpArticle, HelpCategory, SupportCategory, SupportTicket, TicketMessage } from "./types";

const DEMO_BUYER_ID = "buyer-dmitriy";
const DEMO_SELLER_STORE_ID = "marina-tech";

function uid(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const HELP_ARTICLES: HelpArticle[] = [
  {
    id: "a1",
    categorySlug: "account",
    slug: "vhod-i-vosstanovlenie-parolya",
    title: "Вход и восстановление пароля",
    summary: "Что делать, если не приходит письмо и как безопасно сбросить пароль.",
    content: `## Вход по e-mail

На Classify вход привязан к адресу электронной почты. После ввода e-mail вы получите одноразовую ссылку или код — в зависимости от настроек окружения.

### Письмо не приходит

1. Проверьте папку **Спам** и фильтры корпоративной почты.
2. Убедитесь, что адрес введён без опечаток.
3. Подождите 2–3 минуты и запросите код повторно — частые запросы могут временно блокироваться антиботом.

### Сброс пароля

Используйте форму «Забыли пароль» на экране входа. Ссылка действует ограниченное время. Если срок истёк, запросите новую.

После входа рекомендуем включить уведомления о входе с нового устройства (когда появится в продукте).`,
  },
  {
    id: "a2",
    categorySlug: "account",
    slug: "verifikaciya-akkaunta",
    title: "Верификация аккаунта",
    summary: "Зачем нужна верификация и какие данные могут запросить.",
    content: `## Зачем верифицировать профиль

Верификация снижает риск мошенничества и повышает доверие при откликах на объявления и запросы.

### Этапы

1. Подтверждение телефона по SMS.
2. Подтверждение e-mail.
3. Для магазинов — проверка реквизитов и витрины (в beta может отличаться).

Данные хранятся согласно политике конфиденциальности и используются только для проверки и поддержки.`,
  },
  {
    id: "a3",
    categorySlug: "account",
    slug: "udalenie-akkaunta",
    title: "Удаление аккаунта",
    summary: "Как подать заявку на удаление и что произойдёт с объявлениями.",
    content: `## Удаление учётной записи

Удаление — необратимая операция для личных данных профиля в рамках действующего законодательства.

### Перед удалением

- Завершите активные сделки и переписки.
- Выведите или закройте платные подписки (после подключения оплаты).

### Как подать заявку

Напишите в поддержку из раздела **Поддержка** с темой «Удаление аккаунта». Укажите e-mail аккаунта. Мы подтвердим личность и выполним удаление в срок, который сообщит оператор.

Опубликованные объявления будут сняты с показа вместе с аккаунтом.`,
  },
  {
    id: "a4",
    categorySlug: "listing",
    slug: "kak-opublikovat-obyavlenie",
    title: "Как опубликовать объявление",
    summary: "Пошагово: черновик, фото, цена и публикация.",
    content: `## Публикация объявления

1. Откройте **Создать объявление** и выберите мир и категорию.
2. Заполните заголовок и описание — чем конкретнее, тем выше отклик.
3. Добавьте честные фото и укажите реальное состояние товара.
4. Проверьте цену и способ связи.
5. Нажмите **Опубликовать**.

После публикации объявление попадает в модерационный контур (если включён) и в каталог. Редактирование доступно из личного кабинета.`,
  },
  {
    id: "a5",
    categorySlug: "listing",
    slug: "pravila-razmeshcheniya",
    title: "Правила размещения",
    summary: "Запрещённый контент, дубликаты и ограничения по категориям.",
    content: `## Основные правила

- Запрещены illegal-товары и услуги, нарушающие закон РФ.
- Нельзя дублировать одно и то же объявление многократно.
- Запрещена навязчивая реклама сторонних площадок вместо сделки.
- Фото и текст должны соответствовать реальному предмету продажи.

Нарушения приводят к снятию объявления и предупреждению; системные нарушения — к блокировке аккаунта.`,
  },
  {
    id: "a6",
    categorySlug: "listing",
    slug: "kak-udalit-obyavlenie",
    title: "Как удалить объявление",
    summary: "Снятие с публикации и полное удаление из кабинета.",
    content: `## Удаление из кабинета

В разделе **Мои объявления** откройте карточку и выберите **Снять с публикации** или **Удалить**.

Снятие сохраняет черновик для повторной публикации. Полное удаление убирает карточку из истории (кроме случаев, когда требуется хранение по закону).`,
  },
  {
    id: "a7",
    categorySlug: "payment",
    slug: "tarify-i-plany",
    title: "Тарифы и планы для магазина",
    summary: "Чем отличаются планы и как считаются лимиты.",
    content: `## Тарифы

Планы **Starter**, **Pro** и **Business** отличаются лимитами на активные объявления, глубину аналитики и маркетинговые инструменты.

Лимиты обновляются каждый биллинг-цикл. При downgrade сверхлимитные объявления остаются видимыми, но новые создать нельзя, пока не освободите слоты.

Подробная таблица — на странице **Тарифы**.`,
  },
  {
    id: "a8",
    categorySlug: "payment",
    slug: "oplata-i-cheki",
    title: "Оплата и чеки",
    summary: "Как будет работать оплата после подключения backend.",
    content: `## Оплата (beta)

Сейчас оплата в интерфейсе демонстрационная. После подключения платёжного провайдера вы сможете:

- оплачивать подписку банковской картой;
- получать чек на e-mail;
- видеть историю платежей в кабинете магазина.

Если списание прошло, а доступ не открылся, приложите скриншот и время операции в обращении к поддержке.`,
  },
  {
    id: "a9",
    categorySlug: "payment",
    slug: "vozvrat-sredstv",
    title: "Возврат средств",
    summary: "Условия возврата за подписку и спорные списания.",
    content: `## Возврат

Для подписочных продуктов действует политика возврата, согласованная офертой. В спорных случаях откройте тикет с категорией **Оплата** и приложите детали платежа.

Мы рассматриваем заявки в порядке очереди и возвращаем средства на исходный способ оплаты, если основания подтверждаются.`,
  },
  {
    id: "a10",
    categorySlug: "safety",
    slug: "kak-raspoznat-moshennikov",
    title: "Как распознать мошенников",
    summary: "Типичные схемы и красные флаги при сделке.",
    content: `## Красные флаги

- Просьба перевести предоплату на «левую» карту без подтверждения заказа на платформе.
- Давление «только сейчас» и отказ от безопасной сделки без веской причины.
- Ссылки на сторонние мессенджеры до договорённости о товаре.

Проверяйте рейтинг продавца, историю отзывов и используйте официальные каналы связи Classify.`,
  },
  {
    id: "a11",
    categorySlug: "safety",
    slug: "pozhalovatsya-na-obyavlenie",
    title: "Пожаловаться на объявление",
    summary: "Как отправить жалобу и что рассмотрит модерация.",
    content: `## Жалоба

В карточке объявления выберите **Пожаловаться** и укажите причину: спам, запрещённый товар, обман и т.д.

Модерация проверяет жалобы в рабочие сроки. Результат может быть: снятие объявления, предупреждение продавцу или отклонение жалобы с объяснением.

Не используйте жалобы для конкурентных атак — это нарушает правила сообщества.`,
  },
  {
    id: "a12",
    categorySlug: "safety",
    slug: "bezopasnaya-sdelka",
    title: "Безопасная сделка офлайн",
    summary: "Рекомендации при встрече и передаче товара.",
    content: `## Встреча с продавцом

- Выбирайте публичное место в светлое время суток.
- Проверяйте товар до перевода денег.
- Сохраняйте переписку в Classify — она поможет при споре.

Мы не гарантируем офлайн-сделки, но помогаем в разборе инцидентов при наличии доказательств в чате платформы.`,
  },
  {
    id: "a13",
    categorySlug: "store",
    slug: "otkrytie-magazina",
    title: "Открытие магазина на Classify",
    summary: "Шаги для бизнес-витрины и отличия от частного продавца.",
    content: `## Магазин

Магазин даёт витрину, аналитику и маркетинговые инструменты. Подключение начинается с заполнения реквизитов и базовых настроек витрины.

Частный продавец может размещать объявления без витрины; магазин ориентирован на компании и бренды с постоянным ассортиментом.`,
  },
  {
    id: "a14",
    categorySlug: "store",
    slug: "nastrojki-vitriny",
    title: "Настройки витрины",
    summary: "Логотип, описание, контакты и мир по умолчанию.",
    content: `## Витрина

В кабинете магазина задайте:

- название и короткое описание;
- город и регион;
- телефон и мессенджеры;
- посты и закреплённые материалы.

Изменения отображаются на публичной странице \`/stores/{id}\` после сохранения.`,
  },
  {
    id: "a15",
    categorySlug: "store",
    slug: "prodvizhenie-i-marketing",
    title: "Продвижение и маркетинг",
    summary: "Кампании, купоны и герой-доска — краткий обзор.",
    content: `## Инструменты роста

В кабинете доступны купоны, кампании показов, бусты карточек и размещение на герой-доске (по тарифу).

Каждый инструмент имеет лимиты плана. Перед запуском проверьте **Feature gate** и подсказки в интерфейсе.`,
  },
  {
    id: "a16",
    categorySlug: "other",
    slug: "platform-rules",
    title: "Правила платформы Classify",
    summary: "Базовые правила сообщества и сервиса.",
    content: `## Правила

1. Уважительное общение в чатах и откликах.
2. Запрет на обход комиссий и правил сделки, если они введены платформой.
3. Актуальные юридические документы публикуются на сайте; продолжая пользоваться сервисом, вы принимаете обновления с даты вступления.

Споры решаются через поддержку и модерацию.`,
  },
  {
    id: "a17",
    categorySlug: "other",
    slug: "obratnaya-svyaz",
    title: "Обратная связь по продукту",
    summary: "Как предложить улучшение или сообщить об ошибке интерфейса.",
    content: `## Мы слушаем

Ошибки интерфейса удобно отправлять через кнопку **Сообщить о проблеме** на экране ошибки — тема и страница подставятся автоматически.

Идеи по продукту можно описать в тикете с категорией **Другое**: мы передаём их команде разработки.`,
  },
  {
    id: "a18",
    categorySlug: "other",
    slug: "chasto-zadavaemye-voprosy",
    title: "Часто задаваемые вопросы",
    summary: "Быстрые ответы про beta и демо-режим.",
    content: `## Beta и демо

**Classify** сейчас работает на демо-данных: роли переключаются в интерфейсе, оплата не списывается по-настоящему.

Когда подключится backend, авторизация и тикеты будут связаны с вашим аккаунтом. До этого тикеты хранятся в памяти сессии браузера для прототипа поддержки.`,
  },
];

function countArticles(slug: SupportCategory) {
  return HELP_ARTICLES.filter((a) => a.categorySlug === slug).length;
}

export const HELP_CATEGORIES: HelpCategory[] = [
  { slug: "account", title: "Аккаунт и доступ", icon: "user", articleCount: countArticles("account") },
  { slug: "listing", title: "Объявления", icon: "fileText", articleCount: countArticles("listing") },
  { slug: "payment", title: "Оплата и тарифы", icon: "creditCard", articleCount: countArticles("payment") },
  { slug: "safety", title: "Безопасность", icon: "shield", articleCount: countArticles("safety") },
  { slug: "store", title: "Магазин", icon: "store", articleCount: countArticles("store") },
  { slug: "other", title: "Другое", icon: "helpCircle", articleCount: countArticles("other") },
];

function seedTickets(): SupportTicket[] {
  const t1: SupportTicket = {
    id: "ticket-1",
    userId: DEMO_BUYER_ID,
    category: "account",
    subject: "Не приходит письмо для входа",
    message: "Пробовал три раза, почта на Gmail.",
    status: "open",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    messages: [
      {
        id: "m1",
        ticketId: "ticket-1",
        authorRole: "user",
        text: "Пробовал три раза, почта на Gmail.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
      },
      {
        id: "m2",
        ticketId: "ticket-1",
        authorRole: "support",
        text: "Здравствуйте! Проверьте папку «Промоакции» и фильтры Gmail. Если пусто — напишите альтернативный адрес для теста.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
    ],
  };

  const t2: SupportTicket = {
    id: "ticket-2",
    userId: DEMO_BUYER_ID,
    category: "payment",
    subject: "Вопрос по счёту за тариф",
    message: "Нужен акт за прошлый месяц.",
    status: "in_progress",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    messages: [
      {
        id: "m3",
        ticketId: "ticket-2",
        authorRole: "user",
        text: "Нужен акт за прошлый месяц.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      },
      {
        id: "m4",
        ticketId: "ticket-2",
        authorRole: "support",
        text: "Готовим выгрузку из биллинга. Ожидайте файл в ответе в течение 1 рабочего дня.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      },
    ],
  };

  const t3: SupportTicket = {
    id: "ticket-3",
    userId: DEMO_SELLER_STORE_ID,
    category: "store",
    subject: "Подключение купонов к категории",
    message: "Хотим ограничить купон только миром «Электроника».",
    status: "resolved",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 200).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 190).toISOString(),
    messages: [
      {
        id: "m5",
        ticketId: "ticket-3",
        authorRole: "user",
        text: "Хотим ограничить купон только миром «Электроника».",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 200).toISOString(),
      },
      {
        id: "m6",
        ticketId: "ticket-3",
        authorRole: "support",
        text: "В маркетинге → купоны задайте фильтр по миру в расширенных настройках. Если поля нет — обновите страницу кабинета.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 198).toISOString(),
      },
    ],
  };

  return [t1, t2, t3];
}

let ticketsState: SupportTicket[] = seedTickets();

function isSupportCategory(value: string): value is SupportCategory {
  return (
    value === "account" ||
    value === "listing" ||
    value === "payment" ||
    value === "safety" ||
    value === "store" ||
    value === "other"
  );
}

export function getHelpCategories(): HelpCategory[] {
  return HELP_CATEGORIES.map((c) => ({ ...c, articleCount: countArticles(c.slug) }));
}

/** Все статьи (копия массива для безопасной итерации). */
export function getHelpArticles(): HelpArticle[] {
  return HELP_ARTICLES.slice();
}

/** Популярные статьи для главной help и quick drawer. */
export function getPopularHelpArticles(): HelpArticle[] {
  return [HELP_ARTICLES[0], HELP_ARTICLES[3], HELP_ARTICLES[9], HELP_ARTICLES[12], HELP_ARTICLES[16]].filter(Boolean);
}

export function getArticlesByCategorySlug(categorySlug: string): HelpArticle[] {
  if (!isSupportCategory(categorySlug)) {
    return [];
  }
  return HELP_ARTICLES.filter((a) => a.categorySlug === categorySlug);
}

export function getArticleBySlugs(categorySlug: string, articleSlug: string): HelpArticle | null {
  if (!isSupportCategory(categorySlug)) {
    return null;
  }
  return HELP_ARTICLES.find((a) => a.categorySlug === categorySlug && a.slug === articleSlug) ?? null;
}

/** Алиас для контракта P22: `getArticle(category, slug)`. */
export function getArticle(categorySlug: string, articleSlug: string): HelpArticle | null {
  return getArticleBySlugs(categorySlug, articleSlug);
}

/** Список статей категории (алиас). */
export function getArticlesByCategory(categorySlug: string): HelpArticle[] {
  return getArticlesByCategorySlug(categorySlug);
}

export function searchHelpArticles(query: string): HelpArticle[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return [];
  }
  return HELP_ARTICLES.filter((a) => {
    const hay = `${a.title} ${a.summary} ${a.content}`.toLowerCase();
    return hay.includes(q);
  }).slice(0, 12);
}

/** Алиас по спецификации P22 (поиск по статьям). */
export const searchArticles = searchHelpArticles;

export function getTicketsForUser(userId: string): SupportTicket[] {
  return ticketsState
    .filter((t) => t.userId === userId)
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

/** Алиас P22: тикеты пользователя. */
export function getUserTickets(userId: string): SupportTicket[] {
  return getTicketsForUser(userId);
}

export function getTicketForUser(userId: string, ticketId: string): SupportTicket | null {
  const t = ticketsState.find((row) => row.id === ticketId && row.userId === userId);
  return t ? { ...t, messages: t.messages.slice() } : null;
}

/** Тикет по id (без проверки владельца — только демо). */
export function getTicketById(ticketId: string): SupportTicket | null {
  const t = ticketsState.find((row) => row.id === ticketId);
  return t ? { ...t, messages: t.messages.slice() } : null;
}

export type CreateSupportTicketInput = {
  userId: string;
  category: SupportCategory;
  subject: string;
  message: string;
};

/** Алиас по спецификации P22. */
export function createTicket(input: CreateSupportTicketInput): SupportTicket {
  return createSupportTicket(input);
}

export function createSupportTicket(input: CreateSupportTicketInput): SupportTicket {
  const now = new Date().toISOString();
  const id = uid("ticket");
  const msg: TicketMessage = {
    id: uid("msg"),
    ticketId: id,
    authorRole: "user",
    text: input.message,
    createdAt: now,
  };
  const ticket: SupportTicket = {
    id,
    userId: input.userId,
    category: input.category,
    subject: input.subject.trim(),
    message: input.message.trim(),
    status: "open",
    createdAt: now,
    updatedAt: now,
    messages: [msg],
  };
  ticketsState = [ticket, ...ticketsState];
  return ticket;
}

/** Ответ пользователя в тикет (по id тикета ищется владелец). */
export function addTicketReply(ticketId: string, text: string): SupportTicket | null {
  const row = ticketsState.find((t) => t.id === ticketId);
  if (!row) {
    return null;
  }
  return addSupportTicketMessage(row.userId, ticketId, text, "user");
}

export function addSupportTicketMessage(
  userId: string,
  ticketId: string,
  text: string,
  authorRole: TicketMessage["authorRole"],
): SupportTicket | null {
  const idx = ticketsState.findIndex((t) => t.id === ticketId && t.userId === userId);
  if (idx === -1) {
    return null;
  }
  const now = new Date().toISOString();
  const msg: TicketMessage = {
    id: uid("msg"),
    ticketId,
    authorRole,
    text: text.trim(),
    createdAt: now,
  };
  const prev = ticketsState[idx];
  const next: SupportTicket = {
    ...prev,
    messages: [...prev.messages, msg],
    updatedAt: now,
    status: authorRole === "support" ? "in_progress" : prev.status,
  };
  ticketsState = [...ticketsState.slice(0, idx), next, ...ticketsState.slice(idx + 1)];
  return next;
}

/** Для тестов: сбросить in-memory тикеты */
export function resetSupportTicketsForTests() {
  ticketsState = seedTickets();
}
