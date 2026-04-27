import type { ReactNode } from "react";

export type ToolbarProps = {
  left?: ReactNode;
  right?: ReactNode;
  sticky?: boolean;
  className?: string;
};

export function Toolbar({ left, right, sticky = false, className = "" }: ToolbarProps) {
  return (
    <div
      className={`flex flex-wrap items-start justify-between gap-3 ${sticky ? "sticky top-0 z-10 border-b border-slate-200/80 bg-white/95 py-3 backdrop-blur-sm" : ""} ${className}`.trim()}
    >
      <div className="min-w-0 flex-1 space-y-2">{left}</div>
      {right ? <div className="flex shrink-0 flex-wrap items-center gap-2">{right}</div> : null}
    </div>
  );
}
