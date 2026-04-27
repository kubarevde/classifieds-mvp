"use client";

import { useState } from "react";

import { useSubscription } from "@/components/subscription/subscription-provider";
import { Badge, Button, Card } from "@/components/ui";

function formatDateLabel(iso: string | null) {
  if (!iso) {
    return "—";
  }
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function BuyerSubscriptionTab() {
  const { isPro, planName, expiryDate, activatePro, deactivatePro } = useSubscription();
  const [showRenewHint, setShowRenewHint] = useState(false);

  const enabled = planName === "business" || isPro;

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Подписка</h2>
            <p className="text-sm text-slate-600">
              Выберите режим доступа к AI-помощнику и дополнительным smart-возможностям.
            </p>
          </div>
          <Badge variant={enabled ? "default" : "secondary"}>
            {enabled ? "Pro активно" : "Демо-режим"}
          </Badge>
        </div>
      </Card>

      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-slate-600">Демо</span>
          <button
            type="button"
            onClick={() => (enabled ? deactivatePro() : activatePro())}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
              enabled ? "bg-slate-900" : "bg-slate-300"
            }`}
            aria-label="Переключить подписку"
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition ${
                enabled ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-sm font-medium text-slate-900">Pro</span>
        </div>
        <p className="mt-3 text-sm text-slate-600">
          Текущий план:{" "}
          <span className="font-semibold text-slate-900">
            {planName === "business" ? "Бизнес" : enabled ? "Pro" : "Демо"}
          </span>
          . Действует до: <span className="font-semibold text-slate-900">{formatDateLabel(expiryDate)}</span>
        </p>
      </Card>

      <Card className="p-4 sm:p-5">
        <h3 className="text-base font-semibold text-slate-900">Преимущества Pro</h3>
        <ul className="mt-2 space-y-1 text-sm text-slate-600">
          <li>Полный доступ к AI-помощнику в форме объявления.</li>
          <li>Создание аукционов для частных пользователей (Pro и выше).</li>
          <li>Интеллектуальные рекомендации по заполнению карточки.</li>
          <li>Умные подсказки по улучшению качества объявления.</li>
          <li>Приоритетная поддержка и будущие premium-функции.</li>
        </ul>
        {enabled ? (
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowRenewHint(true);
                setTimeout(() => setShowRenewHint(false), 2500);
              }}
            >
              Продлить
            </Button>
            {showRenewHint ? (
              <p className="mt-2 text-sm text-slate-600">Функция будет доступна позже.</p>
            ) : null}
          </div>
        ) : null}
      </Card>
    </div>
  );
}
