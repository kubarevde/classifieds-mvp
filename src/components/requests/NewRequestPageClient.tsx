"use client";

import { useRouter } from "next/navigation";

import { RequestCreateForm } from "@/components/requests/RequestCreateForm";
import type { BuyerRequestDraft } from "@/services/requests/intent-adapter";
import { mockBuyerRequestsService } from "@/services/requests";

type NewRequestPageClientProps = {
  prefillDraft?: Partial<BuyerRequestDraft>;
};

export function NewRequestPageClient({ prefillDraft }: NewRequestPageClientProps) {
  const router = useRouter();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
  );
}

