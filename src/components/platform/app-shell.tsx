"use client";

import type { ReactNode } from "react";

import { SupportFAB } from "@/components/support/SupportFAB";

/**
 * Обёртка приложения: плавающая поддержка для авторизованных демо-пользователей.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <SupportFAB />
    </>
  );
}
