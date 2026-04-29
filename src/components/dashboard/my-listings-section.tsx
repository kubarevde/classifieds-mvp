import { DashboardFilter, DashboardListing } from "@/components/dashboard/types";
import { dashboardFilterLabel } from "@/lib/dashboard";
import { MyListingCard } from "@/components/dashboard/my-listing-card";
import Link from "next/link";
import { Button } from "@/components/ui";

type MyListingsSectionProps = {
  listings: DashboardListing[];
  filter: DashboardFilter;
  onEdit: (id: string) => void;
  onArchive: (id: string) => void;
  onMarkSold: (id: string) => void;
  onDelete: (id: string) => void;
};

export function MyListingsSection({
  listings,
  filter,
  onEdit,
  onArchive,
  onMarkSold,
  onDelete,
}: MyListingsSectionProps) {
  if (listings.length === 0 && filter === "all") {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-base font-semibold text-slate-900">У вас пока нет объявлений</p>
        <p className="mt-2 text-sm text-slate-600">
          Создайте первое объявление в пару кликов и начните получать отклики.
        </p>
        <div className="mt-4">
          <Link href="/create-listing">
            <Button>Разместить объявление</Button>
          </Link>
        </div>
      </section>
    );
  }

  if (listings.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-base font-semibold text-slate-900">
          В разделе «{dashboardFilterLabel[filter]}» пока пусто
        </p>
        <p className="mt-2 text-sm text-slate-600">Попробуйте другой фильтр или обновите статус объявления.</p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {listings.map((listing) => (
        <MyListingCard
          key={listing.id}
          listing={listing}
          onEdit={onEdit}
          onArchive={onArchive}
          onMarkSold={onMarkSold}
          onDelete={onDelete}
        />
      ))}
    </section>
  );
}
