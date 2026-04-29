"use client";

import Link from "next/link";
import { X } from "lucide-react";

import { HelpSearchBar } from "@/components/support/HelpSearchBar";
import type { HelpArticle } from "@/services/support";
import { buttonVariants } from "@/lib/button-styles";
import { cn } from "@/components/ui/cn";

type SupportQuickDrawerProps = {
  open: boolean;
  onClose: () => void;
  quickArticles: HelpArticle[];
};

export function SupportQuickDrawer({ open, onClose, quickArticles }: SupportQuickDrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[36] bg-slate-900/40"
        aria-label="Закрыть панель поддержки"
        onClick={onClose}
      />
      <div
        id="support-quick-drawer"
        className="fixed bottom-0 left-0 right-0 z-[37] max-h-[min(85vh,520px)] overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:left-auto sm:right-[max(1rem,env(safe-area-inset-right,0px))] sm:w-[min(100vw-2rem,400px)] sm:rounded-2xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">Помощь</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="Закрыть"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
        <div className="max-h-[min(60vh,420px)] space-y-4 overflow-y-auto p-4">
          <HelpSearchBar inputId="support-drawer-search" onNavigate={onClose} />
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Быстрые статьи</p>
            <ul className="space-y-1">
              {quickArticles.map((article) => (
                <li key={article.id}>
                  <Link
                    href={`/support/${article.categorySlug}/${article.slug}`}
                    onClick={onClose}
                    className="block rounded-lg px-2 py-1.5 text-sm text-slate-800 hover:bg-slate-50"
                  >
                    {article.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Link
            href="/support/tickets/new"
            onClick={onClose}
            className={cn(buttonVariants(), "flex h-10 w-full items-center justify-center")}
          >
            Написать в поддержку
          </Link>
          <Link
            href="/support"
            onClick={onClose}
            className={cn(buttonVariants({ variant: "outline" }), "flex h-10 w-full items-center justify-center")}
          >
            Центр помощи
          </Link>
        </div>
      </div>
    </>
  );
}
