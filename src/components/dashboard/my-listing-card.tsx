import { DashboardListing, DashboardListingStatus } from "@/components/dashboard/types";
import { Badge, Button, Card } from "@/components/ui";
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
    <Card className="p-3 sm:p-4">
      <div className="flex gap-3">
        <div className={`h-20 w-20 shrink-0 rounded-xl bg-gradient-to-br ${listing.image} sm:h-24 sm:w-24`} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-bold tracking-tight text-slate-900">{listing.price}</p>
            <Badge
              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyle[listing.status]}`}
              variant="outline"
            >
              {dashboardStatusLabel[listing.status]}
            </Badge>
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
        <Button
          type="button"
          onClick={() => onEdit(listing.id)}
          variant="outline"
          size="sm"
        >
          Редактировать
        </Button>
        <Button
          type="button"
          onClick={() => onArchive(listing.id)}
          variant="outline"
          size="sm"
        >
          Снять с публикации
        </Button>
        <Button
          type="button"
          onClick={() => onMarkSold(listing.id)}
          variant="secondary"
          size="sm"
        >
          Отметить как продано
        </Button>
        <Button
          type="button"
          onClick={() => onDelete(listing.id)}
          variant="outline"
          size="sm"
          className="border-rose-200 text-rose-700 hover:bg-rose-50"
        >
          Удалить
        </Button>
      </div>
    </Card>
  );
}
