type DashboardSummaryCardsProps = {
  total: number;
  active: number;
  sold: number;
  views: number;
};

const cards = [
  { id: "total", label: "Всего объявлений" },
  { id: "active", label: "Активных" },
  { id: "sold", label: "Продано" },
  { id: "views", label: "Просмотры" },
] as const;

export function DashboardSummaryCards({ total, active, sold, views }: DashboardSummaryCardsProps) {
  const values = {
    total,
    active,
    sold,
    views,
  };

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <article key={card.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500 sm:text-sm">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            {values[card.id].toLocaleString("ru-RU")}
          </p>
        </article>
      ))}
    </section>
  );
}
