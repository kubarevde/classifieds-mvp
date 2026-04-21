import Link from "next/link";

type SellerCardProps = {
  sellerName: string;
  sellerPhone: string;
  listingId: string;
  listingTitle: string;
};

const actionButtonClassName =
  "w-full rounded-xl px-4 py-3 text-sm font-semibold transition active:scale-[0.99]";

export function SellerCard({ sellerName, sellerPhone, listingId, listingTitle }: SellerCardProps) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Продавец</p>
      <p className="mt-2 text-lg font-semibold text-slate-900">{sellerName}</p>
      <p className="mt-1 text-sm text-slate-500">{sellerPhone}</p>

      <div className="mt-4 space-y-2">
        <Link
          href={{
            pathname: "/messages",
            query: {
              listingId,
              sellerName,
              listingTitle,
            },
          }}
          className={`${actionButtonClassName} bg-slate-900 text-white hover:bg-slate-700`}
        >
          Написать продавцу
        </Link>
        <button
          type="button"
          className={`${actionButtonClassName} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}
        >
          Позвонить
        </button>
      </div>
    </aside>
  );
}
