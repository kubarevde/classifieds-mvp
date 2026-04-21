"use client";

import Link from "next/link";

type AccountMenuProps = {
  favoritesCount: number;
  favoritesHydrated: boolean;
};

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21a8 8 0 1 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );
}

export function AccountMenu({ favoritesCount, favoritesHydrated }: AccountMenuProps) {
  return (
    <details className="group relative hidden sm:block">
      <summary className="flex h-10 cursor-pointer list-none items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
        <UserIcon />
        Профиль
        <ChevronDownIcon />
      </summary>

      <div className="absolute right-0 top-12 z-40 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-900/10">
        <ul className="space-y-0.5 text-sm text-slate-700">
          <li>
            <Link href="/profile" className="flex items-center rounded-lg px-3 py-2 hover:bg-slate-50">
              Мой профиль
            </Link>
          </li>
          <li>
            <Link href="/dashboard" className="flex items-center rounded-lg px-3 py-2 hover:bg-slate-50">
              Мои покупки и продажи
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/store?sellerId=marina-tech"
              className="flex items-center rounded-lg px-3 py-2 hover:bg-slate-50"
            >
              Управлять магазином
            </Link>
          </li>
          <li>
            <Link href="/favorites" className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-slate-50">
              <span>Избранное</span>
              {favoritesHydrated && favoritesCount > 0 ? (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-slate-900 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                  {favoritesCount > 99 ? "99+" : favoritesCount}
                </span>
              ) : null}
            </Link>
          </li>
          <li>
            <Link href="/saved-searches" className="flex items-center rounded-lg px-3 py-2 hover:bg-slate-50">
              Сохранённые поиски
            </Link>
          </li>
        </ul>
      </div>
    </details>
  );
}
