"use client";

import Link from "next/link";
import { Sprout } from "lucide-react";

type AgricultureEntryButtonProps = {
  className?: string;
  compact?: boolean;
  onClick?: () => void;
};

export function AgricultureEntryButton({
  className,
  compact = false,
  onClick,
}: AgricultureEntryButtonProps) {
  return (
    <Link
      href="/agriculture"
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-xl border border-emerald-300/70 bg-gradient-to-r from-emerald-700 via-emerald-600 to-lime-600 px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:brightness-105 ${
        compact ? "h-9 text-xs sm:text-sm" : "h-10"
      } ${className ?? ""}`}
    >
      <Sprout className="mr-1.5 h-4 w-4" strokeWidth={1.5} />
      Сельское хозяйство
    </Link>
  );
}
