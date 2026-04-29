"use client";

import type { ReactNode } from "react";

import { SavedSearchesProvider } from "@/components/saved-searches/saved-searches-provider";

/**
 * Общие client-провайдеры для маршрутов с дашбордом, уведомлениями и сохранёнными поисками.
 * Держим один экземпляр в корне, без условного «пропадания» дерева.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return <SavedSearchesProvider>{children}</SavedSearchesProvider>;
}
