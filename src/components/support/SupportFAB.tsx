"use client";

import { HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { SupportQuickDrawer } from "@/components/support/SupportQuickDrawer";
import { useSupportFabUi } from "@/hooks/use-support-fab";
import { getPopularHelpArticles } from "@/services/support";
import { cn } from "@/components/ui/cn";

const quickArticles = getPopularHelpArticles();

export function SupportFAB() {
  const { visible, positionClassName } = useSupportFabUi();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!visible) {
    return null;
  }

  return (
    <>
      {!open ? (
        <button
          type="button"
          aria-expanded={false}
          aria-controls="support-quick-drawer"
          onClick={() => setOpen(true)}
          className={cn(
            "pointer-events-auto fixed z-40 grid h-12 w-12 place-items-center rounded-full border border-slate-200/60 bg-white/80 text-slate-600 shadow-md backdrop-blur-md transition-[opacity,transform,box-shadow] duration-200 ease-out hover:scale-[1.03] hover:opacity-100 hover:shadow-lg focus-visible:scale-[1.03] focus-visible:opacity-100 opacity-[0.88]",
            positionClassName,
          )}
          title="Помощь и поддержка"
        >
          <HelpCircle className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          <span className="sr-only">Открыть помощь</span>
        </button>
      ) : null}

      <SupportQuickDrawer open={open} onClose={() => setOpen(false)} quickArticles={quickArticles} />
    </>
  );
}
