import Link from "next/link";

import { DemoRoleGuard } from "@/components/demo-role/demo-role";
import { FavoritesPageClient } from "@/components/favorites/favorites-page-client";
import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/ui/container";

export default function FavoritesPage() {
  return (
    <div className="min-h-screen bg-slate-50/60">
      <Navbar />
      <main className="py-6 sm:py-8">
        <Container className="space-y-4">
          <DemoRoleGuard
            allowedRoles={["buyer", "seller", "all"]}
            title="Избранное доступно после входа"
            description="В демо-режиме гостя список избранного скрыт. Переключитесь на buyer или seller, чтобы открыть персональные разделы."
            ctaRoles={["buyer", "seller"]}
          >
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                  Избранные объявления
                </h1>
                <p className="text-sm text-slate-600 sm:text-base">
                  Сохраняйте интересные карточки и возвращайтесь к ним в любой момент.
                </p>
              </div>
              <Link
                href="/listings"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Каталог
              </Link>
            </header>

            <FavoritesPageClient />
          </DemoRoleGuard>
        </Container>
      </main>
    </div>
  );
}
