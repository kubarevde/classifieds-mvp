import { Navbar } from "@/components/layout/navbar";
import { NotificationsPageClient } from "@/components/notifications/notifications-page-client";
import { Container } from "@/components/ui/container";

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-slate-50/60">
      <Navbar />
      <main className="py-6 sm:py-8">
        <Container>
          <NotificationsPageClient />
        </Container>
      </main>
    </div>
  );
}

