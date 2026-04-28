"use client";

import Link from "next/link";
import { useEffect } from "react";

import { captureError } from "@/lib/observability";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureError(error, { digest: error.digest, area: "app/error" });
  }, [error]);

  return (
    <html lang="ru">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-4 py-12 text-center">
          <p className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            Ошибка платформы
          </p>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">Что-то пошло не так</h1>
          <p className="mt-3 max-w-xl text-sm text-slate-600 sm:text-base">
            Страница не загрузилась корректно. Попробуйте повторить действие или вернуться в основные разделы.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Повторить
            </button>
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              На главную
            </Link>
            <Link
              href="/listings"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              В каталог
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}

