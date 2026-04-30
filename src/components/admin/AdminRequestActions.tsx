"use client";

export function AdminRequestActions({ requestId }: { requestId: string }) {
  return (
    <div className="flex flex-wrap gap-2 text-sm">
      <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 font-semibold text-slate-800 hover:bg-slate-50" onClick={() => console.info("[admin mock] close request", requestId)}>
        Закрыть
      </button>
      <button type="button" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 font-semibold text-rose-900" onClick={() => console.info("[admin mock] remove request", requestId)}>
        Удалить
      </button>
      <button type="button" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 font-semibold text-amber-900" onClick={() => console.info("[admin mock] flag request", requestId)}>
        Пометить риском
      </button>
    </div>
  );
}
