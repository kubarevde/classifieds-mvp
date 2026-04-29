import type { ProfilePersistedFields } from "@/components/profile/types";
import type { DefaultProfileFields, ProfileStats } from "@/services/auth/types";

/**
 * Публичный профиль / настройки аккаунта.
 * Сейчас совпадает с полями кабинета (`ProfilePersistedFields`) и дефолтами auth-мока.
 */
export type UserProfile = ProfilePersistedFields;

export type UserProfileDefaults = DefaultProfileFields;

export interface GetCurrentUserProfileResponse {
  profile: UserProfile;
}

export interface GetUserProfileStatsResponse {
  stats: ProfileStats;
}

export interface PatchUserProfileRequest {
  profile: Partial<UserProfile>;
}

export interface PatchUserProfileResponse {
  profile: UserProfile;
}

/** Минимальный идентификатор пользователя для будущих связей (listings.authorId и т.д.). */
export interface UserRef {
  id: string;
  displayName?: string;
}
