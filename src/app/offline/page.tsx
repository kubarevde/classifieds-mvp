"use client";

import Link from "next/link";

import { Navbar } from "@/components/layout/navbar";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
        <p className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
          Offline mode
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Похоже, соединение пропало
        </h1>
        <p className="mt-3 max-w-xl text-sm text-slate-600 sm:text-base">
          Мы не смогли загрузить свежие данные. Часть ранее открытого контента может быть доступна из кэша.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Попробовать снова
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
            Вернуться к каталогу
          </Link>
        </div>
      </main>
    </div>
  );
}

