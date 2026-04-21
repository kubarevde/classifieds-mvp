import { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  hasError?: boolean;
};

export function Select({ hasError = false, className = "", children, ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-800 outline-none transition focus:ring-4 active:scale-[0.998] ${
        hasError
          ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
          : "border-slate-200 hover:border-slate-300 focus:border-sky-400 focus:ring-sky-100"
      } ${className}`}
    >
      {children}
    </select>
  );
}
