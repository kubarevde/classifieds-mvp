"use client";

import { useEffect, useMemo, useState } from "react";

import type { VerificationLevel, VerificationStatus, VerificationSubjectType } from "@/services/verification/types";
import { forceVerificationStatus } from "@/services/verification";
import { VerificationBadge } from "@/components/verification/VerificationBadge";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/create-listing/input";
import { VerificationChecklist } from "@/components/verification/VerificationChecklist";
import { cn } from "@/components/ui/cn";
import { getVerificationBenefits } from "@/services/verification";
import { VerificationPrompt } from "@/components/verification/VerificationPrompt";
import type { VerificationProfile } from "@/services/verification/types";
import Link from "next/link";

const subjectTypeUserIdDefaults: Record<VerificationSubjectType, string> = {
  buyer: "buyer-dmitriy",
  seller: "marina-tech",
  store: "marina-tech",
};

const levels: VerificationLevel[] = ["basic", "identity", "business", "trusted_plus"];
const statuses: VerificationStatus[] = ["not_started", "pending", "verified", "rejected", "needs_review"];

export function VerificationDevPanel() {
  const [subjectType, setSubjectType] = useState<VerificationSubjectType>("store");
  const [level, setLevel] = useState<VerificationLevel>("business");
  const [status, setStatus] = useState<VerificationStatus>("pending");
  const [userId, setUserId] = useState(subjectTypeUserIdDefaults.store);
  const [rejectionReason, setRejectionReason] = useState<string>("Недостаёт документов (mock).");
  const [profile, setProfile] = useState<VerificationProfile | null>(null);

  useEffect(() => {
    void Promise.resolve().then(() => {
      setUserId(subjectTypeUserIdDefaults[subjectType]);
      if (subjectType === "buyer") {
        setLevel("basic");
      } else if (subjectType === "seller") {
        setLevel("identity");
      } else {
        setLevel("business");
      }
      setStatus("pending");
      setRejectionReason("Недостаёт документов (mock).");
    });
  }, [subjectType]);

  const canSetRejectionReason = status === "rejected" || status === "needs_review";

  const primaryBenefits = useMemo(() => getVerificationBenefits(level), [level]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/60">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Verification dev</h1>
            <p className="text-sm text-slate-600">Быстро переключайте mock-статусы: rejected и needs_review.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/verification/status" className="text-sm font-semibold text-slate-700 underline underline-offset-2">
              На статус
            </Link>
          </div>
        </div>

        {!forceVerificationStatus ? (
          <VerificationPrompt
            title="Недоступно"
            description="Этот маршрут включён только в development-сборке."
            bullets={["NODE_ENV не development", "forceVerificationStatus не экспортируется"]}
          />
        ) : null}

        <Card className="space-y-4 p-4 sm:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="text-slate-600">Subject</span>
              <select
                value={subjectType}
                onChange={(e) => setSubjectType(e.target.value as VerificationSubjectType)}
                className={cn("h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm")}
              >
                <option value="buyer">buyer</option>
                <option value="seller">seller</option>
                <option value="store">store</option>
              </select>
            </label>

            <label className="space-y-1 text-sm">
              <span className="text-slate-600">Уровень</span>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as VerificationLevel)}
                className={cn("h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm")}
              >
                {levels.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm">
              <span className="text-slate-600">Статус</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as VerificationStatus)}
                className={cn("h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm")}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm">
              <span className="text-slate-600">UserId</span>
              <Input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID (mock)" />
            </label>
          </div>

          {canSetRejectionReason ? (
            <label className="space-y-1 text-sm">
              <span className="text-slate-600">rejectionReason</span>
              <Input value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Причина (mock)" />
            </label>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="primary"
              disabled={!forceVerificationStatus}
              onClick={() => {
                if (!forceVerificationStatus) return;
                const next = forceVerificationStatus({
                  userId,
                  subjectType,
                  level,
                  status,
                  rejectionReason: canSetRejectionReason ? rejectionReason : undefined,
                });
                setProfile(next);
              }}
            >
              Apply
            </Button>
          </div>
        </Card>

        {profile ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <VerificationBadge status={profile.status} level={profile.level} size="md" variant="compact" />
              <span className="text-sm font-semibold text-slate-900">Profile updated</span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-4 sm:p-6">
                <h2 className="text-base font-semibold text-slate-900">Польза</h2>
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  {primaryBenefits.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-600" aria-hidden />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-4 sm:p-6">
                <h2 className="text-base font-semibold text-slate-900">Checklist</h2>
                <div className="mt-3">
                  <VerificationChecklist requirements={profile.requirements} />
                </div>
              </Card>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

