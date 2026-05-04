# Конфигурация, окружение и безопасность

Связанные документы: [project-overview.md](./project-overview.md) · [modules-and-dependencies.md](./modules-and-dependencies.md) · [what-is-implemented.md](./what-is-implemented.md) · [data-layer.md](./data-layer.md) · [gaps-and-issues.md](./gaps-and-issues.md) · [future-foundation.md](./future-foundation.md)

---

## Файлы конфигурации

| Файл | Назначение |
|------|------------|
| `next.config.ts` | `turbopack.root` = корень проекта |
| `tsconfig.json` | Алиас `@/*` → `src/*`, strict |
| `eslint.config.mjs` | Правила ESLint + Next |
| `postcss.config.mjs` | Tailwind PostCSS |
| `vitest.config.ts`, `vitest.setup.ts` | Тестовый раннер и setup |
| `package.json` | Скрипты и версии зависимостей |

### Переменные окружения (использование в коде)

**Файлов `.env*` в репозитории нет** (ожидается локальная настройка у разработчика / в CI при необходимости).

| Переменная | Где читается | Назначение |
|------------|--------------|------------|
| `NEXT_PUBLIC_SITE_URL` | `src/lib/seo/canonical.ts` | Канонический базовый URL сайта (публичная) |
| `SITE_URL` | то же | Серверный fallback для metadata / OG |
| `NODE_ENV` | `verification/dev/page.tsx`, `src/lib/logger.ts`, `src/services/verification/index.ts` | Ограничение dev-панели, уровень логирования, dev-only экспорт |
| `npm_package_version` | `src/services/admin/mock.ts` | Отображение версии сборки в админ-моках |

Если переменные URL не заданы, используется **`http://localhost:3000`** (`FALLBACK_SITE_URL`).

---

## Аутентификация и авторизация

### Реальная IAM

**Отсутствует.** Нет NextAuth, Clerk, сессий с cookie, JWT в заголовках, `middleware.ts` для защиты маршрутов.

### Демо-«авторизация»

- **Роль:** `DemoRoleProvider` + `localStorage` (`classifieds-demo-role`).
- **Профиль (mock):** `src/services/auth/mock.ts`, экспорты в `src/services/auth/index.ts` — используются в профиле/навбаре.
- **Админ-персона:** `resolveAdminPersona(demoRole, internalAccess)` в `admin-access.ts`; query-параметр **`internalAccess`** со значениями `admin` \| `moderator` \| `support` \| `finance` (см. `parseInternalAccessParam`).
- **Гейт модерации:** `canAccessModerationConsole` в `services/moderation/access.ts` опирается на демо-роль → персону.

### Важно с точки зрения безопасности

**Любой пользователь, знающий URL и параметры, может имитировать персону консоли на клиенте.** Это приемлемо для **локального MVP**, недопустимо для production без серверной авторизации.

---

## Секреты

- **Vault / Secret Manager:** не используются.
- **Секреты в клиенте:** не задекларированы (нет публичных API-ключей в дереве на момент аудита через `process.env` grep).

---

## Service Worker

- Регистрация: `ServiceWorkerRegister` → `/sw.js` (`public/sw.js`).
- Ошибки регистрации уходят в `captureException` (`monitoring.ts`).

Риски: при агрессивном кеше SW возможны устаревшие ассеты после деплоя (зависит от содержимого `sw.js` — отдельный просмотр при production-go-live).

---

## XSS и вывод HTML

- **JSON-LD:** `src/components/seo/structured-data-script.tsx` использует `dangerouslySetInnerHTML` с **`JSON.stringify(data)`**. Для корректно сформированного JSON-объекта без пользовательских строк в ключах/значениях риск низкий; при смешивании ненормализованного пользовательского текста в объект нужна осторожность (экранирование / запрет HTML).

---

## Rate limiting, CSRF, CORS

- **Rate limiting:** отсутствует (нет публичного API).
- **CSRF:** не применимо к собственному API (его нет); формы не бьют во внешний бэкенд проекта.
- **CORS:** не настраивается в репозитории.

---

## Зависимости и supply chain

- Lockfile: `package-lock.json`, CI использует `npm ci`.
- Рекомендация на будущее: `npm audit` / Dependabot вне scope этого статического аудита.

---

## Наблюдения по инструментации

- `src/lib/monitoring.ts` — **заглушки** под Sentry (см. TODO в [gaps-and-issues.md](./gaps-and-issues.md)).
- `src/lib/observability/web-vitals.ts` + `instrumentation-client.ts` — клиентские Web Vitals.
