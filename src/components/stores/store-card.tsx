import Link from "next/link";

import { TrustSummary } from "@/components/trust";
import { cn } from "@/components/ui/cn";
import { buttonVariants } from "@/lib/button-styles";

export type StoreCatalogItem = {
  id: string;
  href: string;
  avatarLabel: string;
  storefrontName: string;
  specializationLabel: string;
  shortDescription: string;
  city: string;
  rating: number;
  reviewsCount: number;
  activeListingsCount: number;
  trustBadges: string[];
};

type StoreCardProps = {
  store: StoreCatalogItem;
};

export function StoreCard({ store }: StoreCardProps) {
  const isVerified = store.trustBadges.some((badge) => badge.toLowerCase().includes("провер"));

  return (
    <article className="group rounded-2xl border border-slate-200/90 bg-white p-4 shadow-none transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-900 text-xs font-semibold text-white">
          {store.avatarLabel}
        </div>
        <div className="min-w-0">
          <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">{store.storefrontName}</h3>
          <p className="line-clamp-1 text-xs text-slate-500">{store.specializationLabel}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
        <span>{store.city}</span>
        <span>{store.activeListingsCount} объявлений</span>
      </div>

      <TrustSummary
        variant="compact"
        verified={isVerified}
        rating={store.rating}
        reviewsCount={store.reviewsCount}
        className="mt-3"
      />

      <p className="mt-2 max-h-0 overflow-hidden text-xs leading-relaxed text-slate-500 opacity-0 transition-all duration-200 group-hover:max-h-16 group-hover:opacity-100">
        {store.shortDescription}
      </p>

      <Link
        href={store.href}
        className={cn(buttonVariants({ variant: "secondary", size: "md" }), "mt-3 w-full justify-center rounded-xl sm:w-auto")}
      >
        Перейти в магазин
      </Link>
    </article>
  );
}
