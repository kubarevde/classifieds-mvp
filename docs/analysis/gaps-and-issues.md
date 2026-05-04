# Пробелы, долги и проблемы

Связанные документы: [project-overview.md](./project-overview.md) · [modules-and-dependencies.md](./modules-and-dependencies.md) · [what-is-implemented.md](./what-is-implemented.md) · [data-layer.md](./data-layer.md) · [configuration-and-security.md](./configuration-and-security.md) · [future-foundation.md](./future-foundation.md)

---

## TODO / FIXME / HACK / XXX (grep по `src/`)

| Файл | Содержание |
|------|------------|
| `src/lib/monitoring.ts` (комментарии ~стр. 7, 24) | **TODO:** подключить Sentry (`captureException`, breadcrumbs, метрики) |

Других совпадений `TODO|FIXME|HACK|XXX` в `src/` **не найдено** автоматическим поиском (код может содержать русские формулировки «позже» без тега — см. архитектурные долги ниже).

---

## Противоречия в документации

| Где | Что |
|-----|-----|
| `README.md` → «State management policy» | Указано, что **Zustand не используется** |
| Код | Активно **`useListingDraftStore`**, **`useAiUsageStore`** в `src/stores/*.ts` с `persist(localStorage)` |
| `docs/PROJECT_STRUCTURE.md` | Уже фиксирует использование Zustand — **согласовать README** с реальностью |

---

## Заглушки и нереализованный бэкенд

- Все доменные **«сервисы»** в рантайме — **моки**; нет `http.ts` / `fetch` к продуктовому API.
- **`src/api/contracts/`** — только типы, без клиента.
- **Мониторинг:** `captureException` / `captureEvent` не отправляют внешние события (см. `monitoring.ts`).

---

## Тестирование

| Пробел |
|--------|
| Нет e2e (Playwright / Cypress) |
| Нет тестов на большинство `src/services/*` (кроме listings + feature-gate) |
| Нет тестов на админ-модерацию, enforcement, billing flows |
| Один UI-тест (`StatTile`) — низкое покрытие компонентов |

**Факт:** `npm run test` — 5 файлов, 32 теста, все проходят. `npm run lint` и `npm run typecheck` — без ошибок на момент аудита.

---

## Архитектурный долг

1. **Двойной доступ к данным:** `src/lib/listings*` + `src/services/listings` — разные пути эволюции.
2. **Крупные god-компоненты** в create-listing, listings page, storefront, store-dashboard.
3. **`entitlements/config.ts`** импортирует типы из UI-слоя — нарушение слоистости.
4. **Нет `middleware.ts`** — нельзя централизованно резать маршруты по cookie/JWT (когда появится бэкенд).
5. **Админ-доступ только клиентский** — небезопасен для production (см. configuration doc).

---

## Потенциальные логические несостыковки

- **Гидрация роли:** на сервере `getServerRoleSnapshot` в demo-role всегда `DEFAULT_DEMO_ROLE`, на клиенте — из `localStorage`; UI должен корректно пережидать `isHydrated` (местами возможны вспышки контента — требует UX-проверки).
- **Mock state vs lib data:** после локальных мутаций листингов возможна рассинхронизация с статическими массивами, если код обновляет только один слой.

---

## Зависимости от внешних сетей

- Шрифты Google через `next/font/google` — требуется доступ при сборке/рантайме по политике Next (стандартная оговорка для air-gapped окружений).

---

## Папки вне исходного аудита «по файлу»

- **`node_modules/`**, **`.next/`** — не разбирались; в git status часто светятся неотслеживаемые артефакты сборки — стоит убедиться, что `.gitignore` покрывает нужное (не проводился отдельный аудит `.gitignore`).
