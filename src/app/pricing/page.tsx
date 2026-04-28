import { Navbar } from "@/components/layout/navbar";
import { PricingPage } from "@/components/pricing/PricingPage";
import { Container } from "@/components/ui/container";

export default function PricingRoutePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f8fafc_0%,#f2f5f9_55%,#f6f7f9_100%)]">
      <Navbar />
      <main className="py-6 sm:py-8">
        <Container>
          <PricingPage />
        </Container>
      </main>
    </div>
  );
}
