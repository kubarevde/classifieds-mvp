import { DashboardListing, DashboardListingStatus } from "@/components/dashboard/types";
import { dashboardCategoryLabel, dashboardStatusLabel } from "@/lib/dashboard";

type ListingActions = {
  onEdit: (id: string) => void;
  onArchive: (id: string) => void;
  onMarkSold: (id: string) => void;
  onDelete: (id: string) => void;
};

type MyListingCardProps = {
  listing: DashboardListing;
} & ListingActions;

const statusStyle: Record<DashboardListingStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  draft: "bg-amber-50 text-amber-700 border-amber-200",
  hidden: "bg-slate-100 text-slate-600 border-slate-200",
  sold: "bg-sky-50 text-sky-700 border-sky-200",
};

export function MyListingCard({
  listing,
  onEdit,
  onArchive,
  onMarkSold,
  onDelete,
}: MyListingCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex gap-3">
        <div className={`h-20 w-20 shrink-0 rounded-xl bg-gradient-to-br ${listing.image} sm:h-24 sm:w-24`} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-bold tracking-tight text-slate-900">{listing.price}</p>
            <span
              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyle[listing.status]}`}
            >
              {dashboardStatusLabel[listing.status]}
            </span>
          </div>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-slate-900 sm:text-base">
            {listing.title}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 sm:text-sm">
            <span>{dashboardCategoryLabel[listing.category]}</span>
            <span>•</span>
            <span>{listing.city}</span>
            <span>•</span>
            <span>{listing.publishedAt}</span>
            <span>•</span>
            <span>{listing.views} просмотров</span>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <button
          type="button"
          onClick={() => onEdit(listing.id)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 sm:text-sm"
        >
          Редактировать
        </button>
        <button
          type="button"
          onClick={() => onArchive(listing.id)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 sm:text-sm"
        >
          Снять с публикации
        </button>
        <button
          type="button"
          onClick={() => onMarkSold(listing.id)}
          className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-medium text-sky-700 transition hover:bg-sky-100 sm:text-sm"
        >
          Отметить как продано
        </button>
        <button
          type="button"
          onClick={() => onDelete(listing.id)}
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-100 sm:text-sm"
        >
          Удалить
        </button>
      </div>
    </article>
  );
}
