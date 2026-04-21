import { Navbar } from "@/components/layout/navbar";
import { SavedSearchesPageClient } from "@/components/saved-searches/saved-searches-page-client";
import { Container } from "@/components/ui/container";

export default function SavedSearchesPage() {
  return (
    <div className="min-h-screen bg-slate-50/60">
      <Navbar />
      <main className="py-6 sm:py-8">
        <Container>
          <SavedSearchesPageClient />
        </Container>
      </main>
    </div>
  );
}
