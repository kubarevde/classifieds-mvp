import type { SellerDashboardListing, SellerStorefront } from "@/lib/sellers";

import { StoreAnalyticsWorkspace } from "@/components/analytics/StoreAnalyticsWorkspace";

type StoreAnalyticsSectionProps = {
  seller: SellerStorefront;
  listings: SellerDashboardListing[];
};

/**
 * Единая вкладка аналитики магазина (Store Analytics 2.0): данные из сервиса, графики Recharts, гейты тарифа.
 */
export function StoreAnalyticsSection({ seller, listings }: StoreAnalyticsSectionProps) {
  return <StoreAnalyticsWorkspace seller={seller} listings={listings} />;
}
