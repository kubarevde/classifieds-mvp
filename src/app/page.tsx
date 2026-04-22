import { CategoriesGrid } from "@/components/home/categories-grid";
import { CtaBlock } from "@/components/home/cta-block";
import { Features } from "@/components/home/features";
import { HeroBoardSpotlight } from "@/components/home/hero-board-spotlight";
import { HeroSearch } from "@/components/home/hero-search";
import { PlatformInside } from "@/components/home/platform-inside";
import { PopularListings } from "@/components/home/popular-listings";
import { StoresShowcase } from "@/components/home/stores-showcase";
import { WorldsEntry } from "@/components/home/worlds-entry";
import { Navbar } from "@/components/layout/navbar";
import { getActiveHeroBanner } from "@/lib/hero-board";

export default function Home() {
  const currentHeroBoard = getActiveHeroBanner();

  return (
    <div className="min-h-screen bg-slate-50/60">
      <Navbar />
      <main className="space-y-2 pb-8 sm:space-y-3">
        <HeroSearch />
        <WorldsEntry />
        <HeroBoardSpotlight placement={currentHeroBoard} />
        <PlatformInside />
        <StoresShowcase />
        <CategoriesGrid />
        <PopularListings />
        <Features />
        <CtaBlock />
      </main>
    </div>
  );
}
