import { FavoriteButton } from "@/components/favorites/favorite-button";
import { Listing } from "@/lib/types";

const categoryTag: Record<Listing["category"], string> = {
  auto: "Авто",
  electronics: "Электроника",
  real_estate: "Недвижимость",
  services: "Услуги",
};

type ListingCardProps = {
  listing: Listing;
};

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
      <div
        className={`relative h-44 bg-gradient-to-br ${listing.image} p-4`}
        aria-label={`${listing.title} cover`}
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(15,23,42,0.28),transparent_55%)]" />
        <div className="relative flex items-start justify-between">
          <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
            {categoryTag[listing.category]}
          </span>
          <FavoriteButton listingId={listing.id} size="sm" />
        </div>
        <p className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white">
          Фото
        </p>
      </div>

      <div className="space-y-2.5 p-4">
        <p className="text-xl font-bold tracking-tight text-slate-900">{listing.price}</p>
        <h3 className="line-clamp-2 min-h-[3rem] text-base font-semibold leading-6 text-slate-900 transition group-hover:text-slate-700">
          {listing.title}
        </h3>
        <p className="line-clamp-1 text-sm text-slate-600">{listing.condition}</p>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">📍 {listing.location}</span>
          <span>{listing.publishedAt}</span>
        </div>
      </div>
    </article>
  );
}
