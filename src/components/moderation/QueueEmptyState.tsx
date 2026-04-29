"use client";

import Link from "next/link";

export function QueueEmptyState({
  title,
  description,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
      <p className="text-base font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
      {ctaHref && ctaLabel ? (
        <Link href={ctaHref} className="mt-3 inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700">
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}

