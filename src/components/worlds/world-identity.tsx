import Link from "next/link";
import { createElement } from "react";

import { catalogWorldLucideIcons } from "@/config/icons";
import { getWorldLabel, type CatalogWorld } from "@/lib/listings";
import type { WorldId } from "@/lib/worlds.community";
import { getWorldPresentation } from "@/lib/worlds";

type WorldCardProps = {
  worldId: WorldId;
  listingsCount: number;
  usersOnline: number;
  shopsOnline: number;
  chips: string[];
  href: string;
  ctaLabel?: string;
};

export function WorldCard({ worldId, listingsCount, usersOnline, shopsOnline, chips, href, ctaLabel }: WorldCardProps) {
  const world = getWorldPresentation(worldId);
  const Icon = catalogWorldLucideIcons[worldId];

  return (
    <article className={`relative overflow-hidden rounded-2xl border p-4 shadow-sm ${world.homeCardToneClass}`}>
      <div className={`pointer-events-none absolute inset-0 ${world.heroDecorClass}`} />
      <div className="relative space-y-3">
        <div className="flex items-start justify-between gap-2">
          <p className={`inline-flex items-center gap-2 text-sm font-semibold ${world.homeCardAccentClass}`}>
            {createElement(Icon, { className: "h-4 w-4", strokeWidth: 1.5 })}
            {world.title}
          </p>
          <span className="rounded-full border border-white/50 bg-white/80 px-2 py-0.5 text-[11px] text-slate-600">Мир</span>
        </div>
        <p className={`text-sm leading-relaxed ${worldId === "electronics" ? "text-slate-100/90" : "text-slate-600"}`}>{world.subtitle}</p>
        <p className={`text-xs ${worldId === "electronics" ? "text-slate-100" : "text-slate-600"}`}>
          {listingsCount.toLocaleString("ru-RU")} объявлений · {usersOnline} online · {shopsOnline} магазинов
        </p>
        <div className="flex flex-wrap gap-1.5">
          {chips.slice(0, 3).map((chip) => (
            <span
              key={`${worldId}-${chip}`}
              className={`rounded-full border px-2 py-0.5 text-[11px] ${
                worldId === "electronics"
                  ? "border-white/30 bg-white/10 text-slate-100"
                  : "border-white bg-white/80 text-slate-600"
              }`}
            >
              {chip}
            </span>
          ))}
        </div>
        <Link
          href={href}
          className="inline-flex rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          {ctaLabel ?? "Перейти в мир"}
        </Link>
      </div>
    </article>
  );
}

type WorldIdentityStripProps = {
  world: CatalogWorld;
  contextLine?: string;
  chips?: string[];
  usersOnline?: number;
  shopsOnline?: number;
  href?: string;
};

export function WorldIdentityStrip({ world, contextLine, chips = [], usersOnline, shopsOnline, href }: WorldIdentityStripProps) {
  if (world === "all") {
    return null;
  }
  const worldView = getWorldPresentation(world);
  const Icon = catalogWorldLucideIcons[world];
  return (
    <section className={`rounded-2xl border p-3 ${worldView.sectionToneClass}`}>
      <div className="flex flex-wrap items-center gap-2">
        <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
          {createElement(Icon, { className: "h-4 w-4", strokeWidth: 1.5 })}
          {getWorldLabel(world)}
        </p>
        {usersOnline && shopsOnline ? (
          <span className="text-xs text-slate-600">
            {usersOnline} online · {shopsOnline} магазинов в эфире
          </span>
        ) : null}
        {contextLine ? <span className="text-xs text-slate-600">{contextLine}</span> : null}
        {href ? (
          <Link href={href} className="ml-auto text-xs font-semibold text-slate-700 underline-offset-2 hover:underline">
            Открыть хаб мира
          </Link>
        ) : null}
      </div>
      {chips.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {chips.slice(0, 3).map((chip) => (
            <span key={`${world}-${chip}`} className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-600">
              {chip}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}
