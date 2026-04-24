"use client";

import { CreateListingForm } from "@/components/create-listing/create-listing-form";
import { DemoRoleGuard } from "@/components/demo-role/demo-role";
import { Container } from "@/components/ui/container";
import type { CatalogWorld } from "@/lib/listings";

type CreateListingPageShellProps = {
  initialWorld: CatalogWorld;
  initialIsAuthenticated: boolean;
};

export function CreateListingPageShell({ initialWorld, initialIsAuthenticated }: CreateListingPageShellProps) {
  return (
    <main className="py-6 sm:py-8">
      <Container className="space-y-4">
        <header className="space-y-2">
          <p className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
            Публикация объявления
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Подать объявление</h1>
          <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
            Заполните форму, выберите тематический мир и опубликуйте объявление за пару минут.
          </p>
        </header>

        <DemoRoleGuard
          allowedRoles={["buyer", "seller", "all"]}
          title="Размещение объявлений недоступно в режиме гостя"
          description="Чтобы подать объявление в демо, переключите роль на «Покупатель» или «Продавец / Магазин»."
          ctaRoles={["buyer", "seller"]}
        >
          <CreateListingForm initialWorld={initialWorld} initialIsAuthenticated={initialIsAuthenticated} />
        </DemoRoleGuard>
      </Container>
    </main>
  );
}
