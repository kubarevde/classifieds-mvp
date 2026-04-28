"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { UnifiedSearchShell } from "@/components/search/unified-search-shell";
import { useToast } from "@/components/ui/toast";
import { getWorldLabel } from "@/lib/listings";
import { buildListingsHrefFromIntent } from "@/lib/saved-searches";
import { searchListingsSmart, type WorldId } from "@/lib/worlds.community";
import { mockSearchIntentService } from "@/services/search-intent";

type WorldSearchProps = {
  worldId: WorldId;
  location: "all" | string;
  category: "all" | string;
};

export function WorldSearch({ worldId, location, category }: WorldSearchProps) {
  const [text, setText] = useState("");
  const router = useRouter();
  const { showToast } = useToast();
  const baseHref = searchListingsSmart({
    worldId,
    text,
    city: location === "all" ? undefined : location,
    categoryId: category === "all" ? undefined : category,
  });

  return (
    <UnifiedSearchShell
      target="listing"
      onTargetChange={() => {}}
      showVerticalTabs={false}
      query={text}
      onQueryChange={setText}
      onQuerySubmit={() => router.push(baseHref)}
      onPhotoSearch={() => {
        void mockSearchIntentService
          .fromImageSearch({
            imageUrl: "https://example.com/world-photo.jpg",
            inferredCategory: category === "all" ? "all" : category,
            traits: ["поиск в мире", getWorldLabel(worldId)],
            normalizedQuery: text || "по фото",
          })
          .then((intent) => {
            router.push(buildListingsHrefFromIntent(intent));
            showToast("Фото-поиск применён к каталогу товаров", "success");
          });
      }}
      placeholder='Например: "Красивый красный диван"'
      tone="minimal"
      extraControls={
        <p className="max-w-xs text-right text-[11px] leading-snug text-slate-500">
          Подсказка: можно писать по-человечески.
        </p>
      }
    />
  );
}
