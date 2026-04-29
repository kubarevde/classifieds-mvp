"use client";

import { FormEvent, useMemo, useState } from "react";

import { cn } from "@/components/ui/cn";
import type { BuyerRequest } from "@/entities/requests/model";
import { buttonVariants } from "@/lib/button-styles";
import { worldOptions, getCategoryOptionsForWorld, type CatalogWorld } from "@/lib/listings";
import type { BuyerRequestDraft } from "@/services/requests/intent-adapter";
import { SafetyHintCard } from "@/components/risk/SafetyHintCard";

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
            className="h-11 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
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
            className="h-11 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
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
        className="h-11 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
        placeholder="Заголовок запроса"
      />
      <textarea
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="min-h-[110px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
        placeholder="Опишите что нужно, в каком состоянии и на каких условиях"
      />
      <SafetyHintCard
        title="Публикуйте только нужные данные"
        description="Не указывайте паспортные, банковские и другие лишние личные данные в открытом запросе."
        href="/safety"
        ctaLabel="О правилах безопасности"
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <input
          value={budgetMin}
          onChange={(e) => setBudgetMin(e.target.value)}
          type="number"
          min={0}
          className="h-11 min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 text-sm"
          placeholder="Бюджет от"
        />
        <input
          value={budgetMax}
          onChange={(e) => setBudgetMax(e.target.value)}
          type="number"
          min={0}
          className="h-11 min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 text-sm"
          placeholder="Бюджет до"
        />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="h-11 min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 text-sm"
          placeholder="Город"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <select
          value={urgency}
          onChange={(e) => setUrgency(e.target.value as BuyerRequest["urgency"])}
          className="h-11 min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 text-sm"
        >
          <option value="flexible">Срок: гибко</option>
          <option value="this_week">Срок: на этой неделе</option>
          <option value="today">Срок: сегодня</option>
        </select>
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value as BuyerRequest["condition"])}
          className="h-11 min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 text-sm"
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
        className="h-11 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
        placeholder="Теги через запятую"
      />
      <button
        type="submit"
        disabled={isSaving}
        className={cn(
          buttonVariants({ variant: "primary", size: "md" }),
          "w-full justify-center disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto",
        )}
      >
        {isSaving ? "Сохраняем..." : "Опубликовать запрос"}
      </button>
    </form>
  );
}

