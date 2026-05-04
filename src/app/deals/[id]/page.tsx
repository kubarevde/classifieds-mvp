import { notFound } from "next/navigation";

import { Container } from "@/components/ui/container";
import { DealPageClient } from "@/components/deals/deal-page-client";
import { dealsService } from "@/services/deals";

type Props = { params: Promise<{ id: string }> };

export default async function DealDetailPage({ params }: Props) {
  const { id } = await params;
  const deal = dealsService.getDealById(id);
  if (!deal) {
    notFound();
  }
  return (
    <Container>
      <DealPageClient initialDeal={deal} />
    </Container>
  );
}
