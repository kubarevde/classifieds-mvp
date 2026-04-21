import Link from "next/link";

type EmptyFavoritesStateProps = {
  title?: string;
  description?: string;
};

export function EmptyFavoritesState({
  title = "Пока нет сохраненных объявлений",
  description = "Добавляйте понравившиеся карточки в избранное, чтобы быстро вернуться к ним позже.",
}: EmptyFavoritesStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-7 text-center sm:p-10">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-xl text-slate-500">
        ♡
      </div>
      <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600 sm:text-base">{description}</p>
      <div className="mt-5">
        <Link
          href="/listings"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 active:scale-[0.99]"
        >
          Перейти в каталог
        </Link>
      </div>
    </div>
  );
}
