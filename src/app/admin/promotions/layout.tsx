"use client";

import { usePathname } from "next/navigation";

import { AdminInternalLink } from "@/components/admin/AdminInternalLink";
import { useAdminConsole } from "@/components/admin/admin-console-context";
import { personaCanAccessRoute } from "@/lib/admin-access";

const TABS: { href: string; label: string; accessId: string }[] = [
  { href: "/admin/promotions", label: "Обзор", accessId: "promotions" },
  { href: "/admin/promotions/listings", label: "Объявления и бусты", accessId: "promotions-listings" },
  { href: "/admin/promotions/slots", label: "Слоты", accessId: "promotions-slots" },
  { href: "/admin/promotions/campaigns", label: "Кампании", accessId: "promotions-campaigns" },
  { href: "/admin/promotions/pricing", label: "Цены и правила", accessId: "promotions-pricing" },
];

export default function AdminPromotionsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const { persona } = useAdminConsole();
  const visible = TABS.filter((t) => personaCanAccessRoute(persona, t.accessId));
  const norm = pathname.replace(/\/$/, "") || "/admin/promotions";

  return (
    <div className="space-y-4">
      <nav className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-3" aria-label="Раздел продвижения">
        {visible.map((t) => {
          const isOverview = t.href === "/admin/promotions";
          const overviewActive = isOverview && norm === "/admin/promotions";
          const subActive = !isOverview && (norm === t.href || norm.startsWith(`${t.href}/`));
          const on = isOverview ? overviewActive : subActive;
          return (
            <AdminInternalLink
              key={t.href}
              href={t.href}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                on ? "bg-slate-900 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </AdminInternalLink>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
