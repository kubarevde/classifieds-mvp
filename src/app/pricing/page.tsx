import { Navbar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { PricingPage } from "@/components/pricing/PricingPage";
import { Container } from "@/components/ui/container";

export default function PricingRoutePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#f8fafc_0%,#f2f5f9_55%,#f6f7f9_100%)]">
      <Navbar />
      <main className="flex-1 py-6 sm:py-8">
        <Container>
          <PricingPage />
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
