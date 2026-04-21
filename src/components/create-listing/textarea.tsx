import { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  hasError?: boolean;
};

export function Textarea({ hasError = false, className = "", ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-4 active:scale-[0.998] ${
        hasError
          ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
          : "border-slate-200 hover:border-slate-300 focus:border-sky-400 focus:ring-sky-100"
      } ${className}`}
    />
  );
}
