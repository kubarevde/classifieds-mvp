import type { ReactNode } from "react";

const paddingMap = {
  none: "",
  sm: "p-3 sm:p-4",
  md: "p-4 sm:p-5",
  lg: "p-5 sm:p-6",
} as const;

export type SectionCardPadding = keyof typeof paddingMap;

export type SectionCardProps = {
  id?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  padding?: SectionCardPadding;
  /** Без оболочки (рамка/фон задаются через `className`, например дашборд с tour-ring). */
  unstyled?: boolean;
  className?: string;
  children: ReactNode;
};

export function SectionCard({
  id,
  title,
  subtitle,
  actions,
  padding = "md",
  unstyled = false,
  className = "",
  children,
}: SectionCardProps) {
  const pad = paddingMap[padding];
  const hasHeader = Boolean(title || subtitle || actions);
  const shell = unstyled ? "" : "rounded-2xl border border-slate-200 bg-white shadow-sm";

  return (
    <div id={id} className={`${shell} ${pad} ${className}`.trim()}>
      {hasHeader ? (
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            {title ? <h3 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h3> : null}
            {subtitle ? <div className="text-sm text-slate-600">{subtitle}</div> : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}
