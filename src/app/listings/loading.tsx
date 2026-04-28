import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/ui/container";

export default function ListingsLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="py-6 sm:py-8">
        <Container className="space-y-4">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-20 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-14 animate-pulse rounded-xl bg-slate-200" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, idx) => (
              <div key={idx} className="h-72 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        </Container>
      </main>
    </div>
  );
}

