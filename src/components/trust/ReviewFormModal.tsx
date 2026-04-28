"use client";

import { useMemo, useState } from "react";

import type { NewReviewInput } from "@/services/trust";

type ReviewFormModalProps = {
  targetId: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (input: NewReviewInput) => Promise<void>;
};

export function ReviewFormModal({ targetId, open, onClose, onSubmit }: ReviewFormModalProps) {
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [text, setText] = useState("");
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => Boolean(rating) && text.trim().length >= 30, [rating, text]);

  if (!open) {
    return null;
  }

  async function handleSubmit() {
    if (!rating) {
      setError("Выберите оценку.");
      return;
    }
    if (text.trim().length < 30) {
      setError("Минимум 30 символов в отзыве.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    await onSubmit({
      authorId: "current-user",
      authorName: "Вы",
      targetId,
      rating,
      text: text.trim(),
      pros: pros.trim() || undefined,
      cons: cons.trim() || undefined,
      photos: photos.length ? photos : undefined,
      verified: true,
    });
    setIsSubmitting(false);
    setRating(null);
    setText("");
    setPros("");
    setCons("");
    setPhotos([]);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">Написать отзыв</h3>
        <p className="mt-1 text-sm text-slate-600">Поделитесь опытом взаимодействия с продавцом.</p>

        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value as 1 | 2 | 3 | 4 | 5)}
                className={`text-2xl ${rating && value <= rating ? "text-amber-500" : "text-slate-300"}`}
                aria-label={`Оценка ${value}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Опишите ваш опыт (минимум 30 символов)"
            className="h-28 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-400"
          />
          <input
            value={pros}
            onChange={(event) => setPros(event.target.value)}
            placeholder="Плюсы (необязательно)"
            className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-800 outline-none focus:border-slate-400"
          />
          <input
            value={cons}
            onChange={(event) => setCons(event.target.value)}
            placeholder="Минусы (необязательно)"
            className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-800 outline-none focus:border-slate-400"
          />
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-700">Фото (mock upload)</p>
            <button
              type="button"
              onClick={() => setPhotos((current) => [...current, `https://picsum.photos/seed/${Date.now()}/120/120`])}
              className="mt-2 inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Добавить фото
            </button>
            {photos.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {photos.map((photo, index) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={`${photo}-${index}`} src={photo} alt="Preview" className="h-12 w-12 rounded-lg object-cover" />
                ))}
              </div>
            ) : null}
          </div>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={!canSubmit || isSubmitting}
            className="inline-flex h-9 items-center rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white disabled:bg-slate-300"
          >
            {isSubmitting ? "Отправляем..." : "Отправить отзыв"}
          </button>
        </div>
      </div>
    </div>
  );
}
