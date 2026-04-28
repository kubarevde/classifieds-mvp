export interface TrustScore {
  userId: string;
  overall: number;
  components: {
    verified_identity: boolean;
    verified_business: boolean;
    response_rate: number;
    response_time: "fast" | "normal" | "slow";
    successful_deals: number;
    age_days: number;
    no_disputes: boolean;
    profile_completeness: number;
  };
  badges: TrustBadge[];
  level: "new" | "trusted" | "verified" | "top_seller";
}

export interface TrustBadge {
  type:
    | "identity_verified"
    | "business_verified"
    | "top_rated"
    | "fast_response"
    | "trusted_seller"
    | "years_on_platform";
  label: string;
  since?: Date;
}

export interface Review {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  targetId: string;
  listingId?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  pros?: string;
  cons?: string;
  photos?: string[];
  sellerReply?: string;
  createdAt: Date;
  verified: boolean;
  helpful: number;
}

export function getTrustLevel(overall: number): TrustScore["level"] {
  if (overall >= 90) {
    return "top_seller";
  }
  if (overall >= 75) {
    return "verified";
  }
  if (overall >= 55) {
    return "trusted";
  }
  return "new";
}

export function computeBadgesFromComponents(
  userId: string,
  components: TrustScore["components"],
): TrustBadge[] {
  const now = new Date();
  const badges: TrustBadge[] = [];
  if (components.verified_identity) {
    badges.push({ type: "identity_verified", label: "Личность подтверждена" });
  }
  if (components.verified_business) {
    badges.push({ type: "business_verified", label: "Бизнес проверен" });
  }
  if (components.response_time === "fast" && components.response_rate >= 0.85) {
    badges.push({ type: "fast_response", label: "Быстрый ответ" });
  }
  if (components.successful_deals >= 35 && components.no_disputes) {
    badges.push({ type: "trusted_seller", label: "Надёжный продавец" });
  }
  if (components.successful_deals >= 60 && components.response_rate >= 0.9 && components.no_disputes) {
    badges.push({ type: "top_rated", label: "Топ-рейтинг" });
  }
  if (components.age_days >= 365) {
    badges.push({
      type: "years_on_platform",
      label: "Более года на платформе",
      since: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
    });
  }
  if (badges.length === 0) {
    badges.push({
      type: "trusted_seller",
      label: `Профиль ${userId} в развитии`,
    });
  }
  return badges;
}
