import Link from "next/link";

import { SellerStorefront, getSellerTypeLabel } from "@/lib/sellers";

type SellerCardProps = {
  sellerName: string;
  sellerPhone: string;
  listingId: string;
  listingTitle: string;
  storefront?: SellerStorefront | null;
};

const primaryButtonClassName =
  "block w-full rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-700 active:scale-[0.99]";
const secondaryButtonClassName =
  "block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.99]";
const neutralButtonClassName =
  "block w-full rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-200 active:scale-[0.99]";

export function SellerCard({
  sellerName,
  sellerPhone,
  listingId,
  listingTitle,
  storefront,
}: SellerCardProps) {
  const trustSignals = storefront?.trustBadges.slice(0, 2) ?? [];
  const activeListings = storefront?.listingRefs.filter((item) => item.status === "active").length ?? 1;
  const allListingsHref = storefront ? `/sellers/${storefront.id}#seller-listings` : "/listings";
  const storeHref = storefront ? `/sellers/${storefront.id}` : "/listings";

  return (
    <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div
        className={`h-20 bg-gradient-to-br ${
          storefront?.heroGradientClass ?? "from-slate-900 via-slate-700 to-slate-500"
        }`}
      />
      <div className="space-y-4 p-4">
        <section className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
              {storefront?.avatarLabel ?? sellerName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 space-y-0.5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Продавец</p>
              <p className="line-clamp-1 text-lg font-semibold text-slate-900">
                {storefront?.storefrontName ?? sellerName}
              </p>
              <p className="line-clamp-1 text-sm text-slate-500">{sellerName}</p>
            </div>
          </div>

          <div className="space-y-1.5 text-sm text-slate-600">
            <p>{storefront ? getSellerTypeLabel(storefront.type) : "Частный продавец"}</p>
            <p>{storefront?.memberSinceLabel ?? "На платформе недавно"}</p>
            <p>Активных объявлений: {activeListings}</p>
            <p>Обычно отвечает за: {storefront?.responseSpeedLabel ?? "несколько часов"}</p>
          </div>

          {trustSignals.length ? (
            <div className="flex flex-wrap gap-1.5">
              {trustSignals.map((signal) => (
                <span
                  key={signal.id}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700"
                >
                  {signal.label}
                </span>
              ))}
            </div>
          ) : null}
        </section>

        <section className="space-y-2 border-t border-slate-100 pt-4">
          <Link
            href={{
              pathname: "/messages",
              query: {
                listingId,
                sellerName,
                listingTitle,
              },
            }}
            className={primaryButtonClassName}
          >
            Написать продавцу
          </Link>
          <button type="button" className={secondaryButtonClassName}>
            Показать телефон: {sellerPhone}
          </button>
        </section>

        <section className="space-y-2 border-t border-slate-100 pt-4">
          <Link href={allListingsHref} className={secondaryButtonClassName}>
            Все объявления продавца
          </Link>
          <Link href={storeHref} className={neutralButtonClassName}>
            Открыть магазин
          </Link>
        </section>

        {storefront ? (
          <p className="border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500">
            Это ваш storefront?{" "}
            <Link href={`/dashboard/store?sellerId=${storefront.id}`} className="font-semibold text-slate-700 underline">
              Управлять магазином
            </Link>
          </p>
        ) : null}
      </div>
    </aside>
  );
}
