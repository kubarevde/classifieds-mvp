import { CatalogWorld } from "@/lib/listings";

export type WorldRailDefinition = {
  id: string;
  title: string;
  description: string;
  icon: string;
  query: string;
  categoryId?: string;
};

export type WorldDiscoveryDefinition = {
  eyebrow: string;
  title: string;
  description: string;
  steps: string[];
  primaryCtaLabel: string;
  secondaryOptions: { id: string; label: string; query: string; categoryId?: string }[];
  resultLabel: string;
};

export type WorldPresentation = {
  world: CatalogWorld;
  title: string;
  subtitle: string;
  heroDescription: string;
  heroIcon: string;
  highlights: string[];
  supportStrip: string;
  pageToneClass: string;
  heroToneClass: string;
  heroDecorClass: string;
  sectionToneClass: string;
  chipActiveClass: string;
  chipInactiveClass: string;
  discovery: WorldDiscoveryDefinition;
  rails: WorldRailDefinition[];
  homeCardToneClass: string;
  homeCardAccentClass: string;
  homeCardHints: string[];
  homeCardCta: string;
};

export const worldPresentationById: Record<CatalogWorld, WorldPresentation> = {
  all: {
    world: "all",
    title: "Все объявления",
    subtitle: "Единый маркетплейс",
    heroDescription:
      "Все категории в одном потоке: от повседневных покупок до специальных тематических разделов.",
    heroIcon: "◌",
    highlights: ["Поиск по всем мирам", "Единые фильтры и сохранения", "Быстрый переход в тематические режимы"],
    supportStrip: "Один продукт, одна логика навигации, разные миры внутри каталога.",
    pageToneClass: "bg-[radial-gradient(circle_at_top,#f8fafc_0%,#f4f6f8_58%,#f7f8fa_100%)]",
    heroToneClass: "border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f4f6f8_60%,#f1ede6_100%)]",
    heroDecorClass: "bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.7),transparent_55%)]",
    sectionToneClass: "border-slate-200 bg-white/90",
    chipActiveClass: "border-slate-400 bg-slate-900 text-white",
    chipInactiveClass: "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    discovery: {
      eyebrow: "Тематические режимы",
      title: "Выберите мир под задачу",
      description: "Откройте Сельское хозяйство или Электронику, если хотите более точные сценарии подбора.",
      steps: ["Выберите мир", "Уточните параметры", "Смотрите curated выдачу"],
      primaryCtaLabel: "Открыть world switcher",
      secondaryOptions: [
        { id: "all-fast", label: "Новые сегодня", query: "сегодня" },
        { id: "all-near", label: "Рядом", query: "москва" },
      ],
      resultLabel: "В нейтральном режиме показываем общий поток объявлений.",
    },
    rails: [],
    homeCardToneClass: "border-slate-200 bg-[linear-gradient(135deg,#ffffff,#f2f5f8)]",
    homeCardAccentClass: "text-slate-800",
    homeCardHints: ["Общий поиск", "Все категории"],
    homeCardCta: "Открыть каталог",
  },
  agriculture: {
    world: "agriculture",
    title: "Сельское хозяйство",
    subtitle: "Рынок техники, материалов и решений для хозяйства",
    heroDescription:
      "Подберите оборудование, сезонные предложения и сервисы для фермы в одном тематическом режиме каталога.",
    heroIcon: "🌿",
    highlights: ["Подбор под сезон", "Техника и расходники рядом", "Сервисы для малого и среднего хозяйства"],
    supportStrip: "Агро-мир встроен в единый продукт: общие аккаунт, избранное и фильтры.",
    pageToneClass: "bg-[radial-gradient(circle_at_top,#f5fbf0_0%,#eef7ea_50%,#f5efe3_100%)]",
    heroToneClass: "border-emerald-200/90 bg-[linear-gradient(135deg,#f8fff4_0%,#dff1d8_45%,#f3e7d1_100%)]",
    heroDecorClass: "bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.8),transparent_50%)]",
    sectionToneClass: "border-emerald-200/80 bg-white/88",
    chipActiveClass: "border-emerald-300 bg-emerald-700 text-white",
    chipInactiveClass: "border-emerald-200/80 bg-white/90 text-emerald-900 hover:bg-emerald-50",
    discovery: {
      eyebrow: "Режим подбора",
      title: "Агро-навигатор задач",
      description: "Опишите задачу хозяйства и получите релевантную подборку объявлений под текущий цикл работ.",
      steps: ["Выберите приоритет бюджета", "Уточните радиус", "Выберите задачу хозяйства"],
      primaryCtaLabel: "Собрать подборку для хозяйства",
      secondaryOptions: [
        { id: "agri-machinery", label: "Техника", query: "трактор", categoryId: "tractors" },
        { id: "agri-materials", label: "Материалы", query: "опрыски", categoryId: "equipment" },
        { id: "agri-service", label: "Сервис", query: "бизнес", categoryId: "business" },
      ],
      resultLabel: "После подбора покажем релевантные карточки для вашего формата хозяйства.",
    },
    rails: [
      {
        id: "agri-season",
        title: "Популярно в сезон",
        description: "Карточки, которые чаще всего ищут в текущем периоде работ.",
        icon: "🌾",
        query: "урожай",
      },
      {
        id: "agri-near-tech",
        title: "Техника рядом",
        description: "Оборудование и транспорт с быстрым стартом сделки.",
        icon: "🚜",
        query: "трактор",
      },
      {
        id: "agri-small-farm",
        title: "Для малого хозяйства",
        description: "Компактные решения с умеренным бюджетом запуска.",
        icon: "🧺",
        query: "земля",
      },
    ],
    homeCardToneClass: "border-emerald-200 bg-[linear-gradient(135deg,#f9fff5,#e6f4df_56%,#f3e6cf)]",
    homeCardAccentClass: "text-emerald-900",
    homeCardHints: ["Подбор под сезон", "Техника и сервисы"],
    homeCardCta: "Перейти в агро-мир",
  },
  electronics: {
    world: "electronics",
    title: "Электроника",
    subtitle: "Быстрые сделки по технике, гаджетам и комплектующим",
    heroDescription:
      "Погружайтесь в hi-tech режим каталога: фильтры, подбор и curated витрины для уверенной покупки.",
    heroIcon: "⚙️",
    highlights: ["Подбор по бюджету и сценарию", "Проверенные состояния и комплекты", "Актуальные хиты по категориям"],
    supportStrip: "Электроника остается частью общего продукта: единая логика поиска, сообщений и публикации.",
    pageToneClass: "bg-[radial-gradient(circle_at_top,#f3f6fb_0%,#e9eef5_42%,#e4ebf4_100%)]",
    heroToneClass: "border-slate-400/70 bg-[linear-gradient(135deg,#1f2937_0%,#334155_40%,#304b6b_100%)] text-white",
    heroDecorClass:
      "bg-[radial-gradient(circle_at_75%_20%,rgba(96,165,250,0.26),transparent_45%),radial-gradient(circle_at_35%_80%,rgba(56,189,248,0.18),transparent_45%)]",
    sectionToneClass: "border-slate-300 bg-white/88",
    chipActiveClass: "border-sky-300 bg-slate-900 text-white",
    chipInactiveClass: "border-slate-300 bg-white/90 text-slate-700 hover:bg-slate-100",
    discovery: {
      eyebrow: "Режим подбора",
      title: "Техно-навигатор покупки",
      description: "Соберите персональную подборку: бюджет, сценарий, состояние - и сразу смотрите подходящие карточки.",
      steps: ["Выберите бюджет", "Задайте сценарий использования", "Уточните состояние устройства"],
      primaryCtaLabel: "Подобрать технику под задачу",
      secondaryOptions: [
        { id: "tech-work", label: "Работа и учеба", query: "ноут" },
        { id: "tech-gaming", label: "Игры", query: "игров" },
        { id: "tech-deals", label: "Выгодно и быстро", query: "смартфон" },
      ],
      resultLabel: "Результаты подбора отмечаем как рекомендации по вашему сценарию.",
    },
    rails: [
      {
        id: "tech-gaming-hits",
        title: "Хиты для игр",
        description: "Консоли, игровые ПК и компоненты с лучшим спросом.",
        icon: "🎮",
        query: "игров",
      },
      {
        id: "tech-work-study",
        title: "Для работы и учебы",
        description: "Ноутбуки и устройства для ежедневной продуктивности.",
        icon: "💻",
        query: "ноут",
      },
      {
        id: "tech-upgrade",
        title: "Комплектующие и апгрейд",
        description: "Карточки для апгрейда и сборки системы.",
        icon: "🧩",
        query: "видеокарт",
      },
    ],
    homeCardToneClass: "border-slate-400/70 bg-[linear-gradient(135deg,#1e293b,#334155_50%,#3b5678)] text-white",
    homeCardAccentClass: "text-white",
    homeCardHints: ["Подбор техники", "Выгодные b/u предложения"],
    homeCardCta: "Перейти в tech-мир",
  },
};

export function getWorldPresentation(world: CatalogWorld) {
  return worldPresentationById[world];
}
