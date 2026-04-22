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
      description: "Миры задают контекст поиска: электроника, авто, агро, недвижимость, работа и услуги.",
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
  electronics: {
    world: "electronics",
    title: "Электроника",
    subtitle: "Холодный hi-tech контекст для техники и гаджетов",
    heroDescription:
      "Категории электроники отделены от мира и помогают быстро сузить выдачу: от телефонов до комплектующих.",
    heroIcon: "⚙️",
    highlights: ["Телефоны и ноутбуки", "Аудио, фото и офисная техника", "Игры, приставки и комплектующие"],
    supportStrip: "Мир задает контекст выдачи, категории уточняют нужный сегмент внутри мира электроники.",
    pageToneClass: "bg-[radial-gradient(circle_at_top,#eef4fb_0%,#e7edf6_45%,#dde6f2_100%)]",
    heroToneClass: "border-slate-400/70 bg-[linear-gradient(135deg,#1f2937_0%,#334155_42%,#304b6b_100%)] text-white",
    heroDecorClass:
      "bg-[radial-gradient(circle_at_75%_20%,rgba(96,165,250,0.25),transparent_44%),radial-gradient(circle_at_35%_80%,rgba(56,189,248,0.16),transparent_45%)]",
    sectionToneClass: "border-slate-300 bg-white/90",
    chipActiveClass: "border-sky-300 bg-slate-900 text-white",
    chipInactiveClass: "border-slate-300 bg-white text-slate-700 hover:bg-slate-100",
    discovery: {
      eyebrow: "Мир",
      title: "Техно-контекст каталога",
      description: "Выбирайте мир отдельно, а затем конкретную категорию, чтобы не смешивать режим и тип товара.",
      steps: ["Откройте мир электроники", "Выберите категорию", "Уточните запрос и цену"],
      primaryCtaLabel: "Подобрать технику",
      secondaryOptions: [
        { id: "tech-phones", label: "Телефоны", query: "iphone", categoryId: "phones" },
        { id: "tech-laptops", label: "Ноутбуки", query: "macbook", categoryId: "laptops" },
        { id: "tech-games", label: "Игры", query: "playstation", categoryId: "games_software" },
      ],
      resultLabel: "Мир «Электроника» оставляет только hi-tech контекст и релевантные категории.",
    },
    rails: [
      {
        id: "tech-gaming-hits",
        title: "Хиты для игр",
        description: "Консоли, игровые ПК и аксессуары с высоким спросом.",
        icon: "🎮",
        query: "игров",
      },
      {
        id: "tech-work-study",
        title: "Для работы и учебы",
        description: "Ноутбуки и рабочие устройства в сбалансированном бюджете.",
        icon: "💻",
        query: "ноут",
      },
      {
        id: "tech-upgrade",
        title: "Апгрейд и комплектующие",
        description: "Компоненты и периферия для апгрейда вашей техники.",
        icon: "🧩",
        query: "видеокарт",
      },
    ],
    homeCardToneClass: "border-slate-400/70 bg-[linear-gradient(135deg,#1e293b,#334155_50%,#3b5678)] text-white",
    homeCardAccentClass: "text-white",
    homeCardHints: ["Мир: hi-tech", "Категории: от телефонов до оргтехники"],
    homeCardCta: "Перейти в мир электроники",
  },
  autos: {
    world: "autos",
    title: "Автомобили",
    subtitle: "Аккуратная красная гамма и авто-контекст",
    heroDescription:
      "Мир автомобилей отделяет авто-сценарии от остального каталога: легковые, спецтехника, аренда и запчасти.",
    heroIcon: "🚗",
    highlights: ["Легковые и новые авто", "Грузовой и спец-сегмент", "Аренда и запчасти"],
    supportStrip: "Мир «Автомобили» задает контекст, а категории внутри мира управляют точным сегментом поиска.",
    pageToneClass: "bg-[radial-gradient(circle_at_top,#fff1f3_0%,#fbe7ea_48%,#f3e2e6_100%)]",
    heroToneClass: "border-rose-300 bg-[linear-gradient(135deg,#fff6f7_0%,#f6dce2_45%,#edd5dd_100%)]",
    heroDecorClass: "bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.8),transparent_50%)]",
    sectionToneClass: "border-rose-200 bg-white/90",
    chipActiveClass: "border-rose-400 bg-rose-700 text-white",
    chipInactiveClass: "border-rose-200 bg-white text-rose-900 hover:bg-rose-50",
    discovery: {
      eyebrow: "Мир",
      title: "Авто-режим каталога",
      description: "Сначала выберите мир, затем категорию: это помогает не смешивать авто-поиск с другими рынками.",
      steps: ["Откройте мир авто", "Выберите категорию", "Уточните бюджет и гео"],
      primaryCtaLabel: "Искать в мире авто",
      secondaryOptions: [
        { id: "auto-cars", label: "Легковые", query: "camry", categoryId: "passenger_cars" },
        { id: "auto-rent", label: "Аренда", query: "аренда", categoryId: "car_rent" },
        { id: "auto-parts", label: "Запчасти", query: "запчаст", categoryId: "parts" },
      ],
      resultLabel: "Мир «Автомобили» показывает авто-сценарии, а категории уточняют тип транспорта.",
    },
    rails: [
      {
        id: "auto-select",
        title: "Селект-предложения",
        description: "Выборка машин с акцентом на историю и состояние.",
        icon: "🧾",
        query: "владелец",
      },
      {
        id: "auto-rent",
        title: "Аренда и мобильность",
        description: "Сценарии краткосрочной и длительной аренды.",
        icon: "🛣️",
        query: "аренда",
      },
      {
        id: "auto-maintenance",
        title: "Сервис и обслуживание",
        description: "Запчасти и сопутствующие предложения.",
        icon: "🔧",
        query: "запчаст",
      },
    ],
    homeCardToneClass: "border-rose-300 bg-[linear-gradient(135deg,#fff8f8,#f9e3e7_58%,#f2d8de)]",
    homeCardAccentClass: "text-rose-900",
    homeCardHints: ["Мир: авто-контекст", "Категории: авто, аренда, запчасти"],
    homeCardCta: "Перейти в мир автомобилей",
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
  real_estate: {
    world: "real_estate",
    title: "Недвижимость",
    subtitle: "Спокойный рынок жилья и коммерции",
    heroDescription:
      "Мир недвижимости отделяет жилые и коммерческие сценарии в отдельный режим и оставляет категории понятными.",
    heroIcon: "🏢",
    highlights: ["Новостройки и вторичка", "Аренда и коммерческая недвижимость", "Уверенный спокойный тон интерфейса"],
    supportStrip: "Мир недвижимости отделен от остальных тем, а категории внутри мира остаются прозрачными.",
    pageToneClass: "bg-[radial-gradient(circle_at_top,#f2f4fb_0%,#e8ebf5_48%,#e2e6f0_100%)]",
    heroToneClass: "border-indigo-200 bg-[linear-gradient(135deg,#fafbff_0%,#edf0f8_48%,#e6e9f3_100%)]",
    heroDecorClass: "bg-[radial-gradient(circle_at_16%_16%,rgba(255,255,255,0.8),transparent_52%)]",
    sectionToneClass: "border-indigo-200 bg-white/92",
    chipActiveClass: "border-indigo-400 bg-indigo-700 text-white",
    chipInactiveClass: "border-indigo-200 bg-white text-indigo-900 hover:bg-indigo-50",
    discovery: {
      eyebrow: "Мир",
      title: "Режим поиска недвижимости",
      description: "Сначала выбирайте мир недвижимости, затем категорию объектов — это делает фильтрацию предсказуемой.",
      steps: ["Откройте мир недвижимости", "Выберите категорию", "Уточните город и запрос"],
      primaryCtaLabel: "Искать недвижимость",
      secondaryOptions: [
        { id: "estate-new", label: "Новостройки", query: "жк", categoryId: "new_buildings" },
        { id: "estate-rent", label: "Аренда", query: "аренда", categoryId: "rent_apartments" },
        { id: "estate-commercial", label: "Коммерция", query: "коммерч", categoryId: "commercial" },
      ],
      resultLabel: "Мир задает контекст недвижимости, категории уточняют тип объекта.",
    },
    rails: [
      {
        id: "estate-family",
        title: "Семейные сценарии",
        description: "Квартиры и дома с акцентом на инфраструктуру.",
        icon: "🏠",
        query: "квартира",
      },
      {
        id: "estate-rent",
        title: "Аренда и заселение",
        description: "Подбор предложений для быстрого заселения.",
        icon: "🗝️",
        query: "аренда",
      },
      {
        id: "estate-invest",
        title: "Инвест-контекст",
        description: "Подборка под долгосрочную ликвидность.",
        icon: "📈",
        query: "метро",
      },
    ],
    homeCardToneClass: "border-indigo-200 bg-[linear-gradient(135deg,#fafbff,#eef1f8_58%,#e8ebf3)]",
    homeCardAccentClass: "text-indigo-900",
    homeCardHints: ["Мир: недвижимость", "Категории: жилье, аренда, коммерция"],
    homeCardCta: "Перейти в мир недвижимости",
  },
  jobs: {
    world: "jobs",
    title: "Работа",
    subtitle: "Деловой контекст вакансий и резюме",
    heroDescription:
      "Мир работы отделяет HR-сценарии от торговых категорий: отдельно вакансии и резюме в одном режиме.",
    heroIcon: "💼",
    highlights: ["Вакансии и резюме", "Деловая визуальная гамма", "Прозрачное разделение мира и категории"],
    supportStrip: "Мир работы задает деловой контекст; категории отвечают только за формат публикации.",
    pageToneClass: "bg-[radial-gradient(circle_at_top,#f1f5ff_0%,#e8eefc_48%,#e1e8f8_100%)]",
    heroToneClass: "border-blue-200 bg-[linear-gradient(135deg,#f8fbff_0%,#eaf1ff_46%,#e3ebff_100%)]",
    heroDecorClass: "bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.8),transparent_50%)]",
    sectionToneClass: "border-blue-200 bg-white/92",
    chipActiveClass: "border-blue-400 bg-blue-700 text-white",
    chipInactiveClass: "border-blue-200 bg-white text-blue-900 hover:bg-blue-50",
    discovery: {
      eyebrow: "Мир",
      title: "Рабочий режим каталога",
      description: "Сначала мир, потом категория: вакансии и резюме не смешиваются с товарами и услугами.",
      steps: ["Откройте мир работы", "Выберите «Вакансии» или «Резюме»", "Уточните ключевой запрос"],
      primaryCtaLabel: "Искать в мире работы",
      secondaryOptions: [
        { id: "jobs-vacancy", label: "Вакансии", query: "менеджер", categoryId: "vacancies" },
        { id: "jobs-resume", label: "Резюме", query: "резюме", categoryId: "resume" },
      ],
      resultLabel: "Мир «Работа» оставляет только кадровые сценарии.",
    },
    rails: [
      {
        id: "jobs-hiring",
        title: "Срочный найм",
        description: "Позиции с быстрым выходом на работу.",
        icon: "⚡",
        query: "срочно",
      },
      {
        id: "jobs-digital",
        title: "Digital и e-commerce",
        description: "Вакансии и резюме в онлайн-торговле и маркетинге.",
        icon: "🧠",
        query: "маркетинг",
      },
      {
        id: "jobs-office",
        title: "Офисные роли",
        description: "Управленческие и административные позиции.",
        icon: "🏢",
        query: "менеджер",
      },
    ],
    homeCardToneClass: "border-blue-200 bg-[linear-gradient(135deg,#f8fbff,#edf3ff_55%,#e5ecff)]",
    homeCardAccentClass: "text-blue-900",
    homeCardHints: ["Мир: работа", "Категории: вакансии и резюме"],
    homeCardCta: "Перейти в мир работы",
  },
  services: {
    world: "services",
    title: "Услуги",
    subtitle: "Теплая нейтральная среда сервисных предложений",
    heroDescription:
      "Мир услуг отделяет сервисные сценарии: перевозки, ремонт, красота, стройка и деловые услуги.",
    heroIcon: "🛠️",
    highlights: ["Бытовые и деловые услуги", "Мягкая теплая палитра", "Категории внутри сервисного мира"],
    supportStrip: "Мир «Услуги» задает сервисный контекст, категории делят его на конкретные направления.",
    pageToneClass: "bg-[radial-gradient(circle_at_top,#f9f6ef_0%,#f4efdf_48%,#ede7d6_100%)]",
    heroToneClass: "border-amber-200 bg-[linear-gradient(135deg,#fffcf6_0%,#f8f1de_46%,#f2ead4_100%)]",
    heroDecorClass: "bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.8),transparent_50%)]",
    sectionToneClass: "border-amber-200 bg-white/93",
    chipActiveClass: "border-amber-400 bg-amber-700 text-white",
    chipInactiveClass: "border-amber-200 bg-white text-amber-900 hover:bg-amber-50",
    discovery: {
      eyebrow: "Мир",
      title: "Режим сервисов",
      description: "Выберите мир услуг, а затем категорию, чтобы быстрее перейти к нужному исполнителю.",
      steps: ["Откройте мир услуг", "Выберите категорию сервиса", "Уточните задачу или город"],
      primaryCtaLabel: "Искать услуги",
      secondaryOptions: [
        { id: "services-repair", label: "Ремонт", query: "ремонт", categoryId: "repair_finishing" },
        { id: "services-cargo", label: "Перевозки", query: "перевоз", categoryId: "cargo_transportation" },
        { id: "services-business", label: "Деловые", query: "делов", categoryId: "business_services" },
      ],
      resultLabel: "Мир «Услуги» фокусирует выдачу на сервисных объявлениях.",
    },
    rails: [
      {
        id: "services-home",
        title: "Для дома",
        description: "Ремонт и бытовые работы с быстрым откликом.",
        icon: "🏡",
        query: "ремонт",
      },
      {
        id: "services-moving",
        title: "Переезды и логистика",
        description: "Грузовые перевозки и смежные задачи.",
        icon: "🚚",
        query: "перевоз",
      },
      {
        id: "services-business",
        title: "Для бизнеса",
        description: "Деловые сервисы для компаний и ИП.",
        icon: "📊",
        query: "делов",
      },
    ],
    homeCardToneClass: "border-amber-200 bg-[linear-gradient(135deg,#fffdf8,#f8f2e5_55%,#f1ead8)]",
    homeCardAccentClass: "text-amber-900",
    homeCardHints: ["Мир: услуги", "Категории: ремонт, перевозки, бизнес"],
    homeCardCta: "Перейти в мир услуг",
  },
};

export function getWorldPresentation(world: CatalogWorld) {
  return worldPresentationById[world];
}
