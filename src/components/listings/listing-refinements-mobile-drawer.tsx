"use client";

import type { ReactNode } from "react";

import { cn } from "@/components/ui/cn";
import { buttonVariants } from "@/lib/button-styles";

type ListingRefinementsMobileDrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export function ListingRefinementsMobileDrawer({ open, onClose, title, children }: ListingRefinementsMobileDrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-labelledby="listing-filters-drawer-title">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
        aria-label="Закрыть фильтры"
        onClick={onClose}
      />
      <div className="absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto rounded-t-2xl border border-slate-200/90 bg-white shadow-[0_-8px_32px_rgba(15,23,42,0.12)]">
        <div className="sticky top-0 z-[1] flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3">
          <h2 id="listing-filters-drawer-title" className="text-base font-semibold text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "rounded-xl")}
          >
            Готово
          </button>
        </div>
        <div className="px-3 pb-6 pt-2">{children}</div>
      </div>
    </div>
  );
}
