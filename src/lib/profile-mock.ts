export const profileAccountMock = {
  email: "dmitriy.kubarev@example.com",
  /** ISO для форматирования даты регистрации */
  registeredAt: "2023-09-12T10:30:00.000Z",
} as const;

export const profileStatsMock = {
  activeListings: 3,
  savedSearches: 2,
  unreadMessages: 1,
} as const;

export const defaultProfileFields = {
  name: "Дмитрий Кубарев",
  city: "Москва",
  phone: "+7 (999) 100-22-33",
  description:
    "Продаю и покупаю на платформе уже несколько лет. Отвечаю быстро, возможна доставка по договорённости.",
  notifyNewMessages: true,
  notifySavedSearches: true,
  notifyMyListings: true,
} as const;
