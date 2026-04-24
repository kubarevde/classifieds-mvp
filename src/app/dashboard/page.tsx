import { DashboardPageClient } from "@/components/dashboard/dashboard-page-client";
import Link from "next/link";
import { DemoRoleGuard } from "@/components/demo-role/demo-role";
import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/ui/container";

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const raw = params?.from;
  const fromValue = Array.isArray(raw) ? raw[0] : raw;
  const fromSponsorBoard = fromValue === "sponsor-board";
  const intentRaw = params?.intent;
  const intentValue = Array.isArray(intentRaw) ? intentRaw[0] : intentRaw;
  const promoteHeroIntent = intentValue === "promote-hero";

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
                Кабинет пользователя
              </h1>
              <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
                Здесь вы можете видеть свои объявления, менять их статус и управлять публикациями.
              </p>
              <Link
                href="/dashboard/store?sellerId=marina-tech"
                className="inline-flex rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Перейти в кабинет магазина
              </Link>
            </header>

            <DashboardPageClient fromSponsorBoard={fromSponsorBoard} promoteHeroIntent={promoteHeroIntent} />
          </DemoRoleGuard>
        </Container>
      </main>
    </div>
  );
}
