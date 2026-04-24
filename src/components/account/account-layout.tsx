"use client";

import Link from "next/link";
import { Bell, Heart, LayoutGrid, Megaphone, MessageCircle, Search, User } from "lucide-react";

import { Badge, Card } from "@/components/ui";

export type AccountTab =
  | "listings"
  | "promotion"
  | "favorites"
  | "saved-searches"
  | "messages"
  | "notifications"
  | "profile";

type AccountLayoutProps = {
  activeTab: AccountTab;
  unreadMessages: number;
  unreadNotifications: number;
  hideDesktopSidebar?: boolean;
  includePromotionTab?: boolean;
  children: React.ReactNode;
};

const tabs: Array<{ id: AccountTab; label: string; icon: React.ReactNode }> = [
  { id: "listings", label: "Мои объявления", icon: <LayoutGrid className="h-4 w-4" /> },
  { id: "promotion", label: "Продвижение", icon: <Megaphone className="h-4 w-4" /> },
  { id: "favorites", label: "Избранное", icon: <Heart className="h-4 w-4" /> },
  { id: "saved-searches", label: "Сохранённые поиски", icon: <Search className="h-4 w-4" /> },
  { id: "messages", label: "Сообщения", icon: <MessageCircle className="h-4 w-4" /> },
  { id: "notifications", label: "Уведомления", icon: <Bell className="h-4 w-4" /> },
  { id: "profile", label: "Профиль", icon: <User className="h-4 w-4" /> },
];

function tabHref(tab: AccountTab) {
  return tab === "listings" ? "/dashboard" : `/dashboard?tab=${tab}`;
}

function unreadForTab(tab: AccountTab, unreadMessages: number, unreadNotifications: number) {
  if (tab === "messages") {
    return unreadMessages;
  }
  if (tab === "notifications") {
    return unreadNotifications;
  }
  return 0;
}

export function AccountLayout({
  activeTab,
  unreadMessages,
  unreadNotifications,
  hideDesktopSidebar = false,
  includePromotionTab = true,
  children,
}: AccountLayoutProps) {
  const visibleTabs = includePromotionTab ? tabs : tabs.filter((tab) => tab.id !== "promotion");
  return (
    <div className={`grid gap-4 ${hideDesktopSidebar ? "" : "lg:grid-cols-[240px_minmax(0,1fr)]"}`}>
      <Card className={`sticky top-20 h-fit p-3 ${hideDesktopSidebar ? "hidden" : "hidden lg:block"}`}>
        <nav className="space-y-1">
          {visibleTabs.map((tab) => {
            const isActive = tab.id === activeTab;
            const unread = unreadForTab(tab.id, unreadMessages, unreadNotifications);
            return (
              <Link
                key={tab.id}
                href={tabHref(tab.id)}
                className={[
                  "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition",
                  isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100",
                ].join(" ")}
              >
                <span className="flex items-center gap-2">
                  {tab.icon}
                  {tab.label}
                </span>
                {unread > 0 ? (
                  <Badge variant={isActive ? "secondary" : "default"} size="sm">
                    {unread > 99 ? "99+" : unread}
                  </Badge>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </Card>

      <div className="space-y-4">
        <div className="no-scrollbar flex gap-2 overflow-x-auto lg:hidden">
          {visibleTabs.map((tab) => {
            const unread = unreadForTab(tab.id, unreadMessages, unreadNotifications);
            const isActive = tab.id === activeTab;
            return (
              <Link
                key={tab.id}
                href={tabHref(tab.id)}
                className={[
                  "inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm",
                  isActive ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700",
                ].join(" ")}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {unread > 0 ? <Badge size="sm">{unread > 99 ? "99+" : unread}</Badge> : null}
              </Link>
            );
          })}
        </div>
        {children}
      </div>
    </div>
  );
}
