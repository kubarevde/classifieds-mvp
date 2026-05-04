"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { formatUsualReplyMinutes } from "@/lib/messages-derived";
import type { TrustScore } from "@/entities/trust/model";
import { mockTrustService } from "@/services/trust";
import { getVerificationProfile } from "@/services/verification";

export function MessagingTrustStrip({ storeId }: { storeId: string | null }) {
  const [trust, setTrust] = useState<TrustScore | null>(null);

  useEffect(() => {
    if (!storeId) {
      let cancelled = false;
      queueMicrotask(() => {
        if (!cancelled) setTrust(null);
      });
      return () => {
        cancelled = true;
      };
    }
    let alive = true;
    void mockTrustService.getScore(storeId).then((score) => {
      if (!alive) return;
      setTrust(score);
    });
    return () => {
      alive = false;
    };
  }, [storeId]);

  const verification = storeId ? getVerificationProfile(storeId, "store") : null;

  if (!storeId) return null;

  const trustHint = trust ? `Рейтинг доверия: ${trust.overall}/100` : null;
  const verificationLabel =
    verification?.status === "verified"
      ? "Магазин проверен"
      : verification?.status === "pending"
        ? "Проверка магазина в процессе"
        : "Проверка магазина не завершена";

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-white px-4 py-2 text-xs text-slate-600">
      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 font-medium text-slate-800">{verificationLabel}</span>
      {trust?.badges[0] ? (
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-800">{trust.badges[0].label}</span>
      ) : null}
      {trustHint ? <span>{trustHint}</span> : null}
      <span className="text-slate-500">{formatUsualReplyMinutes(trust?.components.response_time)}</span>
      <Link href={`/stores/${encodeURIComponent(storeId)}#store-reputation`} className="ml-auto font-medium text-sky-800 hover:underline">
        Отзывы
      </Link>
    </div>
  );
}
