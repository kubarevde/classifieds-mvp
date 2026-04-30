"use client";

export function AdminSearchInput({
  value,
  onChange,
  placeholder = "Поиск…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-9 w-full min-w-[12rem] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-slate-400/30 focus:ring-2 md:max-w-xs"
    />
  );
}
