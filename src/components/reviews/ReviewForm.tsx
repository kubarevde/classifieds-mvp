"use client";

import { useState } from "react";

import { buttonVariants } from "@/lib/button-styles";
import { cn } from "@/components/ui/cn";

type Props = {
  onSubmit: (input: { rating: 1 | 2 | 3 | 4 | 5; text: string }) => Promise<void>;
  disabled?: boolean;
};

export function ReviewForm({ onSubmit, disabled }: Props) {
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setBusy(true);
        setErr(null);
        void onSubmit({ rating, text: text.trim() })
          .catch((er: unknown) => setErr(er instanceof Error ? er.message : "Ошибка"))
          .finally(() => setBusy(false));
      }}
    >
      <div>
        <p className="text-sm font-medium text-slate-700">Оценка</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {([1, 2, 3, 4, 5] as const).map((r) => (
            <button
              key={r}
              type="button"
              disabled={disabled || busy}
              onClick={() => setRating(r)}
              className={cn(
                "h-10 min-w-10 rounded-lg border text-sm font-semibold",
                rating === r ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <label className="block text-sm font-medium text-slate-700">
        Текст отзыва
        <textarea
          required
          minLength={8}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          rows={5}
          value={text}
          disabled={disabled || busy}
          onChange={(e) => setText(e.target.value)}
          placeholder="Опишите опыт сделки…"
        />
      </label>
      {err ? <p className="text-sm text-rose-600">{err}</p> : null}
      <button type="submit" disabled={disabled || busy} className={cn(buttonVariants({ variant: "primary", size: "md" }), "rounded-xl")}>
        {busy ? "Отправка…" : "Опубликовать отзыв"}
      </button>
    </form>
  );
}
