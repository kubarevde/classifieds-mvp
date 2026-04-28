"use client";

import { FormEvent, useMemo, useState } from "react";

import type { BuyerRequest } from "@/entities/requests/model";
import { worldOptions, getCategoryOptionsForWorld, type CatalogWorld } from "@/lib/listings";
import type { BuyerRequestDraft } from "@/services/requests/intent-adapter";

type RequestCreateFormProps = {
  initialDraft?: Partial<BuyerRequestDraft>;
  onSubmit: (input: {
    worldId?: string;
    categoryId: string;
    title: string;
    description: string;
    budgetMin?: number;
    budgetMax?: number;
    location: string;
    urgency: BuyerRequest["urgency"];
    condition: BuyerRequest["condition"];
    tags: string[];
  }) => Promise<void> | void;
};

export function RequestCreateForm({ initialDraft, onSubmit }: RequestCreateFormProps) {
  const [worldId, setWorldId] = useState<CatalogWorld>((initialDraft?.worldId as CatalogWorld) ?? "all");
  const [categoryId, setCategoryId] = useState(initialDraft?.categoryId ?? "services");
  const [title, setTitle] = useState(initialDraft?.title ?? "");
  const [description, setDescription] = useState(initialDraft?.description ?? "");
  const [location, setLocation] = useState(initialDraft?.location ?? "Москва");
  const [budgetMin, setBudgetMin] = useState(initialDraft?.budgetMin ? String(initialDraft.budgetMin) : "");
  const [budgetMax, setBudgetMax] = useState(initialDraft?.budgetMax ? String(initialDraft.budgetMax) : "");
  const [urgency, setUrgency] = useState<BuyerRequest["urgency"]>(initialDraft?.urgency ?? "flexible");
  const [condition, setCondition] = useState<BuyerRequest["condition"]>(initialDraft?.condition ?? "any");
  const [tags, setTags] = useState(initialDraft?.tags?.join(", ") ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const categoryOptions = useMemo(() => getCategoryOptionsForWorld(worldId), [worldId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    await onSubmit({
      worldId: worldId === "all" ? undefined : worldId,
      categoryId,
      title: title.trim(),
      description: description.trim(),
      budgetMin: budgetMin ? Number(budgetMin) : undefined,
      budgetMax: budgetMax ? Number(budgetMax) : undefined,
      location: location.trim(),
      urgency,
      condition,
      tags: tags
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    });
    setIsSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="text-slate-600">Мир</span>
          <select
            value={worldId}
            onChange={(e) => setWorldId(e.target.value as CatalogWorld)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3"
          >
            {worldOptions.map((world) => (
              <option key={world.id} value={world.id}>
                {world.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-slate-600">Категория</span>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3"
          >
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <input
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3"
        placeholder="Заголовок запроса"
      />
      <textarea
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="min-h-[110px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
        placeholder="Опишите что нужно, в каком состоянии и на каких условиях"
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <input
          value={budgetMin}
          onChange={(e) => setBudgetMin(e.target.value)}
          type="number"
          min={0}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3"
          placeholder="Бюджет от"
        />
        <input
          value={budgetMax}
          onChange={(e) => setBudgetMax(e.target.value)}
          type="number"
          min={0}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3"
          placeholder="Бюджет до"
        />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3"
          placeholder="Город"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <select
          value={urgency}
          onChange={(e) => setUrgency(e.target.value as BuyerRequest["urgency"])}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3"
        >
          <option value="flexible">Срок: гибко</option>
          <option value="this_week">Срок: на этой неделе</option>
          <option value="today">Срок: сегодня</option>
        </select>
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value as BuyerRequest["condition"])}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3"
        >
          <option value="any">Состояние: любое</option>
          <option value="new">Только новое</option>
          <option value="excellent">Отличное</option>
          <option value="good">Хорошее</option>
        </select>
      </div>
      <input
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3"
        placeholder="Теги через запятую"
      />
      <button
        type="submit"
        disabled={isSaving}
        className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? "Сохраняем..." : "Опубликовать запрос"}
      </button>
    </form>
  );
}

