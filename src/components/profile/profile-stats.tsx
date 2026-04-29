import { getProfileStatsSync } from "@/services/auth";

export function ProfileStats() {
  const { activeListings, savedSearches, unreadMessages } = getProfileStatsSync();

  const items = [
    { label: "Активных объявлений", value: String(activeListings) },
    { label: "Сохранённых поисков", value: String(savedSearches) },
    { label: "Непрочитанных сообщений", value: String(unreadMessages) },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Сводка</h2>
          <p className="text-xs text-slate-600">Демо-цифры для ориентира в кабинете.</p>
        </div>
      </div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-3">
        {items.map((item) => (
          <li
            key={item.label}
            className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3 text-center sm:text-left"
          >
            <p className="text-2xl font-semibold tracking-tight text-slate-900">{item.value}</p>
            <p className="mt-1 text-xs font-medium text-slate-600">{item.label}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
