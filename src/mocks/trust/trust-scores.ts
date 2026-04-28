import { computeBadgesFromComponents, getTrustLevel, type TrustScore } from "@/entities/trust/model";
import { storefrontSellers } from "@/services/sellers/seller-data";

function buildScoreBySellerId(sellerId: string): number {
  let hash = 0;
  for (let i = 0; i < sellerId.length; i += 1) {
    hash = Math.imul(31, hash) + sellerId.charCodeAt(i);
  }
  return Math.abs(hash);
}

function buildTrustScore(seed: (typeof storefrontSellers)[number]): TrustScore {
  const hash = buildScoreBySellerId(seed.id);
  const ageDays = Math.max(20, (new Date().getFullYear() - seed.memberSinceYear) * 365 + (hash % 180));
  const responseRate = Math.min(0.99, 0.62 + ((hash % 33) / 100));
  const profileCompleteness = Math.min(0.99, 0.7 + (((hash >> 2) % 26) / 100));
  const successfulDeals = Math.max(4, Math.round(seed.metrics.messagesLast30d * 0.85 + (hash % 19)));
  const responseTime: TrustScore["components"]["response_time"] =
    responseRate >= 0.88 ? "fast" : responseRate >= 0.74 ? "normal" : "slow";
  const verifiedBusiness = seed.type === "store_business" || seed.type === "agriculture_oriented";
  const verifiedIdentity = true;
  const noDisputes = hash % 9 !== 0;

  let overall = 0;
  overall += verifiedIdentity ? 14 : 0;
  overall += verifiedBusiness ? 12 : 6;
  overall += Math.round(responseRate * 23);
  overall += responseTime === "fast" ? 12 : responseTime === "normal" ? 8 : 4;
  overall += Math.min(18, Math.round(successfulDeals / 4));
  overall += Math.min(12, Math.round(ageDays / 95));
  overall += noDisputes ? 7 : 0;
  overall += Math.round(profileCompleteness * 14);
  overall = Math.max(18, Math.min(100, overall));

  const components: TrustScore["components"] = {
    verified_identity: verifiedIdentity,
    verified_business: verifiedBusiness,
    response_rate: responseRate,
    response_time: responseTime,
    successful_deals: successfulDeals,
    age_days: ageDays,
    no_disputes: noDisputes,
    profile_completeness: profileCompleteness,
  };

  return {
    userId: seed.id,
    overall,
    components,
    level: getTrustLevel(overall),
    badges: computeBadgesFromComponents(seed.id, components),
  };
}

export const trustScoresMock: TrustScore[] = storefrontSellers.map(buildTrustScore);
