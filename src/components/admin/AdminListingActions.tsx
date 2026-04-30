"use client";

import { useRouter } from "next/navigation";

import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import { mockListingsService } from "@/services/listings";

export function AdminListingActions({ listingId, sellerUserId }: { listingId: string; sellerUserId: string }) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-4">
      <button
        type="button"
        className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
        onClick={() => {
          console.info("[admin mock] approve", listingId);
        }}
      >
        Одобрить
      </button>
      <button
        type="button"
        className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white"
        onClick={() => {
          console.info("[admin mock] reject", listingId);
        }}
      >
        Отклонить
      </button>
      <button
        type="button"
        className="rounded-lg bg-rose-700 px-3 py-2 text-sm font-semibold text-white"
        onClick={async () => {
          await mockListingsService.delete(listingId);
          router.push("/admin/listings");
          router.refresh();
        }}
      >
        Снять с публикации
      </button>
      <AdminInternalLink href={`/admin/users/${encodeURIComponent(sellerUserId)}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800">
        Профиль продавца
      </AdminInternalLink>
      <AdminInternalLink href="/admin/moderation/reports" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800">
        Жалобы
      </AdminInternalLink>
    </div>
  );
}
