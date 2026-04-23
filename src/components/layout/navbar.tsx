"use client";

import Link from "next/link";
import { useState } from "react";

import { getDemoDisplayName, useDemoRole } from "@/components/demo-role/demo-role";
import { AccountMenu } from "@/components/layout/account-menu";
import { HeaderActions } from "@/components/layout/header-actions";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { useFavorites } from "@/components/favorites/favorites-provider";
import { useNotifications } from "@/components/notifications/notifications-provider";
import { Container } from "@/components/ui/container";
import { getMockUnreadMessagesCount } from "@/lib/messages";

const navByRole = {
  guest: [
    { label: "Главная", href: "/" },
    { label: "Объявления", href: "/listings" },
    { label: "Магазины", href: "/stores" },
  ],
  buyer: [{ label: "Главная", href: "/" }, { label: "Объявления", href: "/listings" }, { label: "Магазины", href: "/stores" }],
  seller: [{ label: "Главная", href: "/" }, { label: "Объявления", href: "/listings" }, { label: "Магазины", href: "/stores" }],
  all: [
    { label: "Главная", href: "/" },
    { label: "Объявления", href: "/listings" },
    { label: "Магазины", href: "/stores" },
    { label: "Миры", href: "/#worlds" },
    { label: "Герой доски", href: "/sponsor-board" },
  ],
} as const;

function BurgerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { role, isHydrated: roleHydrated } = useDemoRole();
  const unreadCount = getMockUnreadMessagesCount();
  const { favoritesCount, isHydrated: favoritesHydrated } = useFavorites();
  const { unreadCount: notificationsUnreadCount, isHydrated: notificationsHydrated } =
    useNotifications();
  const effectiveRole = roleHydrated ? role : "all";
  const primaryNavLinks = navByRole[effectiveRole];
  const isActivityVisible = effectiveRole === "buyer" || effectiveRole === "all";
  const isAccountVisible = effectiveRole !== "guest";
  const displayName = getDemoDisplayName(effectiveRole);
  const accountMode: "buyer" | "seller" | "all" =
    effectiveRole === "seller" ? "seller" : effectiveRole === "buyer" ? "buyer" : "all";

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <Container className="flex h-16 items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-lg font-semibold text-white shadow-sm shadow-slate-200">
              C
            </div>
            <div>
              <p className="text-base font-semibold tracking-tight text-slate-900">Classify</p>
              <p className="hidden text-[11px] text-slate-500 md:block">бесплатные объявления + Pro‑инструменты</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-4 lg:flex">
            {primaryNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {effectiveRole === "guest" ? (
              <Link
                href="/profile"
                className="hidden h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
              >
                Войти
              </Link>
            ) : null}

            <HeaderActions
              messagesUnreadCount={unreadCount}
              notificationsUnreadCount={notificationsUnreadCount}
              notificationsHydrated={notificationsHydrated}
              isVisible={isActivityVisible}
            />

            {isAccountVisible ? (
              <AccountMenu
                favoritesCount={favoritesCount}
                favoritesHydrated={favoritesHydrated}
                displayName={displayName}
                mode={accountMode}
              />
            ) : null}

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 sm:hidden"
              aria-label="Открыть меню"
            >
              <BurgerIcon />
            </button>
          </div>
        </Container>
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        favoritesCount={favoritesCount}
        favoritesHydrated={favoritesHydrated}
        messagesUnreadCount={unreadCount}
        notificationsUnreadCount={notificationsUnreadCount}
        notificationsHydrated={notificationsHydrated}
        role={effectiveRole}
      />
    </>
  );
}
