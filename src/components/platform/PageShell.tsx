import type { ReactNode } from "react";

export type PageShellBreadcrumb = {
  label: string;
  href?: string;
};

const defaultTitleClass = "text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl";
const defaultSubtitleClass = "max-w-2xl text-sm text-slate-600 sm:text-base";

export type PageShellProps = {
  id?: string;
  title?: string;
  subtitle?: string;
  breadcrumbs?: PageShellBreadcrumb[];
  actions?: ReactNode;
  children: ReactNode;
  /** Обертка секции: по умолчанию `section`. */
  as?: "div" | "section";
  /** Дополнительные классы на корневой элемент (например `py-16`). */
  className?: string;
  /** Только контейнер max-width + padding, без шапки (title/subtitle/actions). */
  containerOnly?: boolean;
  maxWidthClassName?: string;
  /** Переопределение стилей заголовка (например маркетинговые секции на главной). */
  titleClassName?: string;
  subtitleClassName?: string;
};

export function PageShell({
  id,
  title,
  subtitle,
  breadcrumbs,
  actions,
  children,
  as: Tag = "section",
  className = "",
  containerOnly = false,
  maxWidthClassName = "max-w-7xl",
  titleClassName,
  subtitleClassName,
}: PageShellProps) {
  const titleCls = titleClassName ?? defaultTitleClass;
  const subtitleCls = subtitleClassName ?? defaultSubtitleClass;

  return (
    <Tag id={id} className={className}>
      <div className={`mx-auto w-full ${maxWidthClassName} px-4 sm:px-6 lg:px-8`}>
        {!containerOnly && (title || subtitle || breadcrumbs?.length || actions) ? (
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              {breadcrumbs?.length ? (
                <nav aria-label="Навигация" className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
                  {breadcrumbs.map((item, index) => (
                    <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1">
                      {index > 0 ? <span className="text-slate-300">/</span> : null}
                      {item.href ? (
                        <a href={item.href} className="font-medium text-slate-600 transition hover:text-slate-900">
                          {item.label}
                        </a>
                      ) : (
                        <span className="font-medium text-slate-700">{item.label}</span>
                      )}
                    </span>
                  ))}
                </nav>
              ) : null}
              {title ? <h2 className={titleCls}>{title}</h2> : null}
              {subtitle ? <p className={subtitleCls}>{subtitle}</p> : null}
            </div>
            {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
          </div>
        ) : null}
        {children}
      </div>
    </Tag>
  );
}
