import Link from "next/link";
import { Star } from "lucide-react";

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
  const visibleBadges = store.trustBadges.slice(0, 2);

  return (
    <article className="group rounded-2xl border border-slate-200/90 bg-[linear-gradient(145deg,#ffffff_0%,#f8fafc_100%)] p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
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
        <span className="inline-flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" strokeWidth={1.5} /> {store.rating.toFixed(1)} · {store.reviewsCount}
        </span>
        <span>{store.activeListingsCount} объявлений</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {visibleBadges.map((badge) => (
          <span
            key={`${store.id}-${badge}`}
            className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600"
          >
            {badge}
          </span>
        ))}
      </div>

      <p className="mt-2 max-h-0 overflow-hidden text-xs leading-relaxed text-slate-500 opacity-0 transition-all duration-200 group-hover:max-h-16 group-hover:opacity-100">
        {store.shortDescription}
      </p>

      <Link
        href={store.href}
        className="mt-3 inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Перейти в магазин
      </Link>
    </article>
  );
}
