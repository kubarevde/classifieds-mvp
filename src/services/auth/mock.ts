import type { DefaultProfileFields, ProfileAccount, ProfileStats } from "./types";

const profileAccountMock: ProfileAccount = {
  email: "dmitriy.kubarev@example.com",
  registeredAt: "2023-09-12T10:30:00.000Z",
};

const profileStatsMock: ProfileStats = {
  activeListings: 3,
  savedSearches: 2,
  unreadMessages: 1,
};

const defaultProfileFields: DefaultProfileFields = {
  name: "Дмитрий Кубарев",
  city: "Москва",
  phone: "+7 (999) 100-22-33",
  description: "Продаю и покупаю на платформе уже несколько лет. Отвечаю быстро, возможна доставка по договорённости.",
  notifyNewMessages: true,
  notifySavedSearches: true,
  notifyMyListings: true,
};

export async function getProfileAccount(): Promise<ProfileAccount> {
  return getProfileAccountSync();
}

export async function getProfileStats(): Promise<ProfileStats> {
  return getProfileStatsSync();
}

export async function getDefaultProfileFields(): Promise<DefaultProfileFields> {
  return getDefaultProfileFieldsSync();
}

export function getProfileAccountSync(): ProfileAccount {
  return { ...profileAccountMock };
}

export function getProfileStatsSync(): ProfileStats {
  return { ...profileStatsMock };
}

export function getDefaultProfileFieldsSync(): DefaultProfileFields {
  return { ...defaultProfileFields };
}
