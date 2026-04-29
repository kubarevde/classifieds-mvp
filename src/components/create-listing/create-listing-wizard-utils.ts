import type { CSSProperties } from "react";

import type { Listing } from "@/lib/types";
import { formatPublishedAtLabel, toDashboardCategory } from "@/services/buyer";

import type { WizardCoreValues } from "@/components/create-listing/create-listing-schema";

export type LocalPhoto = {
  id: string;
  dataUrl: string;
  name: string;
  loading?: boolean;
};

const conditionLabels: Record<string, string> = {
  new: "Новое",
  excellent: "Отличное",
  good: "Хорошее",
  used: "Б/у",
};

export function conditionLabel(id: string): string {
  return conditionLabels[id] ?? id;
}

export function formatWizardPrice(values: WizardCoreValues): string {
  if (values.saleMode === "free") {
    return "Бесплатно";
  }
  const sourcePrice = values.saleMode === "auction" ? values.auctionStartPrice : values.price;
  const raw = sourcePrice.trim().replace(",", ".");
  const amount = Number.parseFloat(raw);
  if (Number.isNaN(amount)) {
    return `${sourcePrice.trim()} ₽`;
  }
  return `${new Intl.NumberFormat("ru-RU").format(amount)} ₽`;
}

export function wizardPriceValue(values: WizardCoreValues): number {
  if (values.saleMode === "free") {
    return 0;
  }
  const sourcePrice = values.saleMode === "auction" ? values.auctionStartPrice : values.price;
  const raw = sourcePrice.trim().replace(",", ".");
  const amount = Number.parseFloat(raw);
  return Number.isNaN(amount) ? 0 : amount;
}

export function listingImageClass(): string {
  return "from-slate-600 via-slate-400 to-slate-200";
}

export function buildListingForStore(
  id: string,
  values: WizardCoreValues,
  sellerName: string,
  sellerPhone: string,
): Listing {
  const postedAtIso = new Date().toISOString();
  return {
    id,
    listingSaleMode: values.saleMode,
    title: values.title.trim(),
    price: formatWizardPrice(values),
    priceValue: wizardPriceValue(values),
    location: values.city,
    publishedAt: formatPublishedAtLabel(),
    postedAtIso,
    category: toDashboardCategory(values.category),
    image: listingImageClass(),
    condition: conditionLabel(values.condition),
    description: values.description.trim(),
    sellerName,
    sellerPhone,
  };
}

export function availabilityLabel(id: string): string {
  const map: Record<string, string> = {
    weekdays: "Будни",
    weekends: "Выходные",
    evenings: "Вечером",
    flexible: "Договоримся",
  };
  return map[id] ?? id;
}

/** Preview card uses gradient class; when cover URL exists, render with img separately */
export function previewHeroBackground(coverDataUrl: string | null): {
  className: string;
  style?: CSSProperties;
} {
  if (coverDataUrl) {
    return {
      className: "h-44 w-full rounded-t-2xl bg-slate-200 bg-cover bg-center sm:h-52",
      style: { backgroundImage: `url(${coverDataUrl})` },
    };
  }
  return { className: `h-44 w-full rounded-t-2xl bg-gradient-to-br sm:h-52 ${listingImageClass()}` };
}
