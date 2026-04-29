"use client";

import { getTransactionSafetyChecklist } from "@/services/risk";

export function TransactionSafetyChecklist({ variant = "full" }: { variant?: "compact" | "full" }) {
  const items = getTransactionSafetyChecklist();
  return (
    <section className={variant === "compact" ? "rounded-xl border border-slate-200 bg-white p-3" : "rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"}>
      <h3 className={variant === "compact" ? "text-sm font-semibold text-slate-900" : "text-base font-semibold text-slate-900"}>
        Памятка по безопасности сделки
      </h3>
      <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
        {items.map((item) => (
          <li key={item.id} className="flex gap-2">
            <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-slate-400" aria-hidden />
            {item.text}
          </li>
        ))}
      </ul>
    </section>
  );
}

