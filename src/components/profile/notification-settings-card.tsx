import type { ProfilePersistedFields } from "./types";

type NotificationSettingsCardProps = {
  value: Pick<
    ProfilePersistedFields,
    "notifyNewMessages" | "notifySavedSearches" | "notifyMyListings"
  >;
  onChange: (patch: Partial<ProfilePersistedFields>) => void;
};

type ToggleRowProps = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
};

function ToggleRow({ id, title, description, enabled, onToggle }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="text-xs text-slate-600">{description}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition ${
          enabled
            ? "border-emerald-300 bg-emerald-500"
            : "border-slate-200 bg-white hover:border-slate-300"
        }`}
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

export function NotificationSettingsCard({ value, onChange }: NotificationSettingsCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-slate-900">Уведомления</h2>
        <p className="text-xs text-slate-600">
          Настройки хранятся только в браузере (без сервера). Выключите то, что не хотите получать.
        </p>
      </div>
      <div className="mt-4 space-y-2">
        <ToggleRow
          id="profile-notify-messages"
          title="Новые сообщения"
          description="Пуш и email при входящих в чатах."
          enabled={value.notifyNewMessages}
          onToggle={() => onChange({ notifyNewMessages: !value.notifyNewMessages })}
        />
        <ToggleRow
          id="profile-notify-saved"
          title="Сохранённые поиски"
          description="Когда появляются новые объявления по вашим фильтрам."
          enabled={value.notifySavedSearches}
          onToggle={() => onChange({ notifySavedSearches: !value.notifySavedSearches })}
        />
        <ToggleRow
          id="profile-notify-listings"
          title="Мои объявления"
          description="Просмотры, избранное, статусы модерации (демо)."
          enabled={value.notifyMyListings}
          onToggle={() => onChange({ notifyMyListings: !value.notifyMyListings })}
        />
      </div>
    </section>
  );
}
