import type { ReactNode } from "react";

export function AdminDataTable({
  columns,
  rows,
  empty,
}: {
  columns: { key: string; label: string; className?: string }[];
  rows: ReactNode[][];
  empty?: ReactNode;
}) {
  if (!rows.length) {
    return empty ?? null;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={`px-3 py-2 ${c.className ?? ""}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((cells, ri) => (
            <tr key={ri} className="hover:bg-slate-50/80">
              {cells.map((cell, ci) => (
                <td key={`${ri}-${columns[ci]?.key ?? ci}`} className="whitespace-nowrap px-3 py-2.5 text-slate-800">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
