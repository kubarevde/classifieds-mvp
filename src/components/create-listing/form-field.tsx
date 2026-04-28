import { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  /** Кнопки справа от подписи (например ✨ AI) */
  actions?: ReactNode;
  children: ReactNode;
};

export function FormField({ label, htmlFor, required, error, hint, actions, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-800">
          {label}
          {required ? <span className="ml-1 text-rose-500">*</span> : null}
        </label>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-1">{actions}</div> : null}
      </div>
      {children}
      {error ? (
        <p className="text-xs font-medium text-rose-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}
