type ProfileActionsProps = {
  onSave: () => void;
  onReset: () => void;
  canReset: boolean;
};

export function ProfileActions({ onSave, onReset, canReset }: ProfileActionsProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
      <button
        type="button"
        onClick={onReset}
        disabled={!canReset}
        className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Сбросить черновик
      </button>
      <button
        type="button"
        onClick={onSave}
        className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-700"
      >
        Сохранить изменения
      </button>
    </div>
  );
}
