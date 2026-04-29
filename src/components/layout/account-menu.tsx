"use client";

import Link from "next/link";
import { ChevronDown, User } from "lucide-react";

type AccountMenuProps = {
  favoritesCount: number;
  favoritesHydrated: boolean;
  displayName: string;
  mode: "buyer" | "seller" | "all";
  storeNavSellerId: string | null;
};

function ChevronDownIcon() {
  return <ChevronDown className="h-4 w-4" strokeWidth={1.5} />;
}

function UserIcon() {
  return <User className="h-4.5 w-4.5" strokeWidth={1.5} />;
}

export function AccountMenu({
  favoritesCount,
  favoritesHydrated,
  displayName,
  mode,
  storeNavSellerId,
}: AccountMenuProps) {
  return (
    <details className="group relative hidden sm:block">
      <summary className="flex h-10 cursor-pointer list-none items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
        <UserIcon />
        {displayName}
        <ChevronDownIcon />
      </summary>

      <div className="absolute right-0 top-12 z-40 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-900/10">
        <ul className="space-y-0.5 text-sm text-slate-700">
          {mode === "buyer" || mode === "all" ? (
            <li>
              <Link href="/dashboard" className="flex items-center rounded-lg px-3 py-2 hover:bg-slate-50">
                Личный кабинет
              </Link>
            </li>
          ) : null}
          {storeNavSellerId ? (
            <li>
              <Link
                href={`/stores/${storeNavSellerId}`}
                className="flex items-center rounded-lg px-3 py-2 hover:bg-slate-50"
              >
                Мой магазин
              </Link>
            </li>
          ) : null}
          {storeNavSellerId ? (
            <li>
              <Link
                href={`/dashboard/store?sellerId=${storeNavSellerId}`}
                className="flex items-center rounded-lg px-3 py-2 hover:bg-slate-50"
              >
                Кабинет магазина
              </Link>
            </li>
          ) : null}
          {mode === "buyer" || mode === "seller" || mode === "all" ? (
            <>
              <li>
                <Link
                  href={mode === "seller" && storeNavSellerId ? `/dashboard/store?sellerId=${storeNavSellerId}&section=messages` : "/messages"}
                  className="flex items-center rounded-lg px-3 py-2 hover:bg-slate-50"
                >
                  Сообщения
                </Link>
              </li>
              <li>
                <Link
                  href={mode === "seller" && storeNavSellerId ? `/dashboard/store?sellerId=${storeNavSellerId}&section=notifications` : "/notifications"}
                  className="flex items-center rounded-lg px-3 py-2 hover:bg-slate-50"
                >
                  Уведомления
                </Link>
              </li>
            </>
          ) : null}
          {mode === "buyer" || mode === "all" ? (
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
          ) : null}
          {mode === "buyer" || mode === "all" ? (
            <li>
              <Link href="/saved-searches" className="flex items-center rounded-lg px-3 py-2 hover:bg-slate-50">
                Сохранённые поиски
              </Link>
            </li>
          ) : null}
        </ul>
      </div>
    </details>
  );
}
