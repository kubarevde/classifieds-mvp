export type AgricultureCategory = {
  id: string;
  label: string;
  description: string;
  children?: string[];
};

export type AgricultureListing = {
  id: string;
  title: string;
  price: string;
  priceValue: number;
  location: string;
  publishedAt: string;
  postedAtIso: string;
  image: string;
  condition: string;
  description: string;
  sellerName: string;
  sellerPhone: string;
  categoryId: string;
  categoryLabel: string;
};

export const agricultureCategories: AgricultureCategory[] = [
  {
    id: "ready_products",
    label: "Готовая продукция",
    description: "Урожай и свежая продукция прямо от фермеров",
    children: ["ягода", "овощи", "фрукты", "зелень"],
  },
  {
    id: "tractors",
    label: "Трактора",
    description: "Новые и с пробегом, под разные задачи хозяйства",
  },
  {
    id: "equipment",
    label: "Оборудование",
    description: "Техника и системы для полей, садов и теплиц",
    children: ["навесное", "прицепное", "опрыскиватели"],
  },
  {
    id: "business",
    label: "Готовый бизнес",
    description: "Фермы и действующие агро-проекты под запуск",
  },
  {
    id: "land",
    label: "Земля",
    description: "Участки для растениеводства, садов и хозяйства",
  },
];

export const agricultureListings: AgricultureListing[] = [
  {
    id: "agri-1",
    title: "Клубника сортовая, свежий сбор, 200 кг",
    price: "320 ₽ / кг",
    priceValue: 320,
    location: "Краснодар",
    publishedAt: "Сегодня",
    postedAtIso: "2026-04-20T10:10:00+03:00",
    image: "from-emerald-900 via-green-700 to-lime-200",
    condition: "Охлаждение и доставка по договоренности",
    description:
      "Ягода с утреннего сбора, плотная, подходит для розницы и кафе. Можем отгружать партиями по 20-40 кг.",
    sellerName: "Ферма Зеленый берег",
    sellerPhone: "+7 (918) 110-22-90",
    categoryId: "ready_products",
    categoryLabel: "ягода",
  },
  {
    id: "agri-2",
    title: "Овощи тепличные: томаты и огурцы",
    price: "от 95 ₽ / кг",
    priceValue: 95,
    location: "Ростов-на-Дону",
    publishedAt: "3 часа назад",
    postedAtIso: "2026-04-20T12:20:00+03:00",
    image: "from-green-900 via-emerald-700 to-amber-100",
    condition: "Опт от 300 кг, есть сертификация",
    description:
      "Стабильные поставки в магазины и на рынки. Закрываем логистику по ЮФО, отгрузка ежедневно.",
    sellerName: "Агрокомплекс Дон",
    sellerPhone: "+7 (863) 205-44-31",
    categoryId: "ready_products",
    categoryLabel: "овощи",
  },
  {
    id: "agri-3",
    title: "Яблоки Гала и Гренни, урожай 2026",
    price: "74 ₽ / кг",
    priceValue: 74,
    location: "Ставрополь",
    publishedAt: "Вчера",
    postedAtIso: "2026-04-19T14:45:00+03:00",
    image: "from-lime-900 via-green-600 to-yellow-100",
    condition: "Калибр 65+, хранение controlled atmosphere",
    description:
      "Товарный вид и стабильная кислотность, под супермаркет и HoReCa. Возможна сортировка под ТЗ покупателя.",
    sellerName: "Сад Премиум",
    sellerPhone: "+7 (865) 477-90-10",
    categoryId: "ready_products",
    categoryLabel: "фрукты",
  },
  {
    id: "agri-4",
    title: "Зелень (укроп, петрушка, кинза), свежая",
    price: "18 ₽ / пучок",
    priceValue: 18,
    location: "Москва",
    publishedAt: "2 часа назад",
    postedAtIso: "2026-04-20T13:20:00+03:00",
    image: "from-emerald-950 via-green-700 to-emerald-200",
    condition: "Поставка в день заказа",
    description:
      "Собственная теплица, аккуратная фасовка и поставки в розницу/кафе. Доступны регулярные слоты по Москве.",
    sellerName: "Urban Farm",
    sellerPhone: "+7 (495) 775-11-44",
    categoryId: "ready_products",
    categoryLabel: "зелень",
  },
  {
    id: "agri-5",
    title: "Трактор МТЗ 82.1, полный комплект",
    price: "1 460 000 ₽",
    priceValue: 1460000,
    location: "Воронеж",
    publishedAt: "Сегодня",
    postedAtIso: "2026-04-20T09:30:00+03:00",
    image: "from-emerald-800 via-amber-700 to-orange-200",
    condition: "Наработка 1 120 моточасов",
    description:
      "Трактор обслужен, без вложений. В комплекте задние утяжелители и комплект шин для межсезонья.",
    sellerName: "АгроТехТорг",
    sellerPhone: "+7 (473) 440-83-01",
    categoryId: "tractors",
    categoryLabel: "трактора",
  },
  {
    id: "agri-6",
    title: "Опрыскиватель самоходный, бак 2500 л",
    price: "3 980 000 ₽",
    priceValue: 3980000,
    location: "Самара",
    publishedAt: "1 день назад",
    postedAtIso: "2026-04-19T11:10:00+03:00",
    image: "from-emerald-900 via-lime-700 to-stone-200",
    condition: "Готов к полевым работам",
    description:
      "Ровный ход по полю, экономичный расход топлива, проверенная электроника и секции. Возможна доставка.",
    sellerName: "ПолеСервис",
    sellerPhone: "+7 (846) 310-55-67",
    categoryId: "equipment",
    categoryLabel: "опрыскиватели",
  },
  {
    id: "agri-7",
    title: "Прицепной разбрасыватель удобрений 2.8 м3",
    price: "610 000 ₽",
    priceValue: 610000,
    location: "Курск",
    publishedAt: "5 часов назад",
    postedAtIso: "2026-04-20T10:40:00+03:00",
    image: "from-stone-700 via-amber-600 to-lime-100",
    condition: "Состояние нового, один сезон",
    description:
      "Равномерное внесение, калибровка выполнена, документация и сервисная история на руках.",
    sellerName: "Технополе",
    sellerPhone: "+7 (471) 255-30-03",
    categoryId: "equipment",
    categoryLabel: "прицепное",
  },
  {
    id: "agri-8",
    title: "Навесной плуг 4-корпусный усиленный",
    price: "235 000 ₽",
    priceValue: 235000,
    location: "Омск",
    publishedAt: "Вчера",
    postedAtIso: "2026-04-19T16:00:00+03:00",
    image: "from-amber-900 via-stone-700 to-emerald-200",
    condition: "Рама без трещин, лемеха новые",
    description:
      "Подходит для МТЗ и аналогов, хорошо держит глубину обработки. Проверка на месте перед покупкой.",
    sellerName: "СибирьАгро",
    sellerPhone: "+7 (381) 277-09-40",
    categoryId: "equipment",
    categoryLabel: "навесное",
  },
  {
    id: "agri-9",
    title: "Готовая ферма по выращиванию ягод, 8 га",
    price: "42 000 000 ₽",
    priceValue: 42000000,
    location: "Тверь",
    publishedAt: "2 дня назад",
    postedAtIso: "2026-04-18T15:25:00+03:00",
    image: "from-green-900 via-emerald-700 to-stone-300",
    condition: "Действующий бизнес с контрактами",
    description:
      "Включены теплицы, холодильное хранение, текущая команда и контракты с федеральными сетями.",
    sellerName: "ИнвестАгро",
    sellerPhone: "+7 (482) 220-18-08",
    categoryId: "business",
    categoryLabel: "готовый бизнес",
  },
  {
    id: "agri-10",
    title: "Земля сельхозназначения 56 га у трассы",
    price: "14 500 000 ₽",
    priceValue: 14500000,
    location: "Рязань",
    publishedAt: "Сегодня",
    postedAtIso: "2026-04-20T08:40:00+03:00",
    image: "from-stone-900 via-amber-700 to-lime-200",
    condition: "Рядом электролиния и подъездная дорога",
    description:
      "Участок ровный, документы готовы, подходит под растениеводство и тепличный проект.",
    sellerName: "Земля Региона",
    sellerPhone: "+7 (491) 288-65-11",
    categoryId: "land",
    categoryLabel: "земля",
  },
];
