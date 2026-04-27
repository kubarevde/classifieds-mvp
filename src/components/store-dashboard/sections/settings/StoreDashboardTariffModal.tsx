import { CheckCircle2, Lock, X } from "lucide-react";

import { tariffRows } from "@/components/store-dashboard/store-dashboard-shared";

type StoreDashboardTariffModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function StoreDashboardTariffModal({ isOpen, onClose }: StoreDashboardTariffModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/35 p-4">
      <div className="mx-auto mt-10 max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-slate-900">Сравнение тарифов</p>
            <p className="text-sm text-slate-600">Базовый vs Про vs Бизнес</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="border-b border-slate-200 px-2 py-2">Возможность</th>
                <th className="border-b border-slate-200 px-2 py-2">Базовый</th>
                <th className="border-b border-slate-200 px-2 py-2">Про</th>
                <th className="border-b border-slate-200 px-2 py-2">Бизнес</th>
                <th className="border-b border-slate-200 px-2 py-2">Разовая</th>
              </tr>
            </thead>
            <tbody>
              {tariffRows.map((row) => (
                <tr key={row.id}>
                  <td className="border-b border-slate-100 px-2 py-2 text-slate-700">{row.label}</td>
                  <td className="border-b border-slate-100 px-2 py-2 text-center">
                    {row.free ? (
                      <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-500" strokeWidth={1.5} />
                    ) : (
                      <Lock className="mx-auto h-4 w-4 text-slate-300" strokeWidth={1.5} />
                    )}
                  </td>
                  <td className="border-b border-slate-100 px-2 py-2 text-center">
                    {row.pro ? (
                      <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-500" strokeWidth={1.5} />
                    ) : (
                      <Lock className="mx-auto h-4 w-4 text-slate-300" strokeWidth={1.5} />
                    )}
                  </td>
                  <td className="border-b border-slate-100 px-2 py-2 text-center">
                    {row.business ? (
                      <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-500" strokeWidth={1.5} />
                    ) : (
                      <Lock className="mx-auto h-4 w-4 text-slate-300" strokeWidth={1.5} />
                    )}
                  </td>
                  <td className="border-b border-slate-100 px-2 py-2 text-center">
                    {row.oneTime ? (
                      <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-500" strokeWidth={1.5} />
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
