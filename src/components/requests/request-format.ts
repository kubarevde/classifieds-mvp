import { categoryLabels, getWorldLabel } from "@/lib/listings";

import type { BuyerRequest } from "@/entities/requests/model";

export function formatRequestBudget(request: BuyerRequest) {
  const min = request.budget.min;
  const max = request.budget.max;
  const format = (value: number) => `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
  if (typeof min === "number" && typeof max === "number") {
    return `${format(min)} - ${format(max)}`;
  }
  if (typeof max === "number") {
    return `до ${format(max)}`;
  }
  if (typeof min === "number") {
    return `от ${format(min)}`;
  }
  return "Бюджет не указан";
}

export function formatRequestDate(iso: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function getRequestUrgencyLabel(urgency: BuyerRequest["urgency"]) {
  if (urgency === "today") return "Сегодня";
  if (urgency === "this_week") return "На неделе";
  return "Гибко";
}

export function getRequestConditionLabel(condition: BuyerRequest["condition"]) {
  if (condition === "new") return "Новый";
  if (condition === "excellent") return "Отличный";
  if (condition === "good") return "Хороший";
  return "Любое состояние";
}

export function getRequestCategoryLabel(categoryId: string) {
  return categoryLabels[categoryId as keyof typeof categoryLabels] ?? categoryId;
}

export function getRequestWorldLabel(worldId?: string) {
  if (!worldId || worldId === "all") {
    return "Все миры";
  }
  return getWorldLabel(worldId as Parameters<typeof getWorldLabel>[0]);
}

