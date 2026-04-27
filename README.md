# Classifieds MVP (Classify)

[![CI](https://github.com/kubarevde/classifieds-mvp/actions/workflows/ci.yml/badge.svg)](https://github.com/kubarevde/classifieds-mvp/actions/workflows/ci.yml)

**Classify** — демо-маркетплейс объявлений и витрин магазинов: единый каталог по «мирам», дашборд продавца, подписки и feature-gates на мок-данных. Проект нацелен на быстрый UX-прототип и последующую замену сервисного слоя реальным API.

## Запуск

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

### Скрипты

| Команда | Назначение |
|--------|------------|
| `npm run dev` | Dev-сервер Next.js |
| `npm run build` | Production-сборка |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest |

### Demo roles

В корневом layout включён **`DemoRoleProvider`** и плавающий переключатель **`DemoRoleFloatingControl`** (правый нижний угол). Роли: **Всё вместе**, **Гость**, **Покупатель**, **Продавец / Магазин** — влияют на доступ к страницам (`DemoRoleGuard`), тарифы магазина в подписке и проверки `FeatureGate`. Выбранная роль сохраняется в `localStorage` (`classifieds-demo-role`).

## Структура проекта

| Область | Путь | Назначение |
|--------|------|------------|
| **Entities** | `src/entities/*` | Доменные типы и модели (billing, seller, marketing) без UI. |
| **Features** | `src/app/*`, `src/components/<домен>` | Фичи оформлены как маршруты App Router и колокейт-компоненты (листинги, дашборд, stores и т.д.). Отдельного каталога `src/features/` пока нет. |
| **Services** | `src/services/*` | Контракты + **mock**-реализации (`listings`, `feature-gate`, `buyer`, `marketing`, `sellers`). Точка замены на HTTP-клиенты — см. `ARCHITECTURE.md`. |
| **Stores (витрины)** | `src/app/stores`, `src/components/stores` | UI каталога магазинов; не путать с глобальным state management. |
| **Platform UI** | `src/components/platform` | Переиспользуемые композиты: `PageShell`, `SectionCard`, `StatTile`, `EmptyState`, `InlineNotice`, `Toolbar`, `FeatureGate` / `UpgradeBanner`. |

Подробнее о слоях и эволюции — в **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

## State management policy

- **React Context** — кросс-резовый демо- и продукт-состояние: роль (`DemoRoleProvider`), подписка/тариф магазина (`SubscriptionProvider`), сценарии покупателя и сервис покупателя (`BuyerProvider`). Подходит для провайдеров, которые редко меняются и оборачивают дерево layout.
- **Zustand** — в текущем MVP **не используется**. Имеет смысл при появлении изолированного клиентского state (мастера, многошаговые формы, тяжёлые списки) без прокидывания через глобальные провайдеры.
- **Services** — не «стейт», а **асинхронный доступ к данным** (листинги, гейты, маркетинг). Компоненты и провайдеры вызывают сервисы или получают их через контекст; моки держат данные в памяти модуля.

## Demo mode и переключение роли

- **Demo mode**: все данные локальные (моки), без бэкенда; поведение тарифов и лимитов задаётся `createMockFeatureGateService` и `SubscriptionProvider`.
- **Role switch**: `DemoRoleFloatingControl` в UI; значение читается через `useDemoRole()` (`role`, `currentSellerId`, `setRole`).

## Документация

- [ARCHITECTURE.md](./ARCHITECTURE.md) — текущая и целевая архитектура, гайды по фичам и сервисам.

## Deploy

Стандартный деплой — [Vercel](https://vercel.com) или любой хостинг с Node для `next start` после `npm run build`.
