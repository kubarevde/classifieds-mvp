import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/ui/container";

export default function ListingDetailsLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="py-6 sm:py-8">
        <Container className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="h-[520px] animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-[420px] animate-pulse rounded-2xl bg-slate-200" />
          </div>
        </Container>
      </main>
    </div>
  );
}

