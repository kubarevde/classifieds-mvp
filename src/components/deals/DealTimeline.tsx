import type { DealEvent, DealEventType } from "@/services/deals";

const titles: Record<DealEventType, string> = {
  offer_created: "Создано предложение",
  offer_countered: "Встречное предложение",
  offer_accepted: "Предложение принято",
  offer_declined: "Предложение отклонено",
  deal_created: "Сделка создана",
  deal_completed: "Сделка завершена",
  deal_cancelled: "Сделка отменена",
  deal_disputed: "Открыт спор",
  buyer_marked_complete: "Покупатель отметил выполнение",
  seller_marked_complete: "Продавец отметил выполнение",
  system_expired: "Истекло по времени",
};

function formatAt(iso: string) {
  try {
    return new Date(iso).toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export function DealTimeline({ events }: { events: DealEvent[] }) {
  const sorted = [...events].sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp));
  if (sorted.length === 0) {
    return <p className="text-sm text-slate-500">Событий пока нет.</p>;
  }
  return (
    <ol className="relative space-y-4 border-l border-slate-200 pl-4">
      {sorted.map((ev) => (
        <li key={ev.id} className="text-sm">
          <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-white bg-slate-400" />
          <p className="font-semibold text-slate-900">{titles[ev.type]}</p>
          <p className="text-xs text-slate-500">{formatAt(ev.timestamp)}</p>
          {ev.note ? <p className="mt-1 text-slate-600">{ev.note}</p> : null}
        </li>
      ))}
    </ol>
  );
}
