import { onboardingSteps } from "@/components/store-dashboard/store-dashboard-shared";

type StoreDashboardTourModalProps = {
  isOpen: boolean;
  tourStepIndex: number;
  activeTourStep: (typeof onboardingSteps)[number];
  onClose: () => void;
  onBack: () => void;
  onNextOrComplete: () => void;
};

export function StoreDashboardTourModal({
  isOpen,
  tourStepIndex,
  activeTourStep,
  onClose,
  onBack,
  onNextOrComplete,
}: StoreDashboardTourModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/35 p-4">
      <div className="mx-auto mt-12 w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:mt-20">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Шаг {tourStepIndex + 1} из {onboardingSteps.length}
        </p>
        <h3 className="mt-1 text-lg font-semibold text-slate-900">{activeTourStep.title}</h3>
        <p className="mt-1 text-sm text-slate-600">{activeTourStep.description}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Пропустить
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              disabled={tourStepIndex === 0}
              className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Назад
            </button>
            <button
              type="button"
              onClick={onNextOrComplete}
              className="inline-flex h-9 items-center rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              {tourStepIndex === onboardingSteps.length - 1 ? "Завершить" : "Дальше"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
