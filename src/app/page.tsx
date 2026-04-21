import { CategoriesGrid } from "@/components/home/categories-grid";
import { CtaBlock } from "@/components/home/cta-block";
import { Features } from "@/components/home/features";
import { HeroSearch } from "@/components/home/hero-search";
import { PopularListings } from "@/components/home/popular-listings";
import { Navbar } from "@/components/layout/navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50/60">
      <Navbar />
      <main className="space-y-2 pb-8 sm:space-y-3">
        <HeroSearch />
        <CategoriesGrid />
        <PopularListings />
        <Features />
        <CtaBlock />
      </main>
    </div>
  );
}
