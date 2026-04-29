# Project Structure Map

## 1. Root files

| File | Purpose |
|---|---|
| `package.json` | Scripts (`dev/build/start/lint/typecheck/test`), dependencies and devDependencies. |
| `package-lock.json` | npm lockfile (package manager confirmation: npm). |
| `next.config.ts` | Next config (Turbopack root configured). |
| `tsconfig.json` | TypeScript strict config, alias `@/* -> src/*`. |
| `eslint.config.mjs` | ESLint setup with Next core-web-vitals + TypeScript config; includes hook-specific rule override. |
| `postcss.config.mjs` | Tailwind v4 PostCSS plugin wiring. |
| `vitest.config.ts` | Vitest configuration and alias setup. |
| `vitest.setup.ts` | Vitest setup entry. |
| `.github/workflows/ci.yml` | CI pipeline for lint, typecheck, test, build. |
| `next-env.d.ts` | Next.js TypeScript environment types. |
| `src/app/globals.css` | Tailwind import and global CSS/focus defaults. |
| `public/sw.js` | Service worker script for offline/static/runtime caching. |
| `src/app/manifest.ts` | PWA manifest metadata route. |
| `src/app/robots.ts` | Robots rules route. |
| `src/app/sitemap.ts` | Sitemap generation route. |

Observations:
- `middleware.ts` not found.
- `tailwind.config.*` not found (Tailwind v4 style via `@import "tailwindcss"`).
- `.env*` files not found in repository root.

## 2. Source tree overview

```text
src/
  app/                        # App Router routes + app-level platform files
    admin/moderation/         # Internal moderation console pages
    enforcement/              # User-facing enforcement/appeals hub
    verification/             # Verification hub and step pages
    safety/                   # Safety hub and report flows
    support/                  # Help center and tickets
    listings/ requests/ stores/ worlds/ dashboard/ ...
    layout.tsx                # Global providers + app shell + SW register
    page.tsx                  # Homepage
    robots.ts sitemap.ts manifest.ts
    error.tsx not-found.tsx

  components/
    ui/                       # Shared UI primitives (button/card/badge/toast/section-header)
    platform/                 # App shells, gates, notices, section wrappers
    listings/ requests/ stores/ sellers/ dashboard/
    support/ safety/ verification/ enforcement/ risk/
    moderation/ admin/        # Internal backoffice UI
    store-dashboard/          # Seller store backoffice sections
    home/                     # Homepage section components
    seo/                      # Structured-data helpers/components

  services/                   # Domain service layer (mostly mock-backed)
    listings/ requests/ stores/ sellers/ marketing/
    verification/ enforcement/ risk/ moderation/
    support/ safety/ trust/ analytics/ billing/
    auth/ feature-gate/ buyer/ search-intent/ auctions/ ...

  stores/                     # Zustand stores (client-persisted domain/UI state)
    listing-draft-store.ts
    ai-usage-store.ts

  entities/                   # Domain entities/types
    ai/ analytics/ auction/ billing/ marketing/ requests/ search/ seller/ trust/

  lib/                        # Shared domain logic, data helpers, SEO, monitoring
    seo/ support/ safety/ observability/ navigation/ ...

  api/contracts/              # Typed API contracts (DTO-level) for future backend
```

## 3. Route inventory

| Route | Purpose | Key files |
|---|---|---|
| `/` | Homepage/discovery entry | `src/app/page.tsx` |
| `/listings` | Catalog listing search/filter | `src/app/listings/page.tsx`, `src/components/listings/listings-page-root.tsx` |
| `/listings/[id]` | Listing detail | `src/app/listings/[id]/page.tsx`, `listing-details-page-client.tsx` |
| `/create-listing` | Listing creation wizard | `src/app/create-listing/page.tsx`, `create-listing-wizard.tsx` |
| `/requests` | Requests board (reverse marketplace) | `src/app/requests/page.tsx`, `RequestsBoardClient.tsx` |
| `/requests/[id]` | Request details and responses | `src/app/requests/[id]/page.tsx`, `RequestDetailsClient.tsx` |
| `/requests/new` | New request form | `src/app/requests/new/page.tsx`, `NewRequestPageClient.tsx` |
| `/stores` | Stores catalog | `src/app/stores/page.tsx`, `StoresPageClient.tsx` |
| `/stores/[slug]` | Storefront detail | `src/app/stores/[slug]/page.tsx`, `storefront-page-client.tsx` |
| `/sellers/[id]` | Legacy storefront URL redirect | `src/app/sellers/[id]/page.tsx` |
| `/worlds`, `/worlds/[slug]` | World-based discovery contexts | `src/app/worlds/*` |
| `/dashboard` | Buyer/seller personal cabinet | `src/app/dashboard/page.tsx`, `dashboard-page-client.tsx` |
| `/dashboard/store` | Store backoffice | `src/app/dashboard/store/page.tsx`, `store-dashboard-page-client.tsx` |
| `/support` | Help center | `src/app/support/page.tsx` |
| `/support/[category]` | Help category page | `src/app/support/[category]/page.tsx` |
| `/support/[category]/[slug]` | Help article | `src/app/support/[category]/[slug]/page.tsx` |
| `/support/tickets` | User support tickets | `src/app/support/tickets/page.tsx` |
| `/support/tickets/new` | New support ticket | `src/app/support/tickets/new/page.tsx` |
| `/support/tickets/[id]` | Ticket detail thread | `src/app/support/tickets/[id]/page.tsx` |
| `/safety` | Safety hub | `src/app/safety/page.tsx` |
| `/safety/reports` | User reports list | `src/app/safety/reports/page.tsx` |
| `/safety/reports/new` | New safety report | `src/app/safety/reports/new/page.tsx` |
| `/safety/reports/[id]` | Safety report detail | `src/app/safety/reports/[id]/page.tsx` |
| `/safety/guide/[slug]` | Safety guide article | `src/app/safety/guide/[slug]/page.tsx` |
| `/verification` | Verification hub | `src/app/verification/page.tsx`, `VerificationHubClient.tsx` |
| `/verification/identity` | Identity verification flow | `src/app/verification/identity/page.tsx` |
| `/verification/business` | Business/store verification flow | `src/app/verification/business/page.tsx` |
| `/verification/status` | Verification status page | `src/app/verification/status/page.tsx` |
| `/verification/dev` | Dev-only verification panel | `src/app/verification/dev/page.tsx` |
| `/enforcement` | Enforcement + appeals hub | `src/app/enforcement/page.tsx`, `EnforcementHubClient.tsx` |
| `/enforcement/actions` | Enforcement actions list | `src/app/enforcement/actions/page.tsx` |
| `/enforcement/actions/[id]` | Enforcement action detail | `src/app/enforcement/actions/[id]/page.tsx` |
| `/enforcement/appeals` | Appeals list | `src/app/enforcement/appeals/page.tsx` |
| `/enforcement/appeals/new` | New appeal form | `src/app/enforcement/appeals/new/page.tsx` |
| `/enforcement/appeals/[id]` | Appeal detail | `src/app/enforcement/appeals/[id]/page.tsx` |
| `/admin/moderation` | Moderation overview | `src/app/admin/moderation/page.tsx` |
| `/admin/moderation/reports` + `[id]` | Reports queue + case detail | `src/app/admin/moderation/reports/*` |
| `/admin/moderation/verification` + `[id]` | Verification queue + case detail | `src/app/admin/moderation/verification/*` |
| `/admin/moderation/appeals` + `[id]` | Appeals queue + case detail | `src/app/admin/moderation/appeals/*` |
| `/admin/moderation/enforcement` + `[id]` | Enforcement queue + case detail | `src/app/admin/moderation/enforcement/*` |
| `/offline` | Offline fallback page | `src/app/offline/page.tsx` |

Platform files:
- app-level: `src/app/layout.tsx`, `error.tsx`, `not-found.tsx`
- scoped loading/error files exist for multiple route groups (`listings`, `requests`, `stores`, `dashboard`, `sponsor-board`).

## 4. Components inventory

### Listings
- Scope: catalog/search/filter cards, listing details, seller card, create AI wizard integration.
- Entry files: `listings-page-client.tsx`, `listing-preview-card.tsx`, `listing-details-page-client.tsx`, `filters-bar.tsx`.

### Requests
- Scope: request board, detail view, create form, seller response composer, response list.
- Entry files: `RequestsBoardClient.tsx`, `RequestCard.tsx`, `RequestDetailsClient.tsx`, `RequestCreateForm.tsx`.

### Sellers / Stores
- Scope: storefront, store catalog, recommendations and filters.
- Entry files: `sellers/storefront-page-client.tsx`, `stores/stores-page-client.tsx`, `stores/store-card.tsx`, `stores/store-filters-bar.tsx`.

### Dashboard
- Scope: buyer/seller personal cabinet blocks and store cabinet links.
- Entry files: `dashboard-page-client.tsx`, `my-listings-section.tsx`, `my-requests-section.tsx`.

### Verification
- Scope: verification cards, badges, prompts, checklist/status components.
- Entry files: `VerificationTierCard.tsx`, `VerificationStatusCard.tsx`, `VerificationBadge.tsx`.

### Enforcement
- Scope: action cards, status badges, appeal form/timeline.
- Entry files: `EnforcementActionCard.tsx`, `AppealForm.tsx`, `AppealTimeline.tsx`.

### Risk
- Scope: risk warnings and transaction safety checklist.
- Entry files: `RiskIndicator.tsx`, `RiskWarningBanner.tsx`, `TransactionSafetyChecklist.tsx`.

### Moderation (internal)
- Scope: queue cards, decision bar, notes, timeline, review panels, access shell.
- Entry files: `ModerationShell.tsx`, `ModerationQueueCard.tsx`, `ModerationDecisionBar.tsx`, `ReviewerNotesPanel.tsx`.

### Admin shared internal
- Scope: list/detail shells and URL filter helper used by moderation pages.
- Entry files: `AdminListPageShell.tsx`, `AdminDetailPageShell.tsx`, `useAdminUrlFilters.ts`.

### Shared UI
- Scope: button/card/badge/container/toast/section-header primitives.
- Entry files: `src/components/ui/index.ts`, `button.tsx`, `card.tsx`, `section-header.tsx`.

## 5. Services inventory

| Service domain | Purpose | Key files | API readiness |
|---|---|---|---|
| `listings` | Listing CRUD + filters | `types.ts`, `mock.ts`, `index.ts` | Interface-based, currently mock runtime |
| `requests` | Request board + responses + matching | `types.ts`, `matching.ts`, `mock.ts`, `index.ts` | Interface-based, mock runtime |
| `stores` | Store conversations/notifications and catalog relations | `types.ts`, `mock.ts`, `index.ts` | Partially contract-driven, mock runtime |
| `sellers` | Storefront and seller dashboard bundle | `index.ts`, `mock.ts`, `seller-data.ts` | Interface defined, explicit future `http.ts` note |
| `marketing` | Campaigns/coupons/analytics snapshots | `index.ts`, `mock.ts`, `marketing-data.ts` | Interface defined, future `http.ts` note |
| `verification` | Verification profile/start/step/status helpers | `types.ts`, `mock.ts`, `index.ts` | Mock implementation; dev force helper |
| `enforcement` | Actions + appeals flow | `types.ts`, `mock.ts`, `index.ts` | Mock-backed service contract |
| `risk` | Risk rules and checklist | `types.ts`, `rules.ts`, `mock.ts`, `index.ts` | Rule engine local; no external backend |
| `moderation` | Internal moderation queue and decisions | `types.ts`, `mock.ts`, `access.ts`, `index.ts` | Mock-only operational backend |
| `support` | Help content + tickets | `types.ts`, `mock.ts`, `index.ts` | Mock-only |
| `safety` | Reports and safety guides | `types.ts`, `mock.ts`, `index.ts` | Mock-only |
| `trust` | Trust score/feedback helpers | `index.ts`, `mock.ts` | Mock-only |
| `analytics` | Store analytics facade | `index.ts`, `mock.ts`, `insights.ts` | Mock-only |
| `billing` | Subscription/billing simulation | `index.ts`, `mock.ts` | Mock-only |
| `feature-gate` | Plan/limit access decisions | `index.ts`, `mock.ts` | Mock service + interface |
| `auth` | Demo auth identity layer | `types.ts`, `mock.ts`, `index.ts` | Mock-only |
| `auctions` | Auction rules + state ops | `index.ts`, `mock.ts`, `rules.ts` | Mock runtime with typed API |
| `search-intent` | Search intent parsing/adaptation | `types.ts`, `mock.ts`, `index.ts` | Mock implementation |
| `saved-searches` | Saved search persistence/matches | `types.ts`, `mock.ts`, `index.ts` | Mock-backed |
| `buyer` | Buyer service + contracts | `types.ts`, `contracts.ts`, `mock.ts`, `index.ts` | Mock implementation with explicit contracts |

## 6. Stores inventory

| Store | Responsibility | Where used | State type |
|---|---|---|---|
| `useListingDraftStore` (`listing-draft-store.ts`) | Persistent listing wizard draft, photos, promotion/auction fields | `create-listing-wizard.tsx` | Domain + UI persisted client state |
| `useAiUsageStore` (`ai-usage-store.ts`) | Daily AI usage counters and limit checks | `create-listing-wizard.tsx`, `use-listing-ai-actions.ts` | Domain usage tracking (client persisted) |

Note: despite previous docs claiming no Zustand usage, these two stores are active in current codebase.

## 7. Technical hotspots

Critical hubs a new engineer should identify early:

1. **`src/app/layout.tsx`**  
   Root providers, app shell, toast, demo role, service worker registration.

2. **`src/components/create-listing/create-listing-wizard.tsx`**  
   Largest multi-step flow; integrates services, stores, AI limits, promotion, auction rules.

3. **`src/components/listings/listings-page-client.tsx`**  
   Major discovery orchestration point for listings + store search mode.

4. **`src/components/sellers/storefront-page-client.tsx`**  
   Large storefront composition with catalog and marketing/trust sections.

5. **`src/components/store-dashboard/store-dashboard-page-client.tsx` + `sections/*`**  
   Seller backoffice center; many business modules intersect here.

6. **`src/services/*/index.ts` pattern**  
   Main seam for replacing mock services with backend adapters.

7. **`src/app/admin/moderation/*` + `src/services/moderation/*`**  
   Internal trust/safety operations flow; high business sensitivity.

8. **`src/api/contracts/*`**  
   Existing API contract layer useful for backend handshake.

Potentially risky/complex zones:
- Large client-heavy pages with mixed UI+business logic.
- Mock persistence in module scope/localStorage (can diverge from real backend semantics).
- Partial design-system migration: both tokenized and inline styles coexist.

## 8. Suggested onboarding order

Recommended reading path for a new developer:

1. **Project and tooling baseline**
   - `package.json`
   - `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `vitest.config.ts`
   - `.github/workflows/ci.yml`

2. **App shell and platform runtime**
   - `src/app/layout.tsx`
   - `src/components/platform/app-providers.tsx`
   - `src/components/platform/app-shell.tsx`
   - `src/components/platform/service-worker-register.tsx`
   - `src/app/manifest.ts`, `robots.ts`, `sitemap.ts`

3. **Shared UI and style tokens**
   - `src/components/ui/*`
   - `src/lib/button-styles.ts`
   - `src/app/globals.css`

4. **Core product domains (user-facing)**
   - Listings: `src/app/listings/*`, `src/components/listings/*`
   - Requests: `src/app/requests/*`, `src/components/requests/*`
   - Stores/Storefront: `src/app/stores/*`, `src/components/stores/*`, `src/components/sellers/*`
   - Dashboard: `src/app/dashboard/*`, `src/components/dashboard/*`, `src/components/store-dashboard/*`

5. **Trust & safety domains**
   - Support: `src/app/support/*`, `src/components/support/*`
   - Safety: `src/app/safety/*`, `src/components/safety/*`
   - Verification: `src/app/verification/*`, `src/components/verification/*`
   - Enforcement: `src/app/enforcement/*`, `src/components/enforcement/*`
   - Risk: `src/components/risk/*`, `src/services/risk/*`

6. **Internal operations**
   - Moderation/admin: `src/app/admin/moderation/*`, `src/components/moderation/*`, `src/components/admin/*`

7. **Service and data boundaries**
   - `src/services/*` domain by domain
   - `src/api/contracts/*`
   - `src/entities/*`

8. **State and client data hooks**
   - `src/stores/*`
   - `src/hooks/data/*`

9. **Testing and validation**
   - `src/**/__tests__/*`
   - `src/**/*.test.ts(x)`

