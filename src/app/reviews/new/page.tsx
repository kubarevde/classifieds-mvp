import Link from "next/link";

import { ReviewsNewPageClient } from "@/components/reviews/reviews-new-page-client";
import { Container } from "@/components/ui/container";

type Props = { searchParams: Promise<{ dealId?: string }> };

export default async function ReviewsNewPage({ searchParams }: Props) {
  const { dealId } = await searchParams;
  return (
    <main className="py-10">
      <Container className="max-w-lg space-y-4">
        <Link href="/dashboard?section=deals" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          ← Мои сделки
        </Link>
        <ReviewsNewPageClient dealId={dealId ?? null} />
      </Container>
    </main>
  );
}
