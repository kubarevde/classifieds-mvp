import Link from "next/link";

type EmptyNotificationsStateProps = {
  variant?: "empty" | "all_read";
};

export function EmptyNotificationsState({ variant = "empty" }: EmptyNotificationsStateProps) {
  const title = variant === "all_read" ? "Непрочитанных уведомлений нет" : "Пока нет уведомлений";
  const description =
    variant === "all_read"
      ? "Когда появятся новые события — они будут здесь."
      : "События по сообщениям, избранному и объявлениям появятся здесь.";

  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-600">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
          <path
            d="M12 22c1.4 0 2.5-1.1 2.5-2.5h-5C9.5 20.9 10.6 22 12 22ZM18 16V11c0-3.1-1.7-5.7-4.5-6.4V4a1.5 1.5 0 0 0-3 0v.6C7.7 5.3 6 7.9 6 11v5l-1.5 1.5V19h15v-1.5L18 16Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3 className="mt-4 text-base font-semibold tracking-tight text-slate-900 sm:text-lg">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
      <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row">
        <Link
          href="/listings"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Перейти в каталог
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Открыть кабинет
        </Link>
      </div>
    </div>
  );
}

