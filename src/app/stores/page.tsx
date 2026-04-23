import { Navbar } from "@/components/layout/navbar";
import { StoresPageClient } from "@/components/stores/stores-page-client";
import { Container } from "@/components/ui/container";

export default function StoresPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f8fafc_0%,#f2f5f9_55%,#f6f7f9_100%)]">
      <Navbar />
      <main className="py-6 sm:py-8">
        <Container>
          <StoresPageClient />
        </Container>
      </main>
    </div>
  );
}
