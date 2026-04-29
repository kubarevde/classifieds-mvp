"use client";

import Link from "next/link";

export function SafetyHintCard({
  title,
  description,
  href,
  ctaLabel,
}: {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
      <Link href={href} className="mt-2 inline-flex min-h-10 items-center text-sm font-semibold text-slate-800 underline underline-offset-2">
        {ctaLabel}
      </Link>
    </div>
  );
}

