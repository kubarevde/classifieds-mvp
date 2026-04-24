import { Navbar } from "@/components/layout/navbar";
import { SponsorBoardPageClient } from "@/components/sponsor-board/sponsor-board-page-client";
import {
  getActiveHeroBoardTopContributors,
  getAllActiveHeroBannerPlacements,
  heroBoardCharityStats,
} from "@/lib/hero-board";

export default function SponsorBoardPage() {
  const placements = getAllActiveHeroBannerPlacements();
  const topContributors = getActiveHeroBoardTopContributors(5);

  return (
    <div className="min-h-screen bg-slate-50/70">
      <Navbar />
      <SponsorBoardPageClient
        placements={placements}
        topContributors={topContributors}
        charityStats={heroBoardCharityStats}
      />
    </div>
  );
}
