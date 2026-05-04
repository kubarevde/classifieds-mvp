"use client";

import Link from "next/link";
import { Bell, MessageCircle } from "lucide-react";

import { UnreadBadge } from "@/components/messages/UnreadBadge";

type HeaderActionsProps = {
  messagesUnreadCount: number;
  notificationsUnreadCount: number;
  notificationsHydrated: boolean;
  isVisible?: boolean;
};

function IndicatorBadge({ value }: { value: number }) {
  return <UnreadBadge count={value} />;
}

function MessagesIcon() {
  return <MessageCircle className="h-5 w-5" strokeWidth={1.5} />;
}

function BellIcon() {
  return <Bell className="h-5 w-5" strokeWidth={1.5} />;
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
        className="relative inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        aria-label="Сообщения"
      >
        <MessagesIcon />
        <IndicatorBadge value={messagesUnreadCount} />
      </Link>
      <Link
        href="/notifications"
        className="relative inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        aria-label="Уведомления"
      >
        <BellIcon />
        <IndicatorBadge value={notificationsHydrated ? notificationsUnreadCount : 0} />
      </Link>
    </div>
  );
}
