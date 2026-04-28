"use client";

import Link from "next/link";

import type { Plan } from "@/entities/billing/model";
import { Card } from "@/components/ui/card";

type UpgradeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  featureLabel?: string;
  currentPlan?: Plan;
  requiredPlan?: Plan;
  reason?: "plan_restriction" | "limit_reached";
  currentUsage?: number;
  limit?: number;
};

function planLabel(plan?: Plan) {
  if (plan === "free") return "Free";
  if (plan === "starter") return "Старт";
  if (plan === "pro") return "Про";
  if (plan === "business") return "Бизнес";
  return "Текущий";
}

export function UpgradeModal({
  isOpen,
  onClose,
  featureLabel,
  currentPlan,
  requiredPlan,
  reason,
  currentUsage,
  limit,
}: UpgradeModalProps) {
  if (!isOpen) {
    return null;
  }

  const title =
    reason === "limit_reached" && typeof limit === "number"
      ? `Достигнут лимит${featureLabel ? `: ${featureLabel}` : ""}`
      : `Нужен тариф ${planLabel(requiredPlan)}`;

  const body =
    reason === "limit_reached" && typeof currentUsage === "number" && typeof limit === "number"
      ? `Вы использовали ${currentUsage} из ${limit}. Перейдите на тариф выше, чтобы продолжить без блокировки.`
      : "Эта возможность доступна на более высоком тарифе. Обновление откроет нужные инструменты без ограничений.";

  const pricingHref = `/pricing?feature=${encodeURIComponent(featureLabel ?? "upgrade")}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 p-4">
      <div className="mx-auto mt-20 w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-600">{body}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600"
          >
            ×
          </button>
        </div>
        <Card className="mt-4 border-slate-200 p-3 text-sm">
          <p className="font-medium text-slate-900">Сравнение</p>
          <p className="mt-1 text-slate-700">
            Текущий: <span className="font-semibold">{planLabel(currentPlan)}</span> {"->"} Нужный:{" "}
            <span className="font-semibold">{planLabel(requiredPlan)}</span>
          </p>
        </Card>
        <div className="mt-4 flex gap-2">
          <Link
            href={pricingHref}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white"
          >
            Перейти на тариф
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700"
          >
            Позже
          </button>
        </div>
      </div>
    </div>
  );
}
