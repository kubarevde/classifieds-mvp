import type { TrustBadge, TrustScore } from "@/entities/trust/model";

export const trustLevelLabel: Record<TrustScore["level"], string> = {
  new: "Новый продавец",
  trusted: "Доверенный",
  verified: "Проверенный",
  top_seller: "Топ-продавец",
};

export function trustLevelTone(level: TrustScore["level"]) {
  if (level === "top_seller") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }
  if (level === "verified") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
  if (level === "trusted") {
    return "border-sky-200 bg-sky-50 text-sky-800";
  }
  return "border-slate-200 bg-slate-50 text-slate-700";
}

export function trustBadgeDescription(type: TrustBadge["type"]): string {
  if (type === "identity_verified") return "Личность продавца прошла проверку.";
  if (type === "business_verified") return "Бизнес-профиль и реквизиты подтверждены.";
  if (type === "top_rated") return "Стабильно высокая оценка и качественные сделки.";
  if (type === "fast_response") return "Продавец обычно отвечает быстрее среднего.";
  if (type === "trusted_seller") return "Низкий риск споров и стабильная история продаж.";
  return "Продавец давно и стабильно работает на платформе.";
}

export function ratingLabel(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
