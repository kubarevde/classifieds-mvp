"use client";

import Link from "next/link";

type HeaderActionsProps = {
  messagesUnreadCount: number;
  notificationsUnreadCount: number;
  notificationsHydrated: boolean;
  isVisible?: boolean;
};

function IndicatorBadge({ value }: { value: number }) {
  if (value <= 0) {
    return null;
  }

  return (
    <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-slate-900 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white">
      {value > 99 ? "99+" : value}
    </span>
  );
}

function MessagesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-5 4V5Z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 17H5a1 1 0 0 1-.8-1.6l1.3-1.7A6 6 0 0 0 7 10V8a5 5 0 0 1 10 0v2a6 6 0 0 0 1.5 3.7l1.3 1.7A1 1 0 0 1 19 17h-4Z" />
      <path d="M9 18a3 3 0 0 0 6 0" />
    </svg>
  );
}

export function HeaderActions({
  messagesUnreadCount,
  notificationsUnreadCount,
  notificationsHydrated,
  isVisible = true,
}: HeaderActionsProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="hidden items-center gap-1.5 sm:flex">
      <Link
        href="/messages"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        aria-label="Сообщения"
      >
        <MessagesIcon />
        <IndicatorBadge value={messagesUnreadCount} />
      </Link>
      <Link
        href="/notifications"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        aria-label="Уведомления"
      >
        <BellIcon />
        <IndicatorBadge value={notificationsHydrated ? notificationsUnreadCount : 0} />
      </Link>
    </div>
  );
}
