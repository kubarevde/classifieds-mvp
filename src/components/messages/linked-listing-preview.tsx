import Link from "next/link";

import { Listing } from "@/lib/types";

type LinkedListingPreviewProps = {
  listing: Listing | null;
};

export function LinkedListingPreview({ listing }: LinkedListingPreviewProps) {
  if (!listing) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-500">
        Объявление не найдено в mock-данных.
      </div>
    );
  }

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="block rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-slate-300 hover:bg-slate-100"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Связанное объявление</p>
      <p className="mt-1 line-clamp-1 text-sm font-semibold text-slate-900">{listing.title}</p>
      <p className="mt-1 text-sm text-slate-600">{listing.price}</p>
    </Link>
  );
}
