"use client";

import { useRouter } from "next/navigation";

import { RequestCreateForm } from "@/components/requests/RequestCreateForm";
import type { BuyerRequestDraft } from "@/services/requests/intent-adapter";
import { mockBuyerRequestsService } from "@/services/requests";

type NewRequestPageClientProps = {
  prefillDraft?: Partial<BuyerRequestDraft>;
  showSearchPrefillBanner?: boolean;
};

export function NewRequestPageClient({ prefillDraft, showSearchPrefillBanner = false }: NewRequestPageClientProps) {
  const router = useRouter();

  return (
    <div className="space-y-3">
      {showSearchPrefillBanner ? (
        <div className="rounded-xl border border-sky-200 bg-sky-50/90 px-4 py-3 text-sm text-sky-900">
          <p className="font-semibold">Черновик из поиска</p>
          <p className="mt-1 text-sky-800/90">
            Подставили запрос, мир, категорию, город и бюджет (если были в параметрах). Проверьте текст и опубликуйте —
            карточка появится на доске запросов.
          </p>
        </div>
      ) : null}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-none sm:p-5">
        <RequestCreateForm
          initialDraft={prefillDraft}
          onSubmit={async (input) => {
            const created = await mockBuyerRequestsService.createBuyerRequest({
              authorId: "buyer-dmitriy",
              authorName: "Дмитрий П.",
              worldId: input.worldId,
              categoryId: input.categoryId,
              title: input.title,
              description: input.description,
              budget: { min: input.budgetMin, max: input.budgetMax, currency: "RUB" },
              location: input.location,
              urgency: input.urgency,
              condition: input.condition,
              tags: input.tags,
            });
            router.push(`/requests/${created.id}`);
          }}
        />
      </section>
    </div>
  );
}
