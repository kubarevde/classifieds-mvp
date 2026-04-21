"use client";

import Link from "next/link";

import { useFavorites } from "@/components/favorites/favorites-provider";
import { useNotifications } from "@/components/notifications/notifications-provider";
import { Container } from "@/components/ui/container";
import { getMockUnreadMessagesCount } from "@/lib/messages";

const navLinks = [
  { label: "Главная", href: "/" },
  { label: "Каталог", href: "/listings" },
  { label: "Избранное", href: "/favorites" },
  { label: "Сообщения", href: "/messages" },
  { label: "Уведомления", href: "/notifications" },
  { label: "Подать объявление", href: "/create-listing" },
  { label: "Кабинет", href: "/dashboard" },
];

export function Navbar() {
  const unreadCount = getMockUnreadMessagesCount();
  const { favoritesCount, isHydrated } = useFavorites();
  const { unreadCount: notificationsUnreadCount, isHydrated: notificationsHydrated } =
    useNotifications();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between sm:h-18">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-sky-500 text-lg font-semibold text-white shadow-sm shadow-sky-200">
            C
          </div>
          <div>
            <p className="text-base font-semibold tracking-tight text-slate-900">Classify</p>
            <p className="hidden text-[11px] text-slate-500 sm:block">объявления без лишнего</p>
          </div>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              {link.label}
              {link.href === "/messages" && unreadCount > 0 ? (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-sky-500 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                  {unreadCount}
                </span>
              ) : null}
              {link.href === "/notifications" &&
              notificationsHydrated &&
              notificationsUnreadCount > 0 ? (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-violet-500 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                  {notificationsUnreadCount}
                </span>
              ) : null}
              {link.href === "/favorites" && isHydrated && favoritesCount > 0 ? (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                  {favoritesCount}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/favorites"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Избранное
            {isHydrated && favoritesCount > 0 ? (
              <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                {favoritesCount}
              </span>
            ) : null}
          </Link>
          <Link
            href="/notifications"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Уведомления
            {notificationsHydrated && notificationsUnreadCount > 0 ? (
              <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-violet-500 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                {notificationsUnreadCount}
              </span>
            ) : null}
          </Link>
          <Link
            href="/dashboard"
            className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:block"
          >
            Мой кабинет
          </Link>
          <Link
            href="/create-listing"
            className="rounded-xl bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 sm:px-4"
          >
            Подать объявление
          </Link>
        </div>
      </Container>
    </header>
  );
}
