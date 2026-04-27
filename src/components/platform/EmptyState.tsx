import type { ReactNode } from "react";
import Link from "next/link";

export type EmptyStateAction =
  | { label: string; href: string }
  | { label: string; onClick: () => void };

export type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: EmptyStateAction;
  className?: string;
};

export function EmptyState({ icon, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600 ${className}`.trim()}
    >
      {icon ? <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center text-slate-400">{icon}</div> : null}
      <p className="text-base font-semibold text-slate-900">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed">{description}</p>
      {action ? (
        <div className="mt-5">
          {"href" in action ? (
            <Link
              href={action.href}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              {action.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={action.onClick}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              {action.label}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
