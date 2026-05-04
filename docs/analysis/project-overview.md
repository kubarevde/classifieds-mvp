# Обзор проекта (архитектурный аудит)

**Серия документов:** этот файл — точка входа. См. также:
- [Карта модулей и зависимостей](./modules-and-dependencies.md)
- [Реализованный функционал](./what-is-implemented.md)
- [Данные и хранение](./data-layer.md)
- [Конфигурация и безопасность](./configuration-and-security.md)
- [Пробелы и проблемы](./gaps-and-issues.md)
- [Фундамент для развития](./future-foundation.md)

---

## Название

| Источник | Значение |
|----------|----------|
| `package.json` → `name` | `classifieds-mvp` |
| `package.json` → `version` | `0.1.0` |
| Продуктовое имя в UI / metadata | **Classify** (см. `README.md`, `src/app/layout.tsx` → `metadata.applicationName`) |

## Назначение

**Classify** — демонстрационный фронтенд маркетплейса объявлений и витрин магазинов: каталог, «миры» (контексты discovery), обратные запросы (requests), кабинеты покупателя/продавца, модерация, верификация, безопасность, поддержка, подписки и промо — на **мок-данных в браузере**, без подключённого бэкенда. Цель репозитория: быстрый UX-прототип и последующая замена сервисного слоя реальным API (см. `README.md`, `ARCHITECTURE.md`).

## Тип проекта

**Одностраничное веб-приложение (SSR/SSG/RSC)** на базе **Next.js App Router**: страницы в `src/app/*`, интерактивные клиентские острова (`"use client"`), без отдельного REST/GraphQL сервера в репозитории (нет `src/app/api/**`).

## Стек технологий

### Языки и рантайм
- **TypeScript** (строгий режим, см. `tsconfig.json`)
- **Node.js** 20 (CI в `.github/workflows/ci.yml`)

### Фреймворк и UI
- **Next.js** `16.2.4`
- **React** `19.2.4`, **React DOM** `19.2.4`
- **Tailwind CSS** v4 (`postcss.config.mjs`, `@tailwindcss/postcss`, глобальные стили `src/app/globals.css`)
- Шрифты **Geist** / **Geist Mono** (`next/font/google` в `layout.tsx`)

### Формы, валидация, UI-паттерны
- **react-hook-form** `^7.74.0`
- **@hookform/resolvers** `^5.2.2`
- **zod** `^4.3.6`
- **class-variance-authority**, **clsx**
- **lucide-react** (иконки)
- **recharts** (графики аналитики/админки)
- **react-markdown**

### Клиентское состояние
- **React Context** — демо-роль, подписка, покупатель, сохранённые поиски и др.
- **Zustand** `^5.0.12` — в зависимостях; фактически используются сторы в `src/stores/` (черновик объявления, лимиты AI) — см. раздел «Несостыковки» в [gaps-and-issues.md](./gaps-and-issues.md) относительно `README.md`.

### Инструменты разработки
- **ESLint** 9 + **eslint-config-next** 16.2.4 (`eslint.config.mjs`)
- **Vitest** 4 + **@vitejs/plugin-react**, **jsdom**, **@testing-library/react** / **@testing-library/jest-dom**
- Сборщик: встроенный Next (Turbopack root в `next.config.ts`)

### Данные и инфраструктура
- **СУБД в репозитории отсутствует** (нет Prisma/Drizzle/Knex, нет миграций SQL). Подробнее: [data-layer.md](./data-layer.md).
- **Нет** Redis, брокеров, Kubernetes-манифестов в дереве исходников.
- **PWA-часть:** `public/sw.js`, регистрация в `ServiceWorkerRegister`, манифест `src/app/manifest.ts`.

### Документация в репозитории (вне `docs/analysis/`)
- `README.md`, `ARCHITECTURE.md`, `AGENTS.md`, `DASHBOARD_REFACTOR.md`, `CLASSIFY_INTEGRATION_AUDIT.md`
- `docs/PROJECT_STRUCTURE.md`, `docs/TECHNICAL_OVERVIEW.md`, `docs/prelaunch-checklist.md`

## Структура директорий верхнего уровня

| Путь | Содержание |
|------|------------|
| `src/app/` | Маршруты App Router (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`), SEO-маршруты `robots.ts`, `sitemap.ts`, клиентская инструментация `instrumentation-client.ts` |
| `src/components/` | Доменные и платформенные React-компоненты (подпапки по области: `listings`, `admin`, `store-dashboard`, `platform`, `ui`, …) |
| `src/services/` | Контракты и **mock**-реализации доменных сервисов (листинги, модерация, биллинг и т.д.) |
| `src/lib/` | Утилиты, фильтры, SEO, мок-данные, админ-доступ, localStorage-обёртки |
| `src/entities/` | Доменные типы без React (billing, seller, marketing, …) |
| `src/api/contracts/` | Типизированные DTO/контракты для **будущего** HTTP API (не runtime-сервер) |
| `src/mocks/` | Вспомогательные статические моки (биллинг, аукционы, trust, …) |
| `src/stores/` | Zustand: черновик объявления, учёт использования AI |
| `src/hooks/` | Общие хуки и `hooks/data/*` для данных |
| `src/config/` | `admin-routes.ts`, `icons.ts` |
| `public/` | PWA service worker, иконки, статические SVG |
| `.github/workflows/` | CI: lint → typecheck → build; test параллельно с build |
| `docs/` | Прочая документация + **эта папка `docs/analysis/`** |

**Исключено из детального перечисления файлов в аудите:** `node_modules/`, артефакты `.next/` (сборка), бинарные lock-файлы построчно. Исходники приложения: порядка **~600** файлов `.ts`/`.tsx`/`.json` в рабочем дереве (оценка по индексации IDE); полный перечень маршрутов и горячих точек см. `docs/PROJECT_STRUCTURE.md`.

## Сборка и команды

| Команда | Назначение |
|---------|------------|
| `npm install` | Установка зависимостей |
| `npm run dev` | Dev-сервер Next.js |
| `npm run build` | Production-сборка |
| `npm run start` | Запуск после `build` |
| `npm run lint` | ESLint (на момент аудита — без ошибок) |
| `npm run typecheck` | `tsc --noEmit` (без ошибок) |
| `npm run test` | Vitest: 5 файлов, 32 теста, все проходят |

## Краткая оценка зрелости (высокоуровневая)

Проект — **зрелый UI/UX MVP** с чёткой целью «mock first», но **без production-бэкенда, БД и настоящей IAM**. Численная оценка и приоритеты действий — в [future-foundation.md](./future-foundation.md) и резюме в чате от агента.
