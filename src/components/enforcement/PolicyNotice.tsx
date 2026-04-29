"use client";

export function PolicyNotice({
  reasonTitle,
  policySummary,
  whatItMeans,
  nextSteps,
}: {
  reasonTitle: string;
  policySummary: string;
  whatItMeans: string;
  nextSteps: { title: string; description: string; href?: string }[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Причина</p>
        <h3 className="text-base font-semibold text-slate-900">{reasonTitle}</h3>
        <p className="text-sm text-slate-700">{policySummary}</p>
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Что это значит для вас</p>
        <p className="text-sm text-slate-700">{whatItMeans}</p>
      </div>

      {nextSteps.length ? (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Следующие шаги</p>
          <ul className="space-y-2">
            {nextSteps.map((s) => (
              <li key={s.title} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{s.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{s.description}</p>
                  </div>
                  {s.href ? (
                    <a href={s.href} className="shrink-0 text-sm font-semibold text-slate-900 underline underline-offset-4">
                      Открыть
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

