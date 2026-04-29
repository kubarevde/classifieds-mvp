# Project Technical Overview

## 1. Executive summary

`classifieds-mvp` — frontend-first demo платформы объявлений с multi-domain scope: каталог объявлений, магазины (storefront), reverse marketplace запросов, buyer/seller кабинеты, support/safety, verification/enforcement и internal moderation console.

Проект построен на Next.js App Router и TypeScript, с явным service layer и mock-реализациями почти во всех доменах. Архитектурно код уже разложен по доменным модулям и интерфейсам сервисов, но production backend integration в коде не обнаружен.

Текущая зрелость:
- фронтенд: высокий уровень прототипирования, широкое покрытие экранов и сценариев;
- архитектура: структурирована, но data layer в основном mock-only;
- platform readiness: есть база для SEO/PWA/offline и quality pipeline;
- operational maturity: internal trust & safety modules присутствуют, но тоже работают на mock-данных.

## 2. Product scope

По коду обнаружены следующие продуктовые области:

- **Homepage / discovery**: `src/app/page.tsx`, home-блоки в `src/components/home/*`.
- **Listings**: `/listings`, `/listings/[id]`, create listing wizard, listings filters/search.
- **Requests**: `/requests`, `/requests/[id]`, `/requests/new`, response workflow продавца.
- **Stores / storefront**: `/stores`, `/stores/[slug]`, storefront sections, store filters/cards.
- **Worlds**: `/worlds`, `/worlds/[slug]`, world-specific discovery.
- **Buyer/Seller dashboards**: `/dashboard`, `/dashboard/store`, плюс store-dashboard sections.
- **Support / help center**: `/support`, support categories/articles, support tickets.
- **Safety**: `/safety`, safety reports (list/new/details), guide pages.
- **Verification**: `/verification`, `/verification/identity`, `/verification/business`, `/verification/status`, dev panel route.
- **Enforcement / appeals**: `/enforcement`, `/enforcement/actions`, `/enforcement/appeals`, creation/details flows.
- **Risk / scam prevention surfaces**: `src/components/risk/*`, risk rules service.
- **Moderation console (internal)**: `/admin/moderation/*` queue, details, decisions, notes.
- **Admin/internal tools**: moderation suite + admin shell components in `src/components/admin/*`.

## 3. Technology stack

### Core
- **Framework**: Next.js `16.2.4` (`package.json`)
- **React**: `19.2.4`
- **Language**: TypeScript (`strict: true` in `tsconfig.json`)
- **Package manager**: npm (`package-lock.json`, npm scripts)

### UI / Styling
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss"` in `src/app/globals.css`, `@tailwindcss/postcss`)
- **UI composition**: custom UI primitives in `src/components/ui/*` (Button/Card/Badge/Toast/SectionHeader)
- **Class variants**: `class-variance-authority`
- **Class helpers**: `clsx`
- **Icons**: `lucide-react`

### Forms / Validation
- **Forms**: `react-hook-form`
- **Validation**: `zod`
- **Resolver**: `@hookform/resolvers` (`zodResolver` usage confirmed)

### State / Data
- **Global/local client state**:
  - React Context providers (`DemoRoleProvider`, `SubscriptionProvider`, `BuyerProvider`, etc.)
  - Zustand stores (`src/stores/listing-draft-store.ts`, `src/stores/ai-usage-store.ts`)
- **Server state library**: React Query/SWR не обнаружены
- **HTTP/data client libs** (`axios`, `@tanstack/*`, `swr`) не обнаружены

### Visualization / Content
- **Charts**: `recharts` (analytics components)
- **Markdown rendering**: `react-markdown` (support article rendering)

### Tooling / Quality
- **Lint**: ESLint 9 + `eslint-config-next` (core-web-vitals + typescript configs)
- **Typecheck**: `tsc --noEmit`
- **Tests**: Vitest + Testing Library + jsdom deps
- **Build**: `next build` (Turbopack enabled in `next.config.ts`)

### SEO / PWA / Observability
- **Metadata/SEO**: Next metadata API, JSON-LD scripts, sitemap, robots, canonical helpers
- **PWA basics**: `manifest.ts`, `public/sw.js`, offline route
- **Monitoring vendor SDK**: не обнаружено (Sentry/etc. not integrated; local monitoring facade exists)

## 4. Application architecture

### Routing model
- Используется **App Router** (`src/app/*`), page-centric domain segmentation.
- Route handlers (`app/api/.../route.ts`) не обнаружены.

### Layering (observed)
- `src/app/*` — route entrypoints + page composition
- `src/components/*` — domain/UI components
- `src/services/*` — service contracts + mock implementations
- `src/stores/*` — client persistent state (Zustand)
- `src/lib/*` — utilities, domain helpers, SEO, mock datasets, constants
- `src/entities/*` — domain models/types by bounded domain
- `src/api/contracts/*` — API DTO contracts for future backend integration

### Data flow
- Большинство страниц/компонентов читают данные из `src/services/<domain>/index.ts`.
- `index.ts` в сервисах обычно re-export mock-реализаций (через bound methods).
- В части UI есть sync mock access directly at render time, в части — hooks (`src/hooks/data/*`) через fetch-in-effect pattern.

### Client vs server responsibilities
- Server components используются для route-level assembly/metadata.
- Большинство интерактивных модулей — `use client`.
- Internal/admin/moderation flows реализованы client-side на mock-сервисах.

## 5. Directory map

- **`src/app`**: маршруты, metadata, SEO infra (`manifest.ts`, `robots.ts`, `sitemap.ts`), global layout/error.
- **`src/components`**: доменные UI-модули (listings, requests, stores, safety, support, verification, enforcement, moderation, admin, dashboard, etc.).
- **`src/services`**: доменные сервисы и mock-слой (listings, requests, stores, sellers, marketing, verification, enforcement, moderation, support, safety, risk, billing, trust, analytics, etc.).
- **`src/stores`**: Zustand stores для draft/usage tracking.
- **`src/lib`**: shared logic, mock data sources, seo/canonical helpers, observability wrappers, safety/support helpers.
- **`src/entities`**: доменные типы (`ai`, `analytics`, `auction`, `billing`, `marketing`, `requests`, `search`, `seller`, `trust`).
- **`src/api/contracts`**: typed API contracts (auth/listings/requests/search/stores/uploads/users/notifications).
- **`public`**: icons + service worker (`sw.js`).
- **`tests`**: выделенной корневой папки нет; тесты colocated (`__tests__`, `*.test.ts(x)`).

## 6. Routing overview

### Public product routes
- `/`, `/listings`, `/listings/[id]`, `/stores`, `/stores/[slug]`
- `/requests`, `/requests/[id]`, `/requests/new`
- `/worlds`, `/worlds/[slug]`
- `/create-listing`, `/pricing`, `/messages`, `/notifications`, `/favorites`, `/saved-searches`, `/profile`
- Legacy redirect: `/sellers/[id]` -> `/stores/[id]`

### Account / dashboard
- `/dashboard`
- `/dashboard/store`

### Support / safety
- `/support`
- `/support/[category]`, `/support/[category]/[slug]`
- `/support/tickets`, `/support/tickets/new`, `/support/tickets/[id]`
- `/safety`, `/safety/reports`, `/safety/reports/new`, `/safety/reports/[id]`, `/safety/guide/[slug]`

### Verification / enforcement
- `/verification`, `/verification/identity`, `/verification/business`, `/verification/status`, `/verification/dev`
- `/enforcement`, `/enforcement/actions`, `/enforcement/actions/[id]`
- `/enforcement/appeals`, `/enforcement/appeals/new`, `/enforcement/appeals/[id]`

### Admin / internal
- `/admin/moderation`
- `/admin/moderation/reports`, `/verification`, `/appeals`, `/enforcement` (+ `[id]` detail routes)

### Platform infra routes/files
- `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/manifest.ts`
- `src/app/offline/page.tsx`
- errors/loading: app-level + scoped (`requests`, `listings`, `dashboard`, `stores`, etc.)

## 7. Domain modules

### Listings
- **Purpose**: catalog discovery + listing detail + creation wizard.
- **Key routes**: `/listings`, `/listings/[id]`, `/create-listing`.
- **Main components**: `listings-page-client`, `listing-preview-card`, `listing-details`, create listing wizard (`create-listing/*`).
- **Dependencies**: `services/listings`, `services/auctions`, saved searches, seller/store mapping.
- **Maturity**: высокий фронтовый охват, production API не подключен.
- **Mock/backend readiness**: интерфейсы сервиса + API contracts есть; runtime data — mock store.

### Requests
- **Purpose**: reverse marketplace demand board + seller responses.
- **Key routes**: `/requests`, `/requests/[id]`, `/requests/new`.
- **Main components**: `RequestsBoardClient`, `RequestCard`, `RequestDetailsClient`, `RequestResponseComposer`.
- **Dependencies**: `services/requests`, matching helper, intent adapter.
- **Maturity**: end-to-end UI flow присутствует.
- **Mock/backend readiness**: good service abstraction; data source mock-only.

### Stores / storefront
- **Purpose**: catalog of stores + store profile pages + seller context.
- **Key routes**: `/stores`, `/stores/[slug]`, redirect from `/sellers/[id]`.
- **Main components**: `StoresPageClient`, `StoreCard`, `StoreFiltersBar`, `storefront-page-client`.
- **Dependencies**: `services/sellers`, `services/marketing`, listings linkage.
- **Maturity**: rich storefront UX and dashboard linkage.
- **Mock/backend readiness**: interfaces in services and API contracts; still mock-backed.

### Worlds
- **Purpose**: thematic segmentation for catalog and community context.
- **Key routes**: `/worlds`, `/worlds/[slug]`.
- **Main components**: world identity cards/strips, world-specific listing/store slices.
- **Dependencies**: `lib/worlds*`, listings/stores datasets.
- **Maturity**: functional UI integration.
- **Mock/backend readiness**: world model is local/static in current code.

### Verification
- **Purpose**: identity/business verification workflows and status surfaces.
- **Key routes**: `/verification/*`.
- **Main components**: `VerificationHubClient`, `VerificationTierCard`, status/checklist/prompt components.
- **Dependencies**: `services/verification`.
- **Maturity**: workflow UI implemented; dev-only status forcing route exists.
- **Mock/backend readiness**: service API shape exists; external KYC/KYB integration не обнаружена.

### Enforcement
- **Purpose**: platform actions visibility + appeals workflow.
- **Key routes**: `/enforcement/*`.
- **Main components**: `EnforcementHubClient`, action cards, appeal form/timeline.
- **Dependencies**: `services/enforcement`.
- **Maturity**: user-facing workflow implemented in demo mode.
- **Mock/backend readiness**: service contract and typed models present; backend integration absent.

### Risk
- **Purpose**: risk signal detection and safety hints/checklists.
- **Key surfaces**: risk components embedded across listing/request/safety flows.
- **Main modules**: `services/risk/rules.ts`, `components/risk/*`.
- **Maturity**: rules-based local engine.
- **Mock/backend readiness**: no external fraud engine integration detected.

### Moderation (internal)
- **Purpose**: trust & safety queue, review decisions, notes, timeline.
- **Key routes**: `/admin/moderation/*`.
- **Main components**: `ModerationShell`, queue cards, filters, decision bar, reviewer notes.
- **Dependencies**: `services/moderation` (+ access gate by role).
- **Maturity**: strong internal UI skeleton.
- **Mock/backend readiness**: queue state and decisions are mock-only.

### Admin
- **Purpose**: generic admin page shells + filter/action scaffolding.
- **Main components**: `AdminListPageShell`, `AdminDetailPageShell`, `AdminAccessGate`, `useAdminUrlFilters`.
- **Maturity**: used by moderation module.
- **Backend readiness**: no separate admin API detected.

## 8. State management

### Confirmed stores
- `useListingDraftStore`:
  - persisted draft for create-listing wizard
  - includes draft snapshot, photos, promotion and auction settings
  - persisted in localStorage (`classifieds:listing-draft`)
- `useAiUsageStore`:
  - daily/session AI usage counters, daily reset logic
  - persisted in localStorage (`classifieds:ai-usage`)

### Other state patterns
- Extensive usage of React local state (`useState`, `useMemo`, `useEffect`) in client pages.
- Global cross-cutting state via Context providers (role, buyer, subscription, saved searches, toast).
- `src/hooks/data/*` implements simple fetch-in-effect hooks (explicitly allowed via ESLint override for placeholder data hooks).

### Readiness for React Query/SWR
- Current hooks are structurally replaceable by query library.
- No query cache/mutation library integrated yet.
- Service boundaries and typed responses make migration feasible.

## 9. Services and mock API readiness

### What is already abstracted
- Most business domains are behind service interfaces (`ListingsService`, `BuyerRequestsService`, `SellerService`, etc.).
- `src/services/*/index.ts` exposes stable API entrypoints consumed by UI.
- `src/api/contracts/*` provides DTO contracts for multiple domains.

### Mock-only reality
- Runtime implementations are predominantly from `./mock` exports.
- Some services use in-memory module-level stores (state resets on reload).
- No real HTTP transport layer (fetch/axios client abstraction) detected.

### Backend swap readiness
- Positive:
  - domain interfaces exist;
  - API contract folder exists;
  - components mostly depend on index-level service exports.
- Gaps:
  - DI/composition root for switching mock/http globally is not centralized across all services;
  - no auth/session token transport integration found;
  - no runtime API error normalization standard detected across domains.

## 10. UI system and design patterns

- **UI primitives**: custom `Button`, `Card`, `Badge`, `Toast`, `SectionHeader`.
- **Button system**: variants include `primary|secondary|outline|ghost|destructive`; target size rules present in tokens.
- **Card system**: neutral border/radius defaults, with domain-level overrides.
- **Form patterns**: RHF + Zod in critical forms (appeals, safety reports, support tickets); some forms remain manual.
- **Trust/safety patterns**: dedicated notices, checklists, status badges, moderation cards.
- **Dashboard/admin patterns**: page shells, section wrappers, sticky action bar, filter bars.
- **Responsive/mobile**: Tailwind responsive classes pervasive; ergonomics pass partially reflected, but not uniformly enforced in all modules.
- **Design consistency**: partially unified; still mixed legacy local styling in several domains.

## 11. SEO / PWA / platform readiness

- **Metadata**: route-level metadata widely used (`buildPageMetadata` + per-page overrides).
- **Canonical handling**: helper `lib/seo/canonical`, canonical-aligned metadata and JSON-LD observed.
- **Sitemap**: dynamic generation includes worlds/stores/listings/requests.
- **Robots**: generated route with allow/disallow policy.
- **Structured data**: JSON-LD script usage across key pages (`StructuredDataScript`).
- **Manifest**: generated via `manifest.ts`.
- **Offline/PWA**:
  - service worker registration (`ServiceWorkerRegister`)
  - `public/sw.js` cache-first/static + runtime fallback
  - dedicated `/offline` route.
- **Error/loading/not-found**: global + route-specific files are present.
- **Production foundation**: platform-level groundwork exists; backend observability/security hardening not yet integrated.

## 12. Testing and code quality

- **Test runner**: Vitest.
- **Test scope** (observed): service and utility unit tests, selected component tests.
- **Current test inventory**: 5 test files, 32 tests (local run).
- **Lint/type gates**: ESLint + strict TS checks.
- **CI pipeline**: GitHub Actions includes lint -> typecheck -> test/build jobs.
- **Formatting**: dedicated Prettier config/package not обнаружено (not confirmed).

## 13. Security / trust / moderation architecture

Implemented as layered frontend modules:

- **Support layer** (`/support`) for normal user help/tickets.
- **Safety layer** (`/safety`) for abuse/scam reports and safety guides.
- **Verification layer** (`/verification`) for profile/store trust state.
- **Enforcement layer** (`/enforcement`) exposing actions and appeals.
- **Risk layer** (`services/risk`, `components/risk`) adding local risk heuristics and warnings.
- **Moderation internal layer** (`/admin/moderation/*`) for operator workflows with queue/decision/notes.

Связность между слоями в UX присутствует (cross-links and shared notices), но execution/data persistence остаются mock-based.

## 14. Current limitations / technical debt

- Runtime backend integration не обнаружена; домены mostly mock-only.
- In-memory service state can diverge from expected server behavior.
- Styling/design tokens partially unified; local inline styles still significant in some areas.
- README statement about Zustand non-usage is outdated (stores are present).
- No confirmed auth/session backend flow (JWT/cookies/refresh orchestration not found).
- Observability is placeholder (`captureEvent/captureException` facade; external APM/Sentry TODO).
- Limited automated test surface compared to feature breadth.

## 15. Backend integration readiness

### Current readiness level
- **Moderate**: service interfaces + contracts + domain segmentation already support incremental backend replacement.

### What is prepared
- API contract types in `src/api/contracts`.
- Service index entrypoints separating UI from storage implementation.
- Domain entities/types are relatively explicit.

### What still needed
- Introduce HTTP adapters per domain (`services/<domain>/http.ts`) and environment-based binding.
- Define unified API error model + retry semantics.
- Establish auth/session model and secure token handling.
- Introduce server-state cache library (React Query/SWR) for pagination/mutations/invalidation.
- Add integration tests around service boundaries and route-level data behavior.

### Practical next integration steps
1. Start with listings + requests read APIs (highest shared dependency).
2. Add auth + user profile endpoint layer.
3. Replace write-paths (`create listing`, `create request`, `appeals`, `support tickets`).
4. Move moderation queues and verification statuses to persisted backend.

## 16. Recommended next steps

### Short-term (engineering hygiene)
1. Consolidate service wiring (mock vs http) via centralized composition.
2. Update README architecture/state section to reflect actual Zustand usage.
3. Expand unit/integration tests for enforcement/safety/moderation services.

### Mid-term (backend/API readiness)
4. Implement first real API adapters for listings/requests/stores with contract validation.
5. Introduce server-state management library for cache/invalidation and async consistency.
6. Add robust error boundaries and typed API failure UX per domain.

### Pre-production
7. Integrate real monitoring (Sentry/OpenTelemetry vendor) and PII-safe logging.
8. Add auth/session and authorization model beyond demo roles.
9. Hardening pass for trust/safety workflows with persisted audit trails.

### Admin/backoffice readiness
10. Replace moderation mock queue with backend queue endpoints and assignment locking.
11. Add role/permission enforcement from server-side identity claims.
12. Add operational analytics dashboards based on real event stream.

