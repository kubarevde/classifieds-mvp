import { DiscoveryListing } from "@/lib/discovery";
import { MapPin } from "lucide-react";

type VerticalListingCardProps = {
  listing: DiscoveryListing;
  tone?: "agriculture" | "electronics";
};

export function VerticalListingCard({ listing, tone = "agriculture" }: VerticalListingCardProps) {
  const cardTone =
    tone === "electronics"
      ? {
          wrapper: "border-slate-300/80 shadow-slate-900/10",
          overlay: "bg-[linear-gradient(to_top,rgba(15,23,42,0.78),rgba(15,23,42,0.16)_55%)]",
          category: "text-slate-800",
          condition: "text-slate-100/95",
          seller: "border-slate-200 bg-slate-50/90",
          sellerName: "text-slate-900",
          sellerPhone: "text-slate-700",
        }
      : {
          wrapper: "border-emerald-200/70 shadow-emerald-950/10",
          overlay: "bg-[linear-gradient(to_top,rgba(6,33,24,0.7),rgba(6,33,24,0.12)_55%)]",
          category: "text-emerald-900",
          condition: "text-emerald-50/95",
          seller: "border-emerald-100 bg-emerald-50/70",
          sellerName: "text-emerald-900",
          sellerPhone: "text-emerald-800",
        };

  return (
    <article className={`snap-start overflow-hidden rounded-3xl border bg-white shadow-lg ${cardTone.wrapper}`}>
      <div className={`relative h-72 bg-gradient-to-br ${listing.image} p-4 sm:h-[22rem]`}>
        <div className={`absolute inset-0 ${cardTone.overlay}`} />
        <div className="relative flex items-start justify-between gap-2">
          <span className={`rounded-full bg-white/90 px-3 py-1 text-xs font-semibold ${cardTone.category}`}>
            {listing.categoryLabel}
          </span>
          <span className="rounded-full border border-white/30 bg-black/30 px-3 py-1 text-xs font-medium text-white">
            {listing.themeLabel}
          </span>
        </div>

        <div className="relative mt-32 sm:mt-44">
          <p className="text-2xl font-bold tracking-tight text-white">{listing.price}</p>
          <h3 className="mt-1 line-clamp-2 text-lg font-semibold text-white">{listing.title}</h3>
          <p className={`mt-2 text-sm ${cardTone.condition}`}>{listing.condition}</p>
        </div>
      </div>

      <div className="space-y-3 p-4 sm:p-5">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} /> {listing.location}
          </span>
          <span>{listing.publishedAt}</span>
        </div>
        <p className="line-clamp-3 text-sm leading-6 text-stone-700">{listing.description}</p>
        <div className={`rounded-xl border p-3 text-sm ${cardTone.seller}`}>
          <p className={`font-semibold ${cardTone.sellerName}`}>{listing.sellerName}</p>
          <p className={cardTone.sellerPhone}>{listing.sellerPhone}</p>
        </div>
      </div>
    </article>
  );
}
