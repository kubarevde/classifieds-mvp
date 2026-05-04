# Реализованный функционал (трассы и файлы)

Связанные документы: [project-overview.md](./project-overview.md) · [modules-and-dependencies.md](./modules-and-dependencies.md) · [data-layer.md](./data-layer.md) · [configuration-and-security.md](./configuration-and-security.md) · [gaps-and-issues.md](./gaps-and-issues.md) · [future-foundation.md](./future-foundation.md)

**Важно:** нет серверных **Route Handlers** (`src/app/api` не используется). Все «ответы» формируются в браузере или на сервере при рендере из **моков** и **статических модулей**.

---

## Группировка по бизнес-доменам

### 1. Демо-роль и доступ к страницам

**Пользователь:** переключает роль в `DemoRoleFloatingControl` (правый нижний угол).

**Трасса:**  
`DemoRoleFloatingControl` / `DemoRoleProvider` (`src/components/demo-role/demo-role.tsx`) → `localStorage` ключ `classifieds-demo-role` → `useDemoRole()` → `DemoRoleGuard` на защищённых страницах.

**Файлы:** `demo-role-constants.ts`, страницы с guard (например кабинеты).

**API:** нет.

**Ошибки / края:** серверный снимок роли по умолчанию `DEFAULT_DEMO_ROLE` до гидрации клиента.

**Тесты:** нет выделенных unit-тестов на провайдер (есть общие тесты сервисов/lib).

---

### 2. Каталог объявлений (listings)

**Пользователь:** фильтрует и открывает карточки, детальную страницу.

**Трасса:**  
`src/app/listings/page.tsx` → `listings-page-root.tsx` / `listings-page-client.tsx` → `useListings` (`src/hooks/data/use-listings.ts`) и/или функции `getListings`, `getListingById` из `src/services/listings/index.ts` → `mockListingsService` в `src/services/listings/mock.ts` → данные из `src/lib/listings.data.ts` и связанных типов `listings.types.ts`, фильтры `listings.filters.ts`.

**Создание объявления:**  
`src/app/create-listing/page.tsx` → `create-listing-wizard.tsx` → Zustand `useListingDraftStore`, лимиты AI `useAiUsageStore`, вызовы `createListing` / AI через `src/services/ai/*`, аукцион `src/services/auctions`, промо `promotions`, гейты `useFeatureGate`.

**API:** нет HTTP.

**Ошибки:** `src/app/listings/error.tsx` для сегмента.

**Тесты:** `src/services/listings/__tests__/listings.service.test.ts`, `src/lib/__tests__/listings.filters.test.ts`.

---

### 3. Магазины и витрина (stores / sellers)

**Пользователь:** каталог магазинов, страница витрины по slug.

**Трасса:**  
`src/app/stores/page.tsx` → `stores-page-client.tsx` → данные через `src/lib/sellers.ts`, `discovery`, сервис `src/services/sellers/mock.ts` для пакетов витрины.  
`src/app/stores/[slug]/page.tsx` → `storefront-page-client.tsx` → `useStorefront` + marketing/trust секции.

**Legacy:** `src/app/sellers/[id]/page.tsx` — редирект на новую схему URL.

**Тесты:** точечно в lib; интеграционных e2e нет.

---

### 4. Запросы (buyer requests)

**Пользователь:** доска запросов, детали, отклик продавца, создание запроса.

**Трасса:**  
`src/app/requests/page.tsx` → `RequestsBoardClient.tsx` → `src/services/requests` (`getBuyerRequests`, `getMatchingRequestsForSeller`, …) и `matching.ts`.  
Создание: `NewRequestPageClient.tsx` / `RequestCreateForm.tsx` → `createBuyerRequest`.

**Тесты:** нет отдельного файла тестов для `requests` service (в отличие от listings/feature-gate).

---

### 5. Дашборд покупателя / продавца

**Пользователь:** `/dashboard` — табы «мои объявления», запросы, избранное и т.д.

**Трасса:**  
`dashboard-page-client.tsx` → `BuyerProvider` state + `src/services/buyer` + listings/requests сервисы.  
`/dashboard/store` → `store-dashboard-page-client.tsx` + `sections/overview`, `listings`, `marketing`, `analytics`, `settings`.

---

### 6. Подписка магазина и feature gates

**Пользователь:** видит ограничения/баннеры апгрейда при функциях Pro/Business.

**Трасса:**  
`SubscriptionProvider` → `useFeatureGate` (`src/hooks/useFeatureGate.ts`) → `createFeatureGateService` (`src/services/feature-gate/mock.ts`) с контекстом плана из подписки и `role` из `useDemoRole`.

**Связанные сущности:** `Feature`, `Plan` в `src/entities/billing/model.ts`.

**Тесты:** `src/services/feature-gate/__tests__/feature-gate.test.ts`.

---

### 7. Сообщения и уведомления

**Пользователь:** список тредов, переписка, счётчики непрочитанного.

**Трасса:**  
`messagesService` (`src/services/messages/index.ts`) → реализации в `mock.ts`.  
Уведомления: сервис `src/services/notifications` + `src/lib/notifications.ts`.  
Счётчики активности продавца: `seller-activity-storage.ts` + хук `use-seller-activity.ts`.

---

### 8. Поддержка (help center + tickets)

**Трасса:**  
Маршруты `src/app/support/**` → компоненты `src/components/support/*` → `src/services/support/mock.ts` (статьи, тикеты).  
Категории/заголовки: `src/lib/support/category-titles.ts`, `demo-user.ts`.

---

### 9. Безопасность (safety reports)

**Трасса:**  
`src/app/safety/**` → `src/components/safety/*` → `src/services/safety/mock.ts`, причины `src/lib/safety/report-reasons.ts`, построение URL `build-report-new-url.ts`.

---

### 10. Верификация

**Трасса:**  
`src/app/verification/**` → компоненты `src/components/verification/*` → `src/services/verification/mock.ts`.  
Dev: `src/app/verification/dev/page.tsx` проверяет `process.env.NODE_ENV !== "development"` и отдаёт доступ только в dev; `forceVerificationStatus` экспортируется из `src/services/verification/index.ts` условно для dev.

---

### 11. Enforcement (санкции и апелляции, пользовательский хаб)

**Трасса:**  
`src/app/enforcement/**` → `EnforcementHubClient`, `AppealForm`, … → `src/services/enforcement/mock.ts`.

---

### 12. Админ-консоль и модерация

**Пользователь:** внутренний оператор (в демо — по роли и query-параметру, см. security doc).

**Трасса:**  
`src/app/admin/**` → `AdminRouteGuard`, `AdminAccessGate`, `ModerationAccessGate` → `resolveAdminPersona` / `personaCanAccessRoute` (`admin-access.ts`) + `canAccessModerationConsole` (`services/moderation/access.ts`).  
Данные: `src/services/admin/mock.ts`, `search-index.ts`, `cases-mock.ts`, очереди модерации `src/services/moderation/mock.ts`.

**Подразделы:** listings, users, stores, requests, support, subscriptions, analytics, system/feature-gates/settings, promotions (campaigns, slots, listings, pricing), moderation queues (reports, verification, appeals, enforcement), cases.

---

### 13. Аналитика, риск, trust, аукционы, промо, спонсорские места

Реализованы как **UI + mock-сервисы**: `src/services/analytics`, `risk`, `trust`, `auctions`, `promotions`, lib `sponsor-board.ts`, `hero-board.ts`, страница `sponsor-board`.

---

### 14. SEO и PWA

**Трасса:**  
`layout.tsx` metadata + `src/lib/seo/metadata.ts`, structured data через `src/components/seo/structured-data-script.tsx` (JSON-LD).  
`robots.ts`, `sitemap.ts` тянут данные из listings/worlds/support libs.  
`ServiceWorkerRegister` + `public/sw.js`.

---

### 15. Сохранённые поиски

**Трасса:**  
`AppProviders` → `SavedSearchesProvider` → `src/services/saved-searches` + хуки matches.

---

## Сводка по тестам

| Область | Файл теста | Покрытие |
|---------|------------|----------|
| Listings service | `listings.service.test.ts` | Мок CRUD / инварианты |
| Listings filters | `listings.filters.test.ts` | Чистые функции фильтров |
| Feature gate | `feature-gate.test.ts` | Плановые ограничения |
| Seller activity storage | `seller-activity-storage.test.ts` | parse/равенство |
| UI atom | `StatTile.test.tsx` | Простой компонент |

**Пробел:** нет e2e (Playwright), мало тестов на крупные клиентские сценарии и admin flows.

---

## Паттерн «типичный запрос данных»

1. **Server Component** страница может импортировать sync-хелперы (`getHomeCategoriesSync`, …) или данные из `lib`.  
2. **Client Component** вызывает хук или напрямую `src/services/*/mock`.  
3. Ответ — синхронный/асинхронный объект в памяти; «обратно в БД» нет.

Полный перечень маршрутов с якорными файлами дублировать нецелесообразно — см. таблицу **Route inventory** в `docs/PROJECT_STRUCTURE.md` (актуальна для навигации по кодовой базе).
