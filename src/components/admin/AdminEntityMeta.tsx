"use client";

export type AdminEntityMetaItem = {
  label: string;
  value: string;
};

export function AdminEntityMeta({ items }: { items: AdminEntityMetaItem[] }) {
  return (
    <dl className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div key={`${item.label}-${item.value}`} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</dt>
          <dd className="mt-1 text-sm text-slate-800">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

