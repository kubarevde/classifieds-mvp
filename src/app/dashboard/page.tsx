import { DashboardPageClient } from "@/components/dashboard/dashboard-page-client";
import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/ui/container";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50/60">
      <Navbar />
      <main className="py-6 sm:py-8">
        <Container className="space-y-4">
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
          </header>

          <DashboardPageClient />
        </Container>
      </main>
    </div>
  );
}
