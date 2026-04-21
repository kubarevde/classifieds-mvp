import { Navbar } from "@/components/layout/navbar";
import { ProfilePageClient } from "@/components/profile/profile-page-client";
import { ProfileProvider } from "@/components/profile/profile-provider";
import { Container } from "@/components/ui/container";

export default function ProfilePage() {
  return (
    <ProfileProvider>
      <div className="min-h-screen bg-slate-50/60">
        <Navbar />
        <main className="py-6 sm:py-8">
          <Container className="max-w-3xl space-y-4">
            <header className="space-y-2">
              <p className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
                Аккаунт
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Профиль и настройки
              </h1>
              <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
                Управляйте контактами и уведомлениями. Данные остаются в этом браузере до подключения
                API.
              </p>
            </header>

            <ProfilePageClient />
          </Container>
        </main>
      </div>
    </ProfileProvider>
  );
}
