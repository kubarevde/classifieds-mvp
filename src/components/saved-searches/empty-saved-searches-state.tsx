import Link from "next/link";

export function EmptySavedSearchesState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-600">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
          <path
            d="M11 4h2v3M6 8h12l-1 11H7L6 8Zm2 0V6a3 3 0 0 1 6 0v2"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h2 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">Пока нет сохранённых поисков</h2>
      <p className="mt-2 text-sm text-slate-600">
        Настройте фильтры в каталоге и нажмите «Сохранить поиск» — вернуться к ним можно в один клик.
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
        <Link
          href="/listings"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Перейти в каталог
        </Link>
        <Link
          href="/notifications"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Уведомления
        </Link>
      </div>
    </div>
  );
}
