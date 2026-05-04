"use client";

import { useState } from "react";

import { buttonVariants } from "@/lib/button-styles";
import { cn } from "@/components/ui/cn";
import { reviewsService } from "@/services/reviews";

type Props = {
  reviewId: string;
  authorId: string;
  onDone?: () => void;
};

export function SellerReplyForm({ reviewId, authorId, onDone }: Props) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-2">
      <textarea
        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
        rows={2}
        placeholder="Публичный ответ покупателю…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={busy}
      />
      {err ? <p className="mt-1 text-xs text-rose-600">{err}</p> : null}
      <button
        type="button"
        disabled={busy || text.trim().length < 3}
        className={cn(buttonVariants({ variant: "primary", size: "sm" }), "mt-2 rounded-lg")}
        onClick={() => {
          setBusy(true);
          setErr(null);
          void reviewsService
            .replyToReview(reviewId, authorId, text.trim())
            .then(() => {
              setText("");
              onDone?.();
            })
            .catch((e: unknown) => setErr(e instanceof Error ? e.message : "Ошибка"))
            .finally(() => setBusy(false));
        }}
      >
        {busy ? "…" : "Ответить"}
      </button>
    </div>
  );
}
