"use client";

import Link from "next/link";
import { useEffect } from "react";

import { DemoRole } from "@/components/demo-role/demo-role";

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  favoritesCount: number;
  favoritesHydrated: boolean;
  messagesUnreadCount: number;
  notificationsUnreadCount: number;
  notificationsHydrated: boolean;
  role: DemoRole;
};

function closeOnEscape(event: KeyboardEvent, onClose: () => void) {
  if (event.key === "Escape") {
    onClose();
  }
}

function MenuListItem({
  href,
  label,
  badge,
  onClose,
}: {
  href: string;
  label: string;
  badge?: number;
  onClose: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClose}
        className="flex min-h-11 items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <span>{label}</span>
        {badge && badge > 0 ? (
          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-slate-900 px-1.5 py-0.5 text-[11px] font-semibold text-white">
            {badge > 99 ? "99+" : badge}
          </span>
        ) : null}
      </Link>
    </li>
  );
}

export function MobileMenu({
  isOpen,
  onClose,
  favoritesCount,
  favoritesHydrated,
  messagesUnreadCount,
  notificationsUnreadCount,
  notificationsHydrated,
  role,
}: MobileMenuProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handler = (event: KeyboardEvent) => closeOnEscape(event, onClose);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 sm:hidden">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/30"
        aria-label="Закрыть меню"
      />

      <div className="absolute right-0 top-0 h-full w-[86vw] max-w-sm overflow-y-auto border-l border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/15">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">Меню</p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            aria-label="Закрыть"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4.5 w-4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m6 6 12 12" />
              <path d="m18 6-12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <section>
            <p className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Главное</p>
            <ul className="mt-2 space-y-0.5">
              <MenuListItem href="/" label="Главная" onClose={onClose} />
              <MenuListItem href="/listings" label="Объявления" onClose={onClose} />
              <MenuListItem href="/stores" label="Магазины" onClose={onClose} />
              {role === "all" ? <MenuListItem href="/#worlds" label="Миры" onClose={onClose} /> : null}
              {role === "all" ? (
                <MenuListItem href="/sponsor-board" label="Герой доски" onClose={onClose} />
              ) : null}
              {role === "guest" ? <MenuListItem href="/profile" label="Войти" onClose={onClose} /> : null}
            </ul>
          </section>

          {role === "buyer" || role === "all" ? (
            <section>
              <p className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Активность</p>
              <ul className="mt-2 space-y-0.5">
                <MenuListItem
                  href="/messages"
                  label="Сообщения"
                  badge={messagesUnreadCount}
                  onClose={onClose}
                />
                <MenuListItem
                  href="/notifications"
                  label="Уведомления"
                  badge={notificationsHydrated ? notificationsUnreadCount : 0}
                  onClose={onClose}
                />
                <MenuListItem
                  href="/favorites"
                  label="Избранное"
                  badge={favoritesHydrated ? favoritesCount : 0}
                  onClose={onClose}
                />
                <MenuListItem href="/saved-searches" label="Сохранённые поиски" onClose={onClose} />
              </ul>
            </section>
          ) : null}

          {role === "seller" || role === "all" ? (
            <section>
              <p className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Я продавец / бизнес</p>
              <ul className="mt-2 space-y-0.5">
                <MenuListItem href="/sellers/marina-tech" label="Мой магазин" onClose={onClose} />
                <MenuListItem href="/dashboard/store?sellerId=marina-tech" label="Кабинет" onClose={onClose} />
              </ul>
            </section>
          ) : null}

          {role !== "guest" ? (
            <section>
              <p className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Аккаунт</p>
              <ul className="mt-2 space-y-0.5">
                <MenuListItem href="/profile" label="Профиль" onClose={onClose} />
                {role === "buyer" || role === "all" ? (
                  <MenuListItem href="/dashboard" label="Мои покупки и продажи" onClose={onClose} />
                ) : null}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
