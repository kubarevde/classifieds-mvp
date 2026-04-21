"use client";

type NotificationFilter = "all" | "unread";

type NotificationFilterTabsProps = {
  value: NotificationFilter;
  onChange: (value: NotificationFilter) => void;
  unreadCount: number;
};

const options: Array<{ value: NotificationFilter; label: string }> = [
  { value: "all", label: "Все" },
  { value: "unread", label: "Непрочитанные" },
];

export function NotificationFilterTabs({ value, onChange, unreadCount }: NotificationFilterTabsProps) {
  return (
    <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
      {options.map((option) => {
        const isActive = option.value === value;
        const showBadge = option.value === "unread" && unreadCount > 0;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <span>{option.label}</span>
            {showBadge ? (
              <span
                className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                  isActive ? "bg-white/15 text-white" : "bg-sky-500 text-white"
                }`}
              >
                {unreadCount}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export type { NotificationFilter };

