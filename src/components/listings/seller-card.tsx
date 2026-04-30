"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { TrustSummary } from "@/components/trust";
import { useDemoRole } from "@/components/demo-role/demo-role";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { resolvePrimaryActorId } from "@/lib/messages-actors";
import { buttonVariants } from "@/lib/button-styles";
import { SellerStorefront, getSellerTypeLabel } from "@/lib/sellers";
import { messagesService } from "@/services/messages";
import { getVerificationProfile } from "@/services/verification";
import { VerificationBadgeFromTarget } from "@/components/verification/VerificationBadgeFromTarget";

type SellerCardProps = {
  sellerName: string;
  sellerPhone: string;
  listingId: string;
  storefront?: SellerStorefront | null;
};

export function SellerCard({
  sellerName,
  sellerPhone,
  listingId,
  storefront,
}: SellerCardProps) {
  const router = useRouter();
  const { role, currentSellerId } = useDemoRole();
  const isVerified = storefront ? storefront.trustBadges.some((badge) => badge.id === "verified") : false;
  const reviewsCount = storefront ? Math.max(8, Math.round(storefront.followersCount * 0.16)) : null;
  const activeListings = storefront?.listingRefs.filter((item) => item.status === "active").length ?? 1;
  const allListingsHref = storefront ? `/stores/${storefront.id}#seller-listings` : "/listings";
  const storeHref = storefront ? `/stores/${storefront.id}` : "/listings";
  const threadTargetSellerId = storefront?.id ?? null;

  const sellerIdentityProfile = storefront ? getVerificationProfile(storefront.id, "seller") : null;
  const storeBusinessProfile = storefront ? getVerificationProfile(storefront.id, "store") : null;

  const identityVerified = sellerIdentityProfile?.status === "verified";
  const storeVerified = storeBusinessProfile?.status === "verified";

  return (
    <Card className="overflow-hidden">
      <div
        className={`h-20 bg-gradient-to-br ${
          storefront?.heroGradientClass ?? "from-slate-900 via-slate-700 to-slate-500"
        }`}
      />
      <CardContent className="space-y-4 p-4">
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

          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Trust</p>
            {storefront ? (
              <Link href={`/stores/${storefront.id}#store-reputation`} className="inline-flex">
                <TrustSummary
                  variant="compact"
                  verified={isVerified}
                  rating={storefront.metrics.rating}
                  reviewsCount={reviewsCount}
                />
              </Link>
            ) : (
              <TrustSummary variant="compact" verified={false} />
            )}
          </div>

          {storefront ? (
            <div className="space-y-2 pt-2">
              <div className="flex flex-wrap gap-2">
                <VerificationBadgeFromTarget targetId={storefront.id} subjectType="seller" size="sm" variant="compact" />
                <VerificationBadgeFromTarget targetId={storefront.id} subjectType="store" size="sm" variant="compact" />
              </div>
              <div className="space-y-1">
                {identityVerified ? (
                  <p className="text-xs font-semibold text-emerald-800">Профиль подтверждён</p>
                ) : null}
                {storeVerified ? (
                  <p className="text-xs font-semibold text-emerald-800">Магазин прошёл проверку</p>
                ) : null}
                {!identityVerified && !storeVerified ? (
                  <p className="text-xs text-slate-600">В демо идёт проверка профиля магазина/личности.</p>
                ) : null}
              </div>
            </div>
          ) : null}
        </section>

        <section className="space-y-2 border-t border-slate-100 pt-4">
          <Link
            href="#"
            onClick={async (event) => {
              event.preventDefault();
              if (!threadTargetSellerId) {
                router.push("/messages");
                return;
              }
              const starterId = resolvePrimaryActorId(role, currentSellerId);
              const thread = await messagesService.createThread({
                starterId,
                otherUserId: `seller-account:${threadTargetSellerId}`,
                listingId,
                storeId: threadTargetSellerId,
              });
              router.push(`/messages/${encodeURIComponent(thread.id)}`);
            }}
            className={cn(buttonVariants({ variant: "primary", size: "md" }), "w-full text-center")}
          >
            Написать продавцу
          </Link>
          <button
            type="button"
            className={cn(buttonVariants({ variant: "secondary", size: "md" }), "w-full")}
          >
            Показать телефон: {sellerPhone}
          </button>
        </section>

        <section className="space-y-2 border-t border-slate-100 pt-4">
          <Link
            href={allListingsHref}
            className={cn(buttonVariants({ variant: "secondary", size: "md" }), "w-full text-center")}
          >
            Все объявления продавца
          </Link>
          <Link
            href={storeHref}
            className={cn(
              buttonVariants({ variant: "ghost", size: "md" }),
              "w-full bg-slate-100 text-center text-slate-900 hover:bg-slate-200",
            )}
          >
            Открыть магазин
          </Link>
        </section>

        {storefront ? (
          <p className="border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500">
            Это ваш storefront?{" "}
            <Link href={`/dashboard/store?sellerId=${storefront.id}`} className="text-sm font-semibold text-slate-700 underline">
              Управлять магазином
            </Link>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
