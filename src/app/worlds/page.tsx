import type { Metadata } from "next";

import { Navbar } from "@/components/layout/navbar";
import { PageShell } from "@/components/platform";
import { WorldCard } from "@/components/worlds/world-identity";
import { getWorldAudienceChips, getWorldOnlineStats, type WorldId } from "@/lib/worlds.community";
import { worldPresentationById } from "@/lib/worlds";
import { mockListingsService } from "@/services/listings";

export const metadata: Metadata = {
  title: "Миры - Classify",
  description: "Выберите мир по своим интересам — электроника, авто, дом, детские товары и другие",
  openGraph: {
    title: "Миры - Classify",
    description: "Мини-комьюнити вокруг интересов: техника, авто, дом и хобби.",
  },
};

const worldIds = (Object.keys(worldPresentationById) as Array<keyof typeof worldPresentationById>).filter(
  (item): item is WorldId => item !== "all",
);

export default async function WorldsPage() {
  const catalogListings = await mockListingsService.getAll();
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f8fafc_0%,#eef2f7_55%,#f5f7fa_100%)]">
      <Navbar />
      <main className="py-5 sm:py-7">
        <PageShell
          title="Миры Classify"
          subtitle="Мини-комьюнити вокруг интересов: техника, авто, дом, хобби"
          breadcrumbs={[{ label: "Миры" }]}
          className="pb-5"
        >
          <p className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600">
            Выберите мир, где вы будете продавать и покупать.
          </p>
        </PageShell>

        <PageShell as="div" containerOnly>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {worldIds.map((worldId) => {
              const listingsCount = catalogListings.filter((listing) => listing.world === worldId).length;
              const online = getWorldOnlineStats(worldId);
              const chips = getWorldAudienceChips(worldId);
              return (
                <WorldCard
                  key={worldId}
                  worldId={worldId}
                  listingsCount={listingsCount}
                  usersOnline={online.usersOnline}
                  shopsOnline={online.shopsOnline}
                  chips={chips}
                  href={`/worlds/${worldId}`}
                />
              );
            })}
          </section>
        </PageShell>
      </main>
    </div>
  );
}
