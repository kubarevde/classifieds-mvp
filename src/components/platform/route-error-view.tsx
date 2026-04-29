"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";

import { captureException } from "@/lib/monitoring";

type RouteErrorViewProps = {
  error: Error & { digest?: string };
  reset: () => void;
  /** Логический сегмент маршрута для контекста в мониторинге */
  segment: string;
};

/**
 * Общий UI для `error.tsx` (сегментные и глобальные границы).
 * Глобальный `app/error.tsx` оборачивает этот блок в `<html><body>`.
 */
export function RouteErrorView({ error, reset, segment }: RouteErrorViewProps) {
  const pathname = usePathname();
  const reportHref = useMemo(() => {
    const path = pathname && pathname.length > 0 ? pathname : "/";
    const subject = `Ошибка на странице: ${path}`;
    const detail = [`digest: ${error.digest ?? "—"}`, `message: ${error.message.slice(0, 500)}`].join("\n");
    const message = `Опишите, что произошло…\n\n---\n${detail}`;
    const params = new URLSearchParams({ category: "other", subject, message });
    return `/support/tickets/new?${params.toString()}`;
  }, [pathname, error.digest, error.message]);

  const abuseHref = useMemo(() => {
    const path = pathname && pathname.length > 0 ? pathname : "/";
    const q = new URLSearchParams({
      targetType: "other",
      targetLabel: `Сбой интерфейса: ${path}`,
    });
    return `/safety/reports/new?${q.toString()}`;
  }, [pathname]);

  useEffect(() => {
    captureException(error, { digest: error.digest, segment });
  }, [error, segment]);

  return (
    <main className="mx-auto flex min-h-[50vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-12 text-center">
      <p className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
        Ошибка
      </p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">Что-то пошло не так</h1>
      <p className="mt-3 max-w-xl text-sm text-slate-600 sm:text-base">
        Не удалось отобразить страницу. Попробуйте снова или перейдите в основной раздел.
      </p>
      <div className="mt-6 flex w-full max-w-md flex-col items-stretch gap-2 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Попробовать снова
        </button>
        <Link
          href={reportHref}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-4 text-sm font-semibold text-amber-950 transition hover:bg-amber-100"
        >
          Сообщить о проблеме
        </Link>
        <Link
          href={abuseHref}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-950 transition hover:bg-rose-100"
        >
          Пожаловаться
        </Link>
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          На главную
        </Link>
      </div>
      <p className="mt-4 text-xs text-slate-500">
        <Link href="/listings" className="font-medium text-blue-700 hover:text-blue-800">
          В каталог объявлений
        </Link>
      </p>
    </main>
  );
}
