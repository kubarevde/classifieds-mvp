import type { Metadata } from "next";

import { type AccountTab } from "@/components/account/account-layout";
import { DashboardTabContent } from "@/components/dashboard/dashboard-tab-content";
import { DashboardStoreCabinetLink } from "@/components/dashboard/dashboard-store-cabinet-link";
import { DemoRoleGuard } from "@/components/demo-role/demo-role";
import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/ui/container";

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Личный кабинет - Classify",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const raw = params?.from;
  const fromValue = Array.isArray(raw) ? raw[0] : raw;
  const fromSponsorBoard = fromValue === "sponsor-board";
  const intentRaw = params?.intent;
  const intentValue = Array.isArray(intentRaw) ? intentRaw[0] : intentRaw;
  const promoteHeroIntent = intentValue === "promote-hero";
  const tabRaw = params?.tab;
  const tabValue = Array.isArray(tabRaw) ? tabRaw[0] : tabRaw;
  const activeTab: AccountTab =
    tabValue === "promotion" ||
    tabValue === "subscription" ||
    tabValue === "favorites" ||
    tabValue === "saved-searches" ||
    tabValue === "messages" ||
    tabValue === "notifications" ||
    tabValue === "support" ||
    tabValue === "profile"
      ? tabValue
      : "listings";

  return (
    <div className="min-h-screen bg-slate-50/60">
      <Navbar />
      <main className="py-6 sm:py-8">
        <Container className="space-y-4">
          <DemoRoleGuard
            allowedRoles={["buyer", "seller", "all"]}
            title="Кабинет доступен после входа"
            description="Для гостя личный кабинет скрыт. Переключитесь на buyer или seller, чтобы увидеть персональные разделы."
            ctaRoles={["buyer", "seller"]}
          >
            <header className="space-y-2">
              <p className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
                Личный кабинет
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Личный кабинет
              </h1>
              <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
                Все ключевые разделы в одном пространстве: объявления, избранное, сообщения, уведомления, поддержка и профиль.
              </p>
              <DashboardStoreCabinetLink />
            </header>

            <DashboardTabContent activeTab={activeTab} fromSponsorBoard={fromSponsorBoard} promoteHeroIntent={promoteHeroIntent} />
          </DemoRoleGuard>
        </Container>
      </main>
    </div>
  );
}
