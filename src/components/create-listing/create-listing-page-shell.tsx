"use client";

import { CreateListingForm } from "@/components/create-listing/create-listing-form";
import { DemoRoleGuard } from "@/components/demo-role/demo-role";
import { PageShell } from "@/components/platform";
import type { CatalogWorld } from "@/lib/listings";

type CreateListingPageShellProps = {
  initialWorld: CatalogWorld;
  initialIsAuthenticated: boolean;
};

export function CreateListingPageShell({ initialWorld, initialIsAuthenticated }: CreateListingPageShellProps) {
  return (
    <main className="py-6 sm:py-8">
      <PageShell
        title="Новое объявление"
        subtitle="Пройдите шаги мастера и опубликуйте карточку в каталоге."
        maxWidthClassName="max-w-7xl"
        breadcrumbs={[
          { label: "Домой", href: "/" },
          { label: "Мои объявления", href: "/dashboard" },
          { label: "Новое объявление" },
        ]}
      >
        <DemoRoleGuard
          allowedRoles={["buyer", "seller", "all"]}
          title="Размещение объявлений недоступно в режиме гостя"
          description="Чтобы подать объявление в демо, переключите роль на «Покупатель» или «Продавец / Магазин»."
          ctaRoles={["buyer", "seller"]}
        >
          <CreateListingForm initialWorld={initialWorld} initialIsAuthenticated={initialIsAuthenticated} />
        </DemoRoleGuard>
      </PageShell>
    </main>
  );
}
