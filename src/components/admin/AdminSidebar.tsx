"use client";

import { usePathname } from "next/navigation";
import {
  BarChart3,
  CreditCard,
  FileText,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  Search,
  Settings,
  Shield,
  Store,
  Users,
} from "lucide-react";
import { clsx } from "clsx";

import { filterNavForPersona, type AdminNavIcon } from "@/config/admin-routes";
import { pickDeepestNavHrefMatch } from "@/lib/admin-internal-query";

import { AdminInternalLink } from "./AdminInternalLink";
import { useAdminConsole } from "./admin-console-context";

const iconMap: Record<AdminNavIcon, typeof LayoutDashboard> = {
  layoutDashboard: LayoutDashboard,
  users: Users,
  fileText: FileText,
  store: Store,
  inbox: Inbox,
  lifeBuoy: LifeBuoy,
  shield: Shield,
  creditCard: CreditCard,
  barChart3: BarChart3,
  settings: Settings,
  megaphone: Megaphone,
};

export function AdminSidebar() {
  const pathname = usePathname() ?? "/admin";
  const { persona, setCommandPaletteOpen } = useAdminConsole();
  const tree = filterNavForPersona(persona);

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-slate-900 text-slate-100 md:flex">
      <div className="border-b border-slate-700/80 px-4 py-4">
        <AdminInternalLink href="/admin" className="block text-sm font-semibold tracking-tight text-white">
          Classify · Admin
        </AdminInternalLink>
        <p className="mt-1 text-xs text-slate-400">Операционная консоль</p>
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="mt-3 flex w-full items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/80 px-3 py-2 text-left text-xs font-semibold text-slate-100 hover:bg-slate-800"
        >
          <Search className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
          Поиск по консоли
          <span className="ml-auto rounded border border-slate-500 px-1 font-mono text-[10px] text-slate-300">Ctrl+K</span>
        </button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3 text-sm">
        {tree.map((node) => {
          const Icon = iconMap[node.icon];
          const active = pathname === node.href || pathname.startsWith(`${node.href}/`);
          if (node.children?.length) {
            const deepest = pickDeepestNavHrefMatch(
              pathname,
              node.children.map((c) => c.href),
            );
            return (
              <div key={node.id} className="space-y-0.5">
                <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <Icon className="h-4 w-4 text-slate-300" strokeWidth={1.5} />
                  {node.label}
                </div>
                <div className="ml-1 space-y-0.5 border-l border-slate-700 pl-2">
                  {node.children.map((ch) => {
                    const SubIcon = iconMap[ch.icon];
                    const subActive = deepest === ch.href;
                    return (
                      <AdminInternalLink
                        key={ch.id}
                        href={ch.href}
                        className={clsx(
                          "flex items-center gap-2 rounded-lg px-2 py-1.5 font-medium",
                          subActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800/60 hover:text-white",
                        )}
                      >
                        <SubIcon className="h-3.5 w-3.5 shrink-0 opacity-80" strokeWidth={1.5} />
                        <span className="truncate">{ch.label}</span>
                      </AdminInternalLink>
                    );
                  })}
                </div>
              </div>
            );
          }
          return (
            <AdminInternalLink
              key={node.id}
              href={node.href}
              className={clsx(
                "flex items-center gap-2 rounded-lg px-2 py-2 font-medium",
                active ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800/60 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              <span className="truncate">{node.label}</span>
            </AdminInternalLink>
          );
        })}
      </nav>
      <div className="border-t border-slate-700/80 p-3 text-xs text-slate-500">
        <p>Mock ACL · без реальной IAM</p>
      </div>
    </aside>
  );
}
