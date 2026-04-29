"use client";

import { ShieldCheck } from "lucide-react";

type VerificationPromptProps = {
  title: string;
  description: string;
  bullets?: string[];
};

export function VerificationPrompt({ title, description, bullets = [] }: VerificationPromptProps) {
  return (
    <div className="rounded-2xl border border-amber-200/70 bg-amber-50/60 p-4">
      <div className="flex items-start gap-2">
        <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white">
          <ShieldCheck className="h-5 w-5 text-amber-800" strokeWidth={1.6} aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-sm text-slate-700">{description}</p>
          {bullets.length ? (
            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              {bullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <span className="mt-0.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-600" aria-hidden />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}

