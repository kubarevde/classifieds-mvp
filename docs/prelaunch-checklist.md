# Pre-launch checklist (P20)

Дата прохода: 2026-04-29  
Окружение проверок: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` — **OK**.  
Lighthouse: локально против `http://127.0.0.1:3000` (mobile emulation), отчёты `.lighthouse-*.json` в `.gitignore`.

## SEO и обмен ссылками

- [x] **Canonical URLs** — `toCanonicalUrl` / `buildPageMetadata` в `src/lib/seo/metadata.ts`; витрина `/stores/[slug]` использует `seller.id` в canonical и в sitemap (slug === id в текущих данных). Задать `NEXT_PUBLIC_SITE_URL` в проде.
- [x] **sitemap.xml без дублей** — в `src/app/sitemap.ts` добавлена фильтрация по уникальному `url`.
- [x] **robots.txt** — `allow: "/"` + `disallow` только для `/dashboard`, `/create-listing`, `/requests/new` (`src/app/robots.ts`). Раньше список `allow` был слишком узким и резал публичные страницы (`/pricing`, `/favorites`, …).
- [x] **JSON-LD** — listing (`Product` + breadcrumb), store (`LocalBusiness` + breadcrumb), request (`WebPage` + breadcrumb), главная: **`WebSite` + `SearchAction`** (`buildWebSiteJsonLd` + `StructuredDataScript` на `app/page.tsx`). Уточнить с backend реальный query-параметр поиска (сейчас `?query=`).
- [x] **Open Graph / Twitter** — корневой `layout.tsx` + `generateListingMetadata` / store / request через `buildPageMetadata`.

## Ошибки, офлайн, PWA

- [x] **404 + CTA** — `src/app/not-found.tsx`: «На главную», каталог, запросы, магазины, миры.
- [x] **Offline** — `src/app/offline/page.tsx` + SW (`service-worker-register`); страница с «Попробовать снова» и ссылками.
- [x] **PWA manifest** — `src/app/manifest.ts` (icons, theme, `standalone`). Иконки — SVG; часть сторов требует PNG — **обсудить с дизайном / backend CDN**.

## Маршруты: loading / error

- [x] **loading.tsx** — `listings`, `listings/[id]`, `requests`, `stores`, `stores/[slug]`, `dashboard`, **`sponsor-board`** (добавлен).
- [x] **error.tsx** — глобальный `app/error.tsx`; сегменты `listings`, `dashboard`, `requests` (`RouteErrorView` + CTA).

## Код и качество

- [x] **Нет лишних `console.error` в приложении** — единственный вызов в **`src/lib/logger.ts`** (намеренный sink до Sentry). Производственные ошибки идут через `captureException` → logger.
- [x] **TypeScript** — без ошибок (`npm run typecheck`).
- [x] **Тесты** — `npm run test` проходит.

## Lighthouse (mobile emulation)

| URL        | Performance | Accessibility |
|-----------|-------------:|---------------:|
| `/`       | 0.73         | 0.94           |
| `/listings` | 0.72      | 1.00           |

Рекомендации после бэкенда: кэширование, CDN для статики, при необходимости разбить тяжёлый клиентский бандл на `/listings`.

## Ручная верификация (не автоматизировано в этом прогоне)

- [ ] **CLS** — визуально проверить главную и каталог (герои, шрифты, карточки без скачков). Автоматический CLS из отчёта не зафиксирован в этом документе.
- [ ] **375px: mobile nav** — клик по бургеру, закрытие, фокус-ловушка.
- [ ] **375px: create listing wizard** — шаги, кнопки, превью без горизонтального overflow.
- [ ] **375px: create request** (`/requests/new`) — то же.
- [ ] **Все empty states** — в каталоге пустой грид получил CTA «Открыть каталог» (`ListingsGrid`). Остальные экраны (избранное, сообщения, …) — **пройти глазами** и при необходимости добавить `action` в `EmptyState`.

## «Чёрные дыры» после запуска backend

1. **Реальный поиск** — `SearchAction` в JSON-LD и query в `/listings` должны совпасть с API.  
2. **Картинки объявлений в Product JSON-LD** — сейчас заглушка `icon-512`; заменить на URL обложек с CDN.  
3. **Ошибки серверных экшенов / RSC** — логировать на сервере отдельно от клиентского `monitoring`.  
4. **Lighthouse в CI** — подключить в pipeline при стабильном preview URL.
