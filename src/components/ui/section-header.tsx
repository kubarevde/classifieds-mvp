import type { ElementType, ReactNode } from "react";

import { cn } from "@/components/ui/cn";

export type SectionHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Заголовок страницы — `h1`; секция внутри страницы — `h2` (по умолчанию). */
  as?: "h1" | "h2";
  className?: string;
};

const defaultTitleClass =
  "text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.65rem] sm:leading-snug";

export function SectionHeader({ title, description, actions, as = "h2", className }: SectionHeaderProps) {
  const Heading = as as ElementType;

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0 space-y-1">
        <Heading className={defaultTitleClass}>{title}</Heading>
        {description ? <div className="max-w-3xl text-sm leading-relaxed text-slate-600">{description}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
