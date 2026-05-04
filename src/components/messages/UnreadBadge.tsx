"use client";

export function UnreadBadge({ count, className = "" }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <span
      className={`absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-slate-900 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white ${className}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
