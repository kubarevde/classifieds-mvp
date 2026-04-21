export type ElectronicsCategory = {
  id: string;
  label: string;
  description: string;
};

export type ElectronicsListing = {
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

export const electronicsCategories: ElectronicsCategory[] = [
  {
    id: "smartphones",
    label: "Смартфоны и аксессуары",
    description: "Телефоны, wearables, аксессуары и зарядные решения",
  },
  {
    id: "laptops_pc",
    label: "Ноутбуки и ПК",
    description: "Ноутбуки, системные блоки, мониторы и рабочие станции",
  },
  {
    id: "consoles",
    label: "Игровые консоли",
    description: "Консоли, геймпады и комплекты для гейминга",
  },
  {
    id: "photo_audio",
    label: "Фото и аудио",
    description: "Камеры, микрофоны, наушники и звук",
  },
  {
    id: "smart_home",
    label: "Смарт-устройства",
    description: "Гаджеты для дома, умные датчики и сети",
  },
  {
    id: "components",
    label: "Комплектующие",
    description: "Видеокарты, SSD, память и другие апгрейды",
  },
];

export const electronicsListings: ElectronicsListing[] = [
  {
    id: "tech-1",
    title: "iPhone 15 Pro 256GB, eSIM + физическая SIM",
    price: "93 000 ₽",
    priceValue: 93000,
    location: "Москва",
    publishedAt: "Сегодня",
    postedAtIso: "2026-04-20T09:30:00+03:00",
    image: "from-slate-900 via-slate-700 to-slate-200",
    condition: "Как новый, АКБ 99%",
    description:
      "Телефон в отличном состоянии, без сколов, весь комплект и чек. Использовался в чехле и с защитным стеклом.",
    sellerName: "Владимир",
    sellerPhone: "+7 (926) 411-73-22",
    categoryId: "smartphones",
    categoryLabel: "Смартфоны и аксессуары",
  },
  {
    id: "tech-2",
    title: "Samsung Galaxy S24 Ultra 12/512",
    price: "87 500 ₽",
    priceValue: 87500,
    location: "Санкт-Петербург",
    publishedAt: "3 часа назад",
    postedAtIso: "2026-04-20T12:35:00+03:00",
    image: "from-zinc-900 via-zinc-700 to-zinc-200",
    condition: "Официальная гарантия",
    description:
      "Ростест, полный комплект, коробка и чек. Чистый экран, без выгорания, аккуратное использование.",
    sellerName: "Илья",
    sellerPhone: "+7 (921) 332-40-08",
    categoryId: "smartphones",
    categoryLabel: "Смартфоны и аксессуары",
  },
  {
    id: "tech-3",
    title: "MacBook Pro 14 M3 Pro, 18/512",
    price: "189 000 ₽",
    priceValue: 189000,
    location: "Казань",
    publishedAt: "Вчера",
    postedAtIso: "2026-04-19T19:20:00+03:00",
    image: "from-slate-800 via-slate-600 to-blue-200",
    condition: "Идеальное состояние, 34 цикла",
    description:
      "Русская раскладка, полный комплект, чек. Использовался для разработки, без ремонта и вскрытий.",
    sellerName: "Артур",
    sellerPhone: "+7 (917) 100-28-44",
    categoryId: "laptops_pc",
    categoryLabel: "Ноутбуки и ПК",
  },
  {
    id: "tech-4",
    title: "Игровой ПК RTX 4070 Super / Ryzen 7",
    price: "142 000 ₽",
    priceValue: 142000,
    location: "Екатеринбург",
    publishedAt: "1 день назад",
    postedAtIso: "2026-04-19T14:05:00+03:00",
    image: "from-indigo-900 via-indigo-700 to-sky-200",
    condition: "Собран и протестирован",
    description:
      "Стабильные температуры под нагрузкой, SSD 1TB, тихое охлаждение. Подходит для игр и стриминга.",
    sellerName: "PC Lab",
    sellerPhone: "+7 (902) 221-63-19",
    categoryId: "laptops_pc",
    categoryLabel: "Ноутбуки и ПК",
  },
  {
    id: "tech-5",
    title: "PlayStation 5 Slim + 2 DualSense",
    price: "53 900 ₽",
    priceValue: 53900,
    location: "Новосибирск",
    publishedAt: "Сегодня",
    postedAtIso: "2026-04-20T10:15:00+03:00",
    image: "from-slate-900 via-blue-800 to-cyan-200",
    condition: "Чек, гарантия, тихая ревизия",
    description:
      "Приставка в отличном состоянии, без троттлинга и перегрева. Плюс второй геймпад и зарядная база.",
    sellerName: "Роман",
    sellerPhone: "+7 (913) 500-14-88",
    categoryId: "consoles",
    categoryLabel: "Игровые консоли",
  },
  {
    id: "tech-6",
    title: "Sony A7 III + объектив 28-70",
    price: "118 000 ₽",
    priceValue: 118000,
    location: "Краснодар",
    publishedAt: "5 часов назад",
    postedAtIso: "2026-04-20T11:45:00+03:00",
    image: "from-zinc-900 via-slate-700 to-stone-200",
    condition: "Пробег 27k, бережное использование",
    description:
      "Камера и стекло без проблем, матрица чистая. Подойдет для коммерческой съемки и контента.",
    sellerName: "Андрей",
    sellerPhone: "+7 (918) 711-20-67",
    categoryId: "photo_audio",
    categoryLabel: "Фото и аудио",
  },
  {
    id: "tech-7",
    title: "Умный комплект дома: хаб, датчики, камера",
    price: "21 500 ₽",
    priceValue: 21500,
    location: "Нижний Новгород",
    publishedAt: "2 дня назад",
    postedAtIso: "2026-04-18T16:40:00+03:00",
    image: "from-slate-800 via-cyan-700 to-sky-200",
    condition: "Готов к установке",
    description:
      "В наборе шлюз, датчики открытия и движения, камера. Настроен сценарий уведомлений в приложение.",
    sellerName: "Smart Home Store",
    sellerPhone: "+7 (952) 930-31-45",
    categoryId: "smart_home",
    categoryLabel: "Смарт-устройства",
  },
  {
    id: "tech-8",
    title: "Видеокарта RTX 4080 Super 16GB",
    price: "119 500 ₽",
    priceValue: 119500,
    location: "Воронеж",
    publishedAt: "Вчера",
    postedAtIso: "2026-04-19T12:25:00+03:00",
    image: "from-slate-900 via-indigo-800 to-violet-200",
    condition: "На гарантии, полный комплект",
    description:
      "Не майнилась, использовалась в домашнем ПК. Температуры в норме, любые проверки на месте.",
    sellerName: "Денис",
    sellerPhone: "+7 (473) 310-98-60",
    categoryId: "components",
    categoryLabel: "Комплектующие",
  },
];
