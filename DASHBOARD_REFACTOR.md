# Store dashboard decomposition

## Goal

Split `store-dashboard-page-client.tsx` into five feature sections plus a thin orchestrator and a dedicated modal hook, without changing business logic or UI.

## New layout

```text
src/components/store-dashboard/
  store-dashboard-shared.tsx       # shared constants, helpers, MetricIcon, page props type
  useStoreDashboardModals.ts      # tour + tariff modal state, scroll effect, getSectionClassName
  sections/
    overview/
      StoreOverviewSection.tsx
      StoreOverviewSection.hooks.ts
    listings/
      StoreListingsSection.tsx
      StoreListingsSection.hooks.ts
    marketing/
      StoreMarketingSection.tsx
      StoreMarketingSection.hooks.ts
    analytics/
      StoreAnalyticsSection.tsx
      StoreAnalyticsSection.hooks.ts
    settings/
      StoreSettingsSection.tsx
      StoreSettingsSection.hooks.ts   # re-exports postTypeLabels for the section
      StoreDashboardTourModal.tsx
      StoreDashboardTariffModal.tsx
  store-dashboard-page-client.tsx   # orchestrator: early returns (messages/notifications), state, handlers, section composition
```

## Orchestrator responsibilities

- `listings`, `posts`, `filter`, `message`, `postForm`, `isPostFormVisible`, `settings` state
- `showMockMessage`, `toggleListingVisibility`, `handleSettingsSave`, `handlePostCreate`
- `useStoreDashboardModals(seller.id)` for tour/tariff UI state and `getSectionClassName`
- Renders sections in the **same vertical order** as before (no tab UI): overview → analytics → listings → marketing → settings (including modals at the end of the settings fragment)

## Public API

`StoreDashboardPageClientProps` is defined in `store-dashboard-shared.tsx` and re-exported from `store-dashboard-page-client.tsx` for consumers.

## Runtime fix: seller activity / Navbar

После первого рефакторинга `useSellerActivity` ломал любую страницу с `Navbar` (React 19: нестабильный snapshot у `useSyncExternalStore` → бесконечные обновления).

- Реализация: `src/components/seller/use-seller-activity.ts` — `useState` + `storage` / кастомное событие, `mergeRemoteIntoState` сравнивает состояние через `sellerActivityStatesEqual` (см. `src/lib/seller-activity-storage.ts`).
- Регрессия: `src/lib/__tests__/seller-activity-storage.test.ts` (парсинг и равенство снимков).
- Маршрута `/stores/[slug]` в приложении нет; список магазинов — `/stores`, карточка продавца — `/sellers/[id]`.
