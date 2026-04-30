"use client";

import { usePathname } from "next/navigation";
import { clsx } from "clsx";

import { AdminInternalLink } from "./AdminInternalLink";

const links = [
  { href: "/admin/moderation", label: "Обзор" },
  { href: "/admin/moderation/reports", label: "Жалобы" },
  { href: "/admin/moderation/verification", label: "Верификация" },
  { href: "/admin/moderation/appeals", label: "Апелляции" },
  { href: "/admin/moderation/enforcement", label: "Enforcement" },
] as const;

export function ModerationSubNav() {
  const pathname = usePathname() ?? "";

  return (
    <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-2">
      {links.map((l) => {
        const active =
          l.href === "/admin/moderation"
            ? pathname === "/admin/moderation"
            : pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <AdminInternalLink
            key={l.href}
            href={l.href}
            className={clsx(
              "inline-flex h-8 items-center rounded-lg px-3 text-xs font-semibold",
              active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100",
            )}
          >
            {l.label}
          </AdminInternalLink>
        );
      })}
    </div>
  );
}
