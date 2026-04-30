"use client";

export function AdminMockActionRow({ storeId }: { storeId: string }) {
  return (
    <div className="flex flex-wrap gap-2 text-sm">
      <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 font-semibold text-slate-800 hover:bg-slate-50" onClick={() => console.info("[admin mock] verify", storeId)}>
        Верифицировать
      </button>
      <button type="button" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 font-semibold text-amber-900" onClick={() => console.info("[admin mock] suspend", storeId)}>
        Приостановить
      </button>
      <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 font-semibold text-slate-800 hover:bg-slate-50" onClick={() => console.info("[admin mock] plan", storeId)}>
        Сменить план
      </button>
    </div>
  );
}
