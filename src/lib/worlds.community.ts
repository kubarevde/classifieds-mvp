import type { CatalogWorld } from "@/lib/listings";

export type WorldId = Exclude<CatalogWorld, "all">;

export type WorldBroadcast = {
  worldId: WorldId;
  title: string;
  body: string;
  authorType: "shop" | "user" | "system";
  authorName: string;
  expiresAt?: string;
  isPromoted: boolean;
};

export type WorldStory = {
  id: string;
  worldId: WorldId;
  type: "new_listing" | "sale" | "promo" | "tip";
  actorType: "shop" | "user";
  actorName: string;
  title: string;
  createdAt: string;
  accent?: "success" | "warning" | "accent";
};

export type WorldChatMessage = {
  id: string;
  worldId: WorldId;
  authorType: "user" | "shop";
  authorName: string;
  avatarInitials?: string;
  createdAt: string;
  text: string;
};

export type WorldCuratedScenario = {
  id: string;
  worldId: WorldId;
  title: string;
  description: string;
  icon: string;
  query: string;
  categoryId?: string;
};

export type SmartSearchInput = {
  text?: string;
  imageFile?: File;
  worldId?: WorldId;
  city?: string;
  categoryId?: string;
};

type WorldAudienceChip = "Для частников" | "Для магазинов" | "Премиум";

type WorldCommunityProfile = {
  chips: WorldAudienceChip[];
};

const worldCommunityProfiles: Record<WorldId, WorldCommunityProfile> = {
  electronics: { chips: ["Для частников", "Для магазинов", "Премиум"] },
  autos: { chips: ["Для частников", "Для магазинов"] },
  agriculture: { chips: ["Для частников", "Для магазинов", "Премиум"] },
  real_estate: { chips: ["Для частников", "Премиум"] },
  jobs: { chips: ["Для частников", "Для магазинов"] },
  services: { chips: ["Для частников", "Для магазинов"] },
};

const worldBroadcasts: WorldBroadcast[] = [
  {
    worldId: "electronics",
    title: "Техно-неделя: скидки на ноутбуки и смартфоны",
    body: "Проверенные магазины мира запустили короткие акции на флагманы и рабочие модели. Смотрите закреплённые карточки в каталоге мира.",
    authorType: "shop",
    authorName: "ТехноМаркет",
    isPromoted: true,
  },
  {
    worldId: "autos",
    title: "Команда мира: добавляйте VIN и фото салона",
    body: "Объявления с VIN и детальными фото получают больше ответов. Проверьте, что в карточке есть пробег, сервисная история и документы.",
    authorType: "system",
    authorName: "Команда мира Авто",
    isPromoted: false,
  },
  {
    worldId: "agriculture",
    title: "Весенний сезон закупок: техника и материалы",
    body: "В мире открыта подборка сезонных предложений. Пользуйтесь фильтрами по региону и оперативной доставке.",
    authorType: "shop",
    authorName: "ФермаПро",
    isPromoted: true,
  },
  {
    worldId: "real_estate",
    title: "Модерация: указывайте точный район и планировку",
    body: "Карточки с планировкой, метражом и условиями сделки поднимаются выше в рекомендациях мира.",
    authorType: "system",
    authorName: "Команда мира Недвижимость",
    isPromoted: false,
  },
  {
    worldId: "jobs",
    title: "Новая волна вакансий в логистике и e-commerce",
    body: "Проверьте свежие предложения и обновите резюме: работодатели активнее отвечают на профили с релевантным опытом за 6 месяцев.",
    authorType: "user",
    authorName: "HR Клуб",
    isPromoted: false,
  },
  {
    worldId: "services",
    title: "Платное размещение: проверенные мастера рядом",
    body: "Лучшие исполнители недели в ремонте и перевозках уже в ленте. Сравнивайте отзывы и время отклика.",
    authorType: "shop",
    authorName: "МастерСервис",
    isPromoted: true,
  },
];

const worldStories: WorldStory[] = [
  { id: "e-1", worldId: "electronics", type: "promo", actorType: "shop", actorName: "ТехноМаркет", title: "запустил распродажу игровых ноутбуков до конца недели", createdAt: "2 мин. назад", accent: "accent" },
  { id: "e-2", worldId: "electronics", type: "new_listing", actorType: "user", actorName: "Алексей", title: "выложил 3 новых объявления в категории «Телефоны»", createdAt: "9 мин. назад", accent: "success" },
  { id: "e-3", worldId: "electronics", type: "tip", actorType: "shop", actorName: "Редакция", title: "совет дня: фото экрана без бликов повышают конверсию в чат", createdAt: "18 мин. назад" },
  { id: "a-1", worldId: "autos", type: "sale", actorType: "shop", actorName: "АвтоГрад", title: "объявил скидки на комплекты шин и дисков", createdAt: "5 мин. назад", accent: "warning" },
  { id: "a-2", worldId: "autos", type: "new_listing", actorType: "user", actorName: "Михаил", title: "добавил 2 объявления в «Новые авто»", createdAt: "11 мин. назад", accent: "success" },
  { id: "a-3", worldId: "autos", type: "tip", actorType: "shop", actorName: "Редакция", title: "совет дня: авто до 500 000 ₽ быстрее продаются с видеообзором", createdAt: "26 мин. назад" },
  { id: "g-1", worldId: "agriculture", type: "promo", actorType: "shop", actorName: "ФермаПро", title: "открыл спецусловия на опрыскиватели и запчасти", createdAt: "3 мин. назад", accent: "accent" },
  { id: "g-2", worldId: "agriculture", type: "new_listing", actorType: "user", actorName: "Ирина", title: "добавила новые предложения в «Техника»", createdAt: "14 мин. назад", accent: "success" },
  { id: "g-3", worldId: "agriculture", type: "tip", actorType: "shop", actorName: "Редакция", title: "совет дня: сезонные теги заметно ускоряют отклик покупателей", createdAt: "31 мин. назад" },
  { id: "r-1", worldId: "real_estate", type: "promo", actorType: "shop", actorName: "ДомСтрой", title: "запустил подборку квартир с видео-турами", createdAt: "7 мин. назад", accent: "accent" },
  { id: "r-2", worldId: "real_estate", type: "new_listing", actorType: "user", actorName: "Ольга", title: "разместила 2 новых объекта в аренде", createdAt: "19 мин. назад", accent: "success" },
  { id: "r-3", worldId: "real_estate", type: "tip", actorType: "shop", actorName: "Редакция", title: "совет дня: планировка в первой галерее повышает просмотры", createdAt: "42 мин. назад" },
  { id: "j-1", worldId: "jobs", type: "promo", actorType: "shop", actorName: "HR Club", title: "обновил подборку вакансий удалённого формата", createdAt: "6 мин. назад", accent: "accent" },
  { id: "j-2", worldId: "jobs", type: "new_listing", actorType: "user", actorName: "Сергей", title: "опубликовал резюме с новым портфолио", createdAt: "15 мин. назад", accent: "success" },
  { id: "j-3", worldId: "jobs", type: "tip", actorType: "shop", actorName: "Редакция", title: "совет дня: зарплатная вилка повышает отклик на вакансию", createdAt: "37 мин. назад" },
  { id: "s-1", worldId: "services", type: "promo", actorType: "shop", actorName: "МастерСервис", title: "запустил акцию на комплексный ремонт квартир", createdAt: "4 мин. назад", accent: "accent" },
  { id: "s-2", worldId: "services", type: "new_listing", actorType: "user", actorName: "Дмитрий", title: "добавил 4 новых объявления в перевозках", createdAt: "13 мин. назад", accent: "success" },
  { id: "s-3", worldId: "services", type: "tip", actorType: "shop", actorName: "Редакция", title: "совет дня: фиксированный прайс в карточке повышает доверие", createdAt: "24 мин. назад" },
];

const worldCuratedScenarios: WorldCuratedScenario[] = [
  {
    id: "electronics-work-study",
    worldId: "electronics",
    icon: "💻",
    title: "Для работы и учебы",
    description: "Ноутбуки и рабочие устройства в сбалансированном бюджете.",
    query: "ноут",
    categoryId: "laptops",
  },
  {
    id: "electronics-gaming",
    worldId: "electronics",
    icon: "🎮",
    title: "Хиты для игр",
    description: "Консоли, игровые ПК и аксессуары с высоким спросом.",
    query: "игров",
    categoryId: "games_software",
  },
  {
    id: "autos-rent",
    worldId: "autos",
    icon: "🛣️",
    title: "Аренда и мобильность",
    description: "Сценарии краткосрочной и длительной аренды.",
    query: "аренда",
    categoryId: "car_rent",
  },
  {
    id: "autos-maintenance",
    worldId: "autos",
    icon: "🔧",
    title: "Сервис и обслуживание",
    description: "Запчасти и сопутствующие предложения.",
    query: "запчаст",
    categoryId: "parts",
  },
  {
    id: "agriculture-season",
    worldId: "agriculture",
    icon: "🌾",
    title: "Популярно в сезон",
    description: "Карточки, которые чаще всего ищут в текущем периоде работ.",
    query: "урожай",
  },
  {
    id: "agriculture-tech-near",
    worldId: "agriculture",
    icon: "🚜",
    title: "Техника рядом",
    description: "Оборудование и транспорт с быстрым стартом сделки.",
    query: "трактор",
    categoryId: "tractors",
  },
  {
    id: "real-estate-rent",
    worldId: "real_estate",
    icon: "🗝️",
    title: "Аренда и заселение",
    description: "Подбор предложений для быстрого заселения.",
    query: "аренда",
    categoryId: "rent_apartments",
  },
  {
    id: "real-estate-family",
    worldId: "real_estate",
    icon: "🏠",
    title: "Семейные сценарии",
    description: "Квартиры и дома с акцентом на инфраструктуру.",
    query: "квартира",
  },
  {
    id: "jobs-urgent",
    worldId: "jobs",
    icon: "⚡",
    title: "Срочный найм",
    description: "Позиции с быстрым выходом на работу.",
    query: "срочно",
    categoryId: "vacancies",
  },
  {
    id: "jobs-office",
    worldId: "jobs",
    icon: "🏢",
    title: "Офисные роли",
    description: "Управленческие и административные позиции.",
    query: "менеджер",
  },
  {
    id: "services-home",
    worldId: "services",
    icon: "🏡",
    title: "Для дома",
    description: "Ремонт и бытовые работы с быстрым откликом.",
    query: "ремонт",
  },
  {
    id: "services-logistics",
    worldId: "services",
    icon: "🚚",
    title: "Переезды и логистика",
    description: "Грузовые перевозки и смежные задачи.",
    query: "перевоз",
  },
];

const worldChatSeed: WorldChatMessage[] = [
  { id: "chat-e-1", worldId: "electronics", authorType: "user", authorName: "Алексей", avatarInitials: "АИ", createdAt: "2026-04-27T06:30:00.000Z", text: "Кто брал ноутбуки для монтажа до 90к? Что посоветуете?" },
  { id: "chat-e-2", worldId: "electronics", authorType: "shop", authorName: "ТехноМаркет", avatarInitials: "ТМ", createdAt: "2026-04-27T06:36:00.000Z", text: "Смотрите Ryzen 7 + 16GB в категории «Для работы и учебы», сейчас есть акция." },
  { id: "chat-a-1", worldId: "autos", authorType: "user", authorName: "Михаил", avatarInitials: "МЛ", createdAt: "2026-04-27T06:20:00.000Z", text: "Ищу авто до 700к, важен небольшой расход. Какие модели смотреть?" },
  { id: "chat-a-2", worldId: "autos", authorType: "shop", authorName: "АвтоГрад", avatarInitials: "АГ", createdAt: "2026-04-27T06:40:00.000Z", text: "Загляните в сценарий «Аренда и мобильность» — там есть быстрые варианты с проверкой." },
  { id: "chat-g-1", worldId: "agriculture", authorType: "user", authorName: "Ирина", avatarInitials: "ИР", createdAt: "2026-04-27T06:10:00.000Z", text: "Нужен опрыскиватель на сезон, кто недавно покупал?" },
  { id: "chat-r-1", worldId: "real_estate", authorType: "shop", authorName: "ДомСтрой", avatarInitials: "ДС", createdAt: "2026-04-27T06:22:00.000Z", text: "В аренде появились варианты рядом с метро, можем помочь с подбором." },
  { id: "chat-j-1", worldId: "jobs", authorType: "user", authorName: "Сергей", avatarInitials: "СГ", createdAt: "2026-04-27T06:18:00.000Z", text: "Есть ли вакансии с гибридным графиком в e-commerce?" },
  { id: "chat-s-1", worldId: "services", authorType: "shop", authorName: "МастерСервис", avatarInitials: "МС", createdAt: "2026-04-27T06:26:00.000Z", text: "По ремонту можем сориентировать по цене после фото помещения." },
];

const worldChatMemory = new Map<WorldId, WorldChatMessage[]>();

function hashSeed(input: string) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getWorldAudienceChips(worldId: WorldId) {
  return worldCommunityProfiles[worldId].chips;
}

export function getWorldBroadcast(worldId: WorldId) {
  const now = Date.now();
  return (
    worldBroadcasts.find((item) => {
      if (item.worldId !== worldId) {
        return false;
      }
      if (!item.expiresAt) {
        return true;
      }
      return new Date(item.expiresAt).getTime() > now;
    }) ?? null
  );
}

export function getWorldOnlineStats(worldId: WorldId) {
  const minuteBucket = Math.floor(Date.now() / (1000 * 60 * 5));
  const usersSeed = hashSeed(`${worldId}-${minuteBucket}-users`);
  const shopsSeed = hashSeed(`${worldId}-${minuteBucket}-shops`);
  return {
    usersOnline: 23 + (usersSeed % 118),
    shopsOnline: 2 + (shopsSeed % 14),
  };
}

export function getWorldStories(worldId: WorldId) {
  return worldStories.filter((item) => item.worldId === worldId);
}

export function getWorldCuratedScenarios(worldId: WorldId) {
  return worldCuratedScenarios.filter((item) => item.worldId === worldId).slice(0, 2);
}

export function getWorldChatMessages(worldId: WorldId): WorldChatMessage[] {
  const existing = worldChatMemory.get(worldId);
  if (existing) {
    return existing;
  }
  const seeded = worldChatSeed.filter((message) => message.worldId === worldId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  worldChatMemory.set(worldId, seeded);
  return seeded;
}

export function addWorldChatMessage(worldId: WorldId, message: { authorName: string; text: string }): WorldChatMessage {
  const normalizedText = message.text.trim();
  const authorName = message.authorName.trim() || "Гость";
  const initials = authorName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  const created: WorldChatMessage = {
    id: `chat-${worldId}-${Date.now()}`,
    worldId,
    authorType: "user",
    authorName,
    avatarInitials: initials || "Г",
    createdAt: new Date().toISOString(),
    text: normalizedText,
  };
  const current = getWorldChatMessages(worldId);
  worldChatMemory.set(worldId, [created, ...current]);
  return created;
}

export function searchListingsSmart(input: SmartSearchInput) {
  const params = new URLSearchParams();
  if (input.worldId) {
    params.set("world", input.worldId);
  }
  if (input.city) {
    params.set("location", input.city);
  }
  if (input.categoryId) {
    params.set("category", input.categoryId);
  }
  if (input.text?.trim()) {
    params.set("q", input.text.trim());
  }
  return `/listings?${params.toString()}`;
}
