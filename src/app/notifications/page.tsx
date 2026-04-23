import { DemoRoleGuard } from "@/components/demo-role/demo-role";
import { Navbar } from "@/components/layout/navbar";
import { NotificationsPageClient } from "@/components/notifications/notifications-page-client";
import { Container } from "@/components/ui/container";

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-slate-50/60">
      <Navbar />
      <main className="py-6 sm:py-8">
        <Container>
          <DemoRoleGuard
            allowedRoles={["buyer", "seller", "all"]}
            title="Уведомления доступны после входа"
            description="В гостевом режиме отключены персональные уведомления. Переключитесь на buyer или seller."
            ctaRoles={["buyer", "seller"]}
          >
            <NotificationsPageClient />
          </DemoRoleGuard>
        </Container>
      </main>
    </div>
  );
}

