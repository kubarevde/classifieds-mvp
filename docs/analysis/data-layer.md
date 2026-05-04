# Данные и хранение (data layer)

Связанные документы: [project-overview.md](./project-overview.md) · [modules-and-dependencies.md](./modules-and-dependencies.md) · [what-is-implemented.md](./what-is-implemented.md) · [configuration-and-security.md](./configuration-and-security.md) · [gaps-and-issues.md](./gaps-and-issues.md) · [future-foundation.md](./future-foundation.md)

---

## СУБД и внешние хранилища

| Технология | Использование в проекте |
|------------|------------------------|
| PostgreSQL / MySQL / MongoDB | **Не используются** — нет клиента, ORM, миграций |
| Redis | **Нет** |
| Файловое API-хранилище на сервере | **Нет** (нет upload handler в `src/app/api`) |

---

## «Схема данных» в текущем MVP

Данные живут в:

1. **Статические модули** — массивы и объекты в `src/lib/*.data.ts`, `src/lib/mock-data.ts`, `src/mocks/**`.
2. **In-memory mutable state** внутри `src/services/*/mock.ts` (карты, счётчики, копии сущностей), инициализированные при загрузке модуля.
3. **localStorage (браузер)** — ключи ниже.
4. **sessionStorage** — не используется централизованно (нет отдельного модуля-обёртки в аудите).

### Ключи localStorage (зафиксированные в коде)

| Ключ | Константа / источник | Назначение |
|------|----------------------|------------|
| `classifieds-demo-role` | `STORAGE_KEY` в `demo-role.tsx` | Текущая демо-роль |
| `classifieds-mvp:seller-activity` | `SELLER_ACTIVITY_STORAGE_KEY` в `seller-activity-storage.ts` | Счётчики непрочитанного для продавца |
| `classifieds-mvp:saved-searches` | `SAVED_SEARCHES_STORAGE_KEY` в `saved-searches.ts` | Сохранённые поиски (сериализация в провайдере) |
| `classifieds:listing-draft` | `name` в `persist()` в `listing-draft-store.ts` | Zustand persist: черновик мастера объявления |
| `classifieds:ai-usage` | `name` в `persist()` в `ai-usage-store.ts` | Zustand persist: дневные лимиты AI |

Дополнительные обращения к `localStorage` возможны в других компонентах — полный список: поиск по репозиторию `localStorage`.

---

## Индексы и ограничения

Как у реляционной БД: **нет**. В моках иногда используются `Map` по `id` для O(1) доступа (детали в конкретных `mock.ts`).

---

## Миграции SQL

**Отсутствуют.** Папок вроде `prisma/migrations`, `supabase`, `drizzle` в репозитории нет.

---

## ORM и драйверы

**Нет.**

---

## Кеширование

- **`usePublishedListingsCache`** (`src/hooks/data/use-published-listings-cache.ts`) — клиентский кеш опубликованных листингов (не HTTP-кеш).
- **Service Worker** (`public/sw.js`) — кеш статики/офлайн поведение на уровне браузера (см. also [configuration-and-security.md](./configuration-and-security.md)).

---

## Контракты будущего API

`src/api/contracts/*` задают **типы** сущностей для согласования с бэкендом; не являются источником истины для рантайма приложения сегодня.

---

## Несостыковки и риски данных

- **Два источника правды:** `lib/listings.data` vs состояние после `createListing` в mock-сервисе — при несинхронизации возможны расхождения между страницами (см. [gaps-and-issues.md](./gaps-and-issues.md)).
- **Персистентность ограничена:** перезагрузка сбрасывает большую часть in-memory моков; только часть сценариев выживает в `localStorage`/zustand.
