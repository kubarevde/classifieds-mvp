"use client";

type AlertsToggleProps = {
  enabled: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  id: string;
  label?: string;
};

export function AlertsToggle({ enabled, onChange, disabled = false, id, label }: AlertsToggleProps) {
  const controlId = `${id}-alerts`;

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900">Уведомления</p>
        <p className="text-xs text-slate-600">
          {label ?? "Сообщим о новых объявлениях по этому поиску (демо, без сервера)."}
        </p>
      </div>
      <button
        id={controlId}
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition ${
          enabled
            ? "border-emerald-300 bg-emerald-500"
            : "border-slate-200 bg-white hover:border-slate-300"
        } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
