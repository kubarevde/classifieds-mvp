import { DemoRoleGuard } from "@/components/demo-role/demo-role";
import { Navbar } from "@/components/layout/navbar";
import { SavedSearchesPageClient } from "@/components/saved-searches/saved-searches-page-client";
import { Container } from "@/components/ui/container";

export default function SavedSearchesPage() {
  return (
    <div className="min-h-screen bg-slate-50/60">
      <Navbar />
      <main className="py-6 sm:py-8">
        <Container>
          <DemoRoleGuard
            allowedRoles={["buyer", "seller", "all"]}
            title="Сохранённые поиски доступны после входа"
            description="Гостевой режим скрывает персональные подборки. Переключитесь на buyer или seller, чтобы продолжить."
            ctaRoles={["buyer", "seller"]}
          >
            <SavedSearchesPageClient />
          </DemoRoleGuard>
        </Container>
      </main>
    </div>
  );
}
