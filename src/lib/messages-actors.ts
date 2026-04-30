import type { DemoRoleId } from "@/lib/demo-role-constants";

export const DEMO_BUYER_USER_ID = "buyer-dmitriy";

export function toSellerUserId(sellerId: string | null | undefined): string | null {
  if (!sellerId) return null;
  return `seller-account:${sellerId}`;
}

export function resolvePrimaryActorId(role: DemoRoleId, sellerId: string | null | undefined): string {
  if (role === "seller") {
    return toSellerUserId(sellerId) ?? "seller-account:marina-tech";
  }
  return DEMO_BUYER_USER_ID;
}

export function resolveActorIdsForRole(role: DemoRoleId, sellerId: string | null | undefined): string[] {
  const sellerUserId = toSellerUserId(sellerId);
  if (role === "seller") {
    return sellerUserId ? [sellerUserId] : [];
  }
  if (role === "all") {
    return [DEMO_BUYER_USER_ID, ...(sellerUserId ? [sellerUserId] : [])];
  }
  if (role === "guest") {
    return [];
  }
  return [DEMO_BUYER_USER_ID];
}

export function roleByActorId(actorId: string) {
  if (actorId.startsWith("seller-account:")) {
    return "store_owner" as const;
  }
  return "buyer" as const;
}
