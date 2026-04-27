"use client";

import { useEffect, useMemo, useState } from "react";

type CountdownTimerProps = {
  endAt: Date;
  className?: string;
};

function useInterval(callback: () => void, delayMs: number) {
  useEffect(() => {
    const timer = window.setInterval(callback, delayMs);
    return () => window.clearInterval(timer);
  }, [callback, delayMs]);
}

function diffToParts(totalMs: number) {
  const clamped = Math.max(0, totalMs);
  const totalSeconds = Math.floor(clamped / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

function pad2(value: number) {
  return value.toString().padStart(2, "0");
}

export function CountdownTimer({ endAt, className }: CountdownTimerProps) {
  const [nowMs, setNowMs] = useState(() => Date.now());
  useInterval(() => setNowMs(Date.now()), 1000);

  const remainingMs = endAt.getTime() - nowMs;
  const parts = useMemo(() => diffToParts(remainingMs), [remainingMs]);

  if (remainingMs <= 0) {
    return <div className={className}>Завершён</div>;
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-4 gap-1.5">
        <TimeCell label="д" value={pad2(parts.days)} />
        <TimeCell label="ч" value={pad2(parts.hours)} />
        <TimeCell label="м" value={pad2(parts.minutes)} />
        <TimeCell label="с" value={pad2(parts.seconds)} />
      </div>
    </div>
  );
}

function TimeCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-center">
      <p className="font-mono text-sm font-semibold text-slate-900 tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}
