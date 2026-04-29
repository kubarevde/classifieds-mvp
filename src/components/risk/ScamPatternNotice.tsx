"use client";

import Link from "next/link";

import type { RiskSignal } from "@/services/risk";

export function ScamPatternNotice({ signals }: { signals: RiskSignal[] }) {
  if (!signals.length) return null;
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2">
      <p className="text-xs font-semibold text-amber-950">
        Если вас просят оплатить вне платформы или перейти в сторонний мессенджер, будьте внимательны.
      </p>
      <div className="mt-2 flex flex-wrap gap-3 text-xs">
        <Link href="/safety/reports/new" className="font-semibold text-amber-900 underline underline-offset-2">
          Сообщить о нарушении
        </Link>
        <Link href="/safety" className="font-semibold text-amber-900 underline underline-offset-2">
          О правилах безопасности
        </Link>
      </div>
    </div>
  );
}

