import type { DemoRoleId } from "@/lib/demo-role-constants";

/** Стабильный id пользователя для демо-тикетов поддержки (совпадает с сидом в mock). */
export function getDemoSupportUserId(role: DemoRoleId, currentSellerId: string | null): string {
  if (role === "guest") {
    return "";
  }
  if (role === "seller") {
    return currentSellerId ?? "marina-tech";
  }
  return "buyer-dmitriy";
}
