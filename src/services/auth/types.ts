export type ProfileAccount = {
  email: string;
  registeredAt: string;
};

export type ProfileStats = {
  activeListings: number;
  savedSearches: number;
  unreadMessages: number;
};

export type DefaultProfileFields = {
  name: string;
  city: string;
  phone: string;
  description: string;
  notifyNewMessages: boolean;
  notifySavedSearches: boolean;
  notifyMyListings: boolean;
};
