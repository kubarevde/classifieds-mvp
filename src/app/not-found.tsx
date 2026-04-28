import Link from "next/link";

import { Navbar } from "@/components/layout/navbar";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-16 text-center sm:py-20">
        <p className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
          404
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Страница не найдена</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
          Возможно, ссылка устарела или объект уже снят с публикации. Попробуйте поискать нужное в каталоге, мирах или запросах покупателей.
        </p>
        <div className="mt-8 grid w-full max-w-xl gap-2 sm:grid-cols-2">
          <Link href="/listings" className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700">
            Открыть каталог
          </Link>
          <Link href="/requests" className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Запросы покупателей
          </Link>
          <Link href="/stores" className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Магазины
          </Link>
          <Link href="/worlds" className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Миры
          </Link>
        </div>
      </main>
    </div>
  );
}

