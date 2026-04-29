import type { SellerType } from "@/lib/sellers";
import { storefrontSellers } from "@/lib/sellers";

export type DemoRoleId = "guest" | "buyer" | "seller" | "all";
export const DEFAULT_DEMO_ROLE: DemoRoleId = "all";

/** Демо-витрина магазина для ролей seller / all и маркетинговых CTA. */
export const DEMO_STOREFRONT_SELLER_ID = "marina-tech";

export function getDemoBuyerPersonaSellerId(): string {
  return storefrontSellers.find((s) => s.type === "private_seller")?.id ?? "alexey-drive";
}

/** Каталог /stores: только не-частники. */
export function isStorefrontCatalogSellerType(type: SellerType): boolean {
  return type !== "private_seller";
}

export function resolveDemoCurrentSellerId(role: DemoRoleId): string | null {
  if (role === "guest") {
    return null;
  }
  if (role === "buyer") {
    return getDemoBuyerPersonaSellerId();
  }
  if (role === "seller" || role === "all") {
    return DEMO_STOREFRONT_SELLER_ID;
  }
  return null;
}

export function shouldShowStorefrontNavLinks(role: DemoRoleId): boolean {
  return role === "seller" || role === "all";
}

/** Ссылки «Мой магазин» / кабинет: только seller и all, id витрины магазина. */
export function resolveDemoStoreNavSellerId(role: DemoRoleId): string | null {
  return shouldShowStorefrontNavLinks(role) ? DEMO_STOREFRONT_SELLER_ID : null;
}
