import Link from "next/link";
import { Bookmark } from "lucide-react";

export function EmptySavedSearchesState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-600">
        <Bookmark className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">Пока нет сохранённых поисков</h2>
      <p className="mt-2 text-sm text-slate-600">
        Сохраняйте keyword, AI и photo-search сценарии. Любой тип поиска можно вернуть в один клик.
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
        <Link
          href="/listings"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Перейти в каталог
        </Link>
        <Link
          href="/dashboard?tab=notifications"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Уведомления
        </Link>
        <Link
          href="/requests/new"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Разместить запрос о покупке
        </Link>
      </div>
    </div>
  );
}
