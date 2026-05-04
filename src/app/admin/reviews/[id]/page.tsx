import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPageSection } from "@/components/admin/AdminPageSection";
import { buildAdminBreadcrumbs } from "@/config/admin-routes";
import { reviewsService } from "@/services/reviews";

import { AdminReviewDetailClient } from "./AdminReviewDetailClient";

type Props = { params: Promise<{ id: string }> };

export default async function AdminReviewDetailPage({ params }: Props) {
  const { id } = await params;
  const review = reviewsService.getReviewById(id);
  if (!review) {
    notFound();
  }
  return (
    <div className="space-y-6">
      <AdminPageHeader breadcrumbs={buildAdminBreadcrumbs(`/admin/reviews/${id}`)} title={`Отзыв ${id}`} subtitle="Модерация контента отзыва" />
      <AdminPageSection title="Карточка">
        <AdminReviewDetailClient review={review} />
      </AdminPageSection>
    </div>
  );
}
