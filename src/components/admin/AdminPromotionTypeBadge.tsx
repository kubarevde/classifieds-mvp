import type { PromotionType } from "@/services/promotions";

const LABELS: Record<PromotionType, string> = {
  boost: "Буст",
  featured_listing: "Избранное",
  homepage_feature: "Главная",
  store_spotlight: "Витрина",
};

export function AdminPromotionTypeBadge({ type }: { type: PromotionType }) {
  return (
    <span className="inline-flex rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-900">
      {LABELS[type]}
    </span>
  );
}
