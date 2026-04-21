import { ListingsView } from "@/lib/listings";
import { Listing } from "@/lib/types";
import { ListingPreviewCard } from "@/components/listings/listing-preview-card";

type ListingsGridProps = {
  listings: Listing[];
  view: ListingsView;
};

export function ListingsGrid({ listings, view }: ListingsGridProps) {
  if (listings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        Ничего не найдено. Попробуйте изменить фильтры или поисковый запрос.
      </div>
    );
  }

  return (
    <div className={view === "grid" ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
      {listings.map((listing) => (
        <ListingPreviewCard key={listing.id} listing={listing} view={view} />
      ))}
    </div>
  );
}
