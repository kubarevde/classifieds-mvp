import Link from "next/link";
import { Bell } from "lucide-react";

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
        <Bell className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
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

