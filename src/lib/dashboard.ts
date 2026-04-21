import { DashboardFilter, DashboardListingStatus } from "@/components/dashboard/types";
import { ListingCategory } from "@/lib/types";

export const dashboardCategoryLabel: Record<ListingCategory, string> = {
  auto: "Автомобили",
  electronics: "Электроника",
  real_estate: "Недвижимость",
  services: "Услуги",
};

export const dashboardStatusLabel: Record<DashboardListingStatus, string> = {
  active: "Активно",
  draft: "Черновик",
  hidden: "Скрыто",
  sold: "Продано",
};

export const dashboardFilterLabel: Record<DashboardFilter, string> = {
  all: "Все",
  active: "Активные",
  draft: "Черновики",
  sold: "Продано",
  hidden: "Скрытые",
};

export function isListingVisibleByFilter(status: DashboardListingStatus, filter: DashboardFilter) {
  return filter === "all" || status === filter;
}
