import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/ui/container";

export default function StoreDetailsLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="py-6 sm:py-8">
        <Container className="space-y-4">
          <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="h-64 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        </Container>
      </main>
    </div>
  );
}

