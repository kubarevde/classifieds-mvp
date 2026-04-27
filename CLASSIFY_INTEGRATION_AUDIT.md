# Classify Integration & Product Logic Audit

## 1. Executive Summary

Проект функционально богатый, но связность между контурами пока **частично фрагментирована**: create/publish, каталог, миры, аукционы и дашборд используют **разные источники истины** и местами разные policy-правила.

Критичные выводы:
- Аукционный lifecycle имеет ошибки (`scheduled` не нормализуется корректно), что ломает бизнес-правдоподобность.
- Create/publish поток не полностью подключён к каталожному read-model (новые объявления/аукционы могут не появляться в фидах).
- Есть расхождения между UI-gate и service-enforcement (часть фич защищена только интерфейсом).
- В мирах есть query contract drift (`filter`, `smartphones`) и навигационная непоследовательность.
- В create auction flow есть продуктовый конфликт: “обычная цена” и “старт аукциона” дублируют смысл.

Общая оценка связности: **6/10**  
(фичи работают отдельно, но E2E-переходы и policy-слой требуют консолидации).

---

## 2. What Was Audited

- Create listing: wizard branching, AI snap-fill, draft hydrate/persist, preview, publish, redirect.
- Worlds: `/worlds`, `/worlds/[slug]`, переходы в каталог, сценарии/чипы, search params, mobile UX.
- Auctions: discoverability, listing filter, auction detail, eligibility/funding/terms, bid rules, create-auction publish, seller dashboard.
- Roles/subscriptions/feature gates: `guest/buyer/seller/all`, `auction_create`, `auction_auto_bid`, AI, saved alerts, store plans.
- State/routing/query: URL parsing/serialization, cross-screen consistency, read/write models.

---

## 3. Core Product Flow Audit

### Flow A: create-listing -> publish -> listing detail
- Работает для просмотра по redirect на `/listings/[id]` через `usePublishedListingStore`.
- Но каталог в основном питается статическими данными, поэтому “после публикации” не всегда соответствует “видно в общем фиде”.

### Flow B: create auction -> auction detail -> bid updates
- Создание аукциона через mock service добавлено.
- Но карточки/дашборд читают `auctionMocks`, а bidding меняет `memoryAuctions`, что создаёт рассинхрон.

### Flow C: worlds -> listings
- В целом связка есть (`world` в query).
- Есть расхождения параметров и id категорий между источниками ссылок и каталогом.

### Flow D: gating/roles/subscriptions
- Гейты в UI реализованы широко.
- На service-уровне не везде есть защитный re-check, поэтому политика частично “визуальная”.

---

## 4. Create Listing Audit

### Findings

1. **[high][product logic] Дублирование цены в auction flow**
- **Где:** `src/components/create-listing/create-listing-schema.ts`, `src/components/create-listing/create-listing-wizard.tsx`
- **Проявление:** в auction режиме пользователь проходит шаг “Описание и цена”, а затем отдельно задаёт “Стартовую цену” аукциона.
- **Почему проблема:** две “главные цены” для одной сущности.
- **Ломает flow:** снижает ясность и повышает шанс inconsistent preview/publish.
- **Fix:** сделать для auction на шаге 2 цену необязательной (или скрыть), канонизировать monetary source в auction settings.

2. **[medium][state] Draft step сохраняется, но не восстанавливается**
- **Где:** `create-listing-wizard.tsx` (persist хранит `step`, hydrate делает `setStep(0)`).
- **Проявление:** пользователь возвращается в начало независимо от сохранённого шага.
- **Fix:** `setStep(clamp(draft.step, 0, dynamicStepLabels.length-1))`.

3. **[medium][product logic] AI category mapping не унифицирован**
- **Где:** `services/ai/listing-assistant.ts`, `lib/listings.data.ts`, wizard `setValue("category", ...)`.
- **Проявление:** AI может подставить category id, не существующий в текущем world-options.
- **Fix:** нормализатор AI category -> canonical category per world перед записью в форму.

4. **[high][gating] Auction create проверяется в UI, но недостаточно на service contract**
- **Где:** `create-listing-wizard.tsx`, `services/auctions/mock.ts`
- **Проявление:** при форсированном `saleMode=auction` возможен create без жёсткого authorizer в сервисе.
- **Fix:** добавить explicit authorization проверку на publish path и в `createAuction`.

---

## 5. Worlds Audit

### Findings

1. **[high][routing] Неверный category id в home->listings deep link (electronics)**
- **Где:** `src/components/home/categories-grid.tsx`
- **Проявление:** `category=smartphones`, но каталог ждёт `phones`.
- **Fix:** заменить на canonical id + shared mapper.

2. **[high][routing] Home quick filters используют `filter=...`, который каталог не парсит**
- **Где:** `src/app/page.tsx`, `src/lib/saved-searches.ts`
- **Проявление:** пользователь кликает quick filter, но эффект отсутствует.
- **Fix:** конвертировать в `q`, `saleMode`, `sort`, etc. или добавить parse `filter`.

3. **[high][ux flow] Mobile/Desktop несогласованная навигация в “Миры”**
- **Где:** `src/components/layout/navbar.tsx`, `src/components/layout/mobile-menu.tsx`
- **Проявление:** desktop -> `/worlds`, mobile -> `/#worlds`.
- **Fix:** единая canonical destination.

4. **[medium][routing] “Назад в каталог” из detail теряет world/query context**
- **Где:** `src/components/listings/listing-details-page-client.tsx`
- **Fix:** сохранить return url/query или `router.back()` with fallback.

5. **[medium][state] World page filters не URL-backed**
- **Где:** `src/components/worlds/world-page-client.tsx`
- **Проявление:** нельзя поделиться/восстановить state после refresh.
- **Fix:** URL sync как в listings page.

---

## 6. Auctions Audit

### Findings

1. **[critical][product logic] Scheduled lifecycle broken**
- **Где:** `src/services/auctions/mock.ts` (`normalizeStatus`)
- **Проявление:** scheduled может не перейти в live и/или принимать ставки не в нужный момент.
- **Fix:** derive status from `startAt` + `endAt`; bidding only for `live/ending_soon`.

2. **[critical][product logic] Proxy winner/status inconsistency**
- **Где:** `src/services/auctions/mock.ts`, `src/services/auctions/rules.ts`
- **Проявление:** winner по max bid может расходиться со status финализацией “последний по времени”.
- **Fix:** синхронизировать winner resolution и bid statuses, материализовать counter-bids или хранить proxy outcome отдельно.

3. **[high][state] Разные источники истины аукционов**
- **Где:** reads в `listings-grid.tsx`, `listing-details-page-client.tsx`, `StoreListingsSection.tsx`; writes в `mockAuctionService`.
- **Проявление:** bid state в detail не совпадает с catalog/dashboard.
- **Fix:** читать аукционы через service/store hook везде.

4. **[high][state] Новые аукционы/листинги не гарантированно попадают в каталог**
- **Где:** create publish path vs static listings sources in `lib/listings.data.ts`.
- **Fix:** единый live listing repository (хотя бы mock-store adapter).

5. **[high][product logic] Bid increment UI/validation mismatch**
- **Где:** `AuctionDetailPanel.tsx` + rules.
- **Проявление:** UI step/hints могут не совпадать с service validation (особенно при custom increment).
- **Fix:** в panel использовать `getBidIncrement(currentBid, minBidIncrement)` для всех вычислений и `input.step`.

6. **[medium][ux] Auction detail смешивает fixed-price и bid-price смысл**
- **Где:** `listing-details.tsx` + `AuctionDetailPanel`.
- **Fix:** auction-aware detail variant.

---

## 7. Roles / Feature Gates / Subscription Audit

### Findings

1. **[high][gating] `saved_searches_alerts` gate определён, но фактически не enforced**
- **Где:** `services/feature-gate/mock.ts`, `saved-searches` UI/provider, `services/buyer/mock.ts`
- **Проявление:** alerts можно включать без Pro.
- **Fix:** gate in UI + service mutation guard.

2. **[medium-high][gating] Promotion/boost partly UI-gated only**
- **Где:** create listing / marketing UI vs buyer service mutate methods.
- **Fix:** defense-in-depth в сервисных методах.

3. **[medium][product logic] Несогласованность тарифной матрицы и growth policy**
- **Где:** `store-dashboard-shared.tsx` (`growthToolAccessRows` vs `tariffRows`)
- **Проявление:** coupon access противоречит себе.
- **Fix:** единая policy таблица.

4. **[medium][ux flow] Текст о boost не соответствует gate policy**
- **Где:** `StoreListingsSection.tsx` copy vs feature gate logic.

5. **[high][hypothesis #2 answer] Почему у частника с PRO toggle может не работать auction create**
- **Ответ:** это не “поломка”, а **текущая role-policy**: `auction_create` доступен для `seller|all` + store `pro+`, а не для buyer-only role.  
- **Где:** `services/feature-gate/mock.ts`, `subscription-provider.tsx`.
- **Проблема:** UX копия местами звучит как “Pro = достаточно”, без role qualifier.

---

## 8. State / Routing / Query Param Audit

### Findings

1. **[high][routing] Query contract drift (`filter`, invalid category ids)**
- producers и consumers параметров не полностью согласованы.

2. **[medium][state] URL encoding стратегии различаются**
- manual `encodeURIComponent` + URLSearchParams создают неоднородные URL.

3. **[high][state] Publish write model != catalog read model**
- ключевой интеграционный разрыв продукта.

4. **[medium][routing] world/listing/detail переходы теряют контекст**
- нет сквозного сохранения origin query.

---

## 9. Architecture Drift and Duplication

- SaleMode/gating policy размазаны по UI effects, schema, service.
- Category semantics дублируются в нескольких vocabularies (AI, create, catalog, dashboard).
- Auctions используют одновременно:
  - mutable service memory,
  - exported mocks array,
  - listing-bound static datasets.
- Store plan access описан в нескольких местах (gate service, dashboard tables, marketing workspace checks).

Архитектурный риск: дальнейшие фичи будут усиливать divergence без “Policy Core + Unified Data Read Model”.

---

## 10. Top Bugs / Contradictions

1. `scheduled` аукционы неправильно нормализуются и lifecycle может ломаться.  
2. Proxy winner логика не согласована со статусами ставок.  
3. Catalog/detail/dashboard читают аукционы из разных источников.  
4. Публикация listing не гарантирует появление в каталоге.  
5. Home quick filter использует неподдерживаемый query param `filter`.  
6. Home electronics deep link использует `smartphones` вместо `phones`.  
7. Mobile и desktop ведут в разные “Миры” entry points.  
8. “Назад в каталог” теряет world/filter context.  
9. Auction create gate защищён в UI, но должен дублироваться на service boundary.  
10. Saved-search alerts gate задекларирован, но не enforced.  
11. Boost/coupon доступ в дашборде противоречив в разных таблицах/сообщениях.  
12. Auction flow дублирует цену (fixed-like + auction start).  
13. Draft step не восстанавливается фактически.  
14. AI category mapping может попадать в невалидные world category ids.  
15. Auction detail смешивает fixed price и current bid как равноправные “главные” значения.

---

## 11. Product Flow Connectivity Map

```mermaid
flowchart LR
  A[Create Listing Wizard] --> B[Publish Handler]
  B --> C[Published Listing Store]
  B --> D[Buyer Local State]
  B --> E[AuctionService.createAuction]

  C --> F[Listing Detail /listings/[id]]
  E --> F

  G[Catalog /listings] --> H[Static unifiedCatalogListings]
  H -.weak link.-> B
  G --> I[AuctionCard join by listingId]
  I -.reads direct mocks.-> J[auctionMocks]
  E --> J
  E --> K[memoryAuctions]
  F --> K
  G -.not using service uniformly.-> J

  L[/worlds and /worlds/[slug]] --> G
  L -.query contract drift.-> G

  M[FeatureGate Service] --> A
  M --> F
  M --> N[Store Dashboard]
  N --> J
```

Связность:
- **Сильная:** wizard -> detail redirect.  
- **Средняя:** worlds -> listings.  
- **Слабая/рисковая:** publish -> catalog/discovery, auctions read-model consistency, unified gating enforcement.

---

## 12. Priority Fix Plan

### P0 (срочно)
1. Исправить auction lifecycle/status machine (`startAt`/`endAt`, bidding guard).
2. Выстроить единый источник аукционных данных для всех UI поверхностей.
3. Закрыть service-level authorization на createAuction и paid actions.
4. Починить query contract drift (`filter`, `smartphones`).

### P1 (следом)
1. Убрать дублирование цены в auction create flow.
2. Восстановление draft step + world filter URL sync.
3. Enforce `saved_searches_alerts`.
4. Привести tariff/growth/promo copy к единой policy.

### P2 (рефактор)
1. Canonical category mapper (AI/create/catalog/dashboard).
2. Unified entitlements registry (single source for plans/features/copy).
3. Listing/Auction repository abstraction для mock-first и будущего backend.

---

## 13. What Must Be Fixed Before Next Feature

1. Auction lifecycle correctness (иначе любые новые auction-фичи будут на сломанной основе).
2. Publish discoverability gap (иначе пользовательский цикл “создал -> увидел в продукте” недостоверен).
3. Source-of-truth консолидация аукционов (иначе UI противоречит сам себе).
4. Service-side gate enforcement для критичных операций.
5. Query contract унификация между home/worlds/listings.

---

## 14. What Can Wait

- Улучшение мобильного UX preview mode/chat scroll lock.
- Расширение тестовой матрицы на визуальные и e2e сценарии.
- Более глубокий архитектурный cleanup copy/labels, если P0/P1 уже закрыты.

---

## Answers to Required Hypotheses

1. **Почему цена до “Настройки аукциона”?**  
   Сейчас это продуктово спорно и создает дублирование смыслов. Для auction лучше канонизировать цену в auction-settings и ослабить/убрать обычную цену на шаге описания.

2. **Почему у частника даже с PRO-toggle может не работать auction create?**  
   Потому что `auction_create` завязан не только на план, но и на роль (`seller|all`) + store plan `pro+`. Это policy-design + UX copy ambiguity, не только баг.

3. **Насколько create -> publish -> listings -> detail -> dashboard связан для auction?**  
   Частично: detail после redirect работает, но discoverability в catalog/dashboard не полностью консистентна из-за раздельных read-model и auction source.

4. **Миры и каталог единый продукт?**  
   Частично. Архитектурно связаны, но query contract и navigation consistency пока разъезжаются в ключевых точках.

5. **Есть ли дублирование/рассинхрон правил между wizard/listings/auction/gates/dashboard?**  
   Да, выраженное: saleMode semantics, category vocab, gating policies и auction data source описаны в нескольких местах по-разному.
