import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/ui/container";

export default function StoresLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="py-6 sm:py-8">
        <Container className="space-y-4">
          <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-56 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        </Container>
      </main>
    </div>
  );
}

