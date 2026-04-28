import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/ui/container";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="py-6 sm:py-8">
        <Container className="space-y-4">
          <div className="h-10 w-72 animate-pulse rounded-lg bg-slate-200" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-28 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
          <div className="h-80 animate-pulse rounded-2xl bg-slate-200" />
        </Container>
      </main>
    </div>
  );
}

