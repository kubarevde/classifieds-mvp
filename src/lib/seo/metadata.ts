import type { Metadata } from "next";

import type { BuyerRequest } from "@/entities/requests/model";
import type { SellerStorefront } from "@/entities/seller/model";
import type { UnifiedCatalogListing, CatalogWorld } from "@/lib/listings";
import { getWorldLabel } from "@/lib/listings";
import { getWorldPresentation } from "@/lib/worlds";

import { getSiteUrl, toCanonicalUrl } from "./canonical";

const DEFAULT_OG_IMAGE = "/icons/icon-512.svg";
const BRAND_NAME = "Classify";

function trimText(value: string, max = 180) {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > max ? `${normalized.slice(0, max - 1)}…` : normalized;
}

function buildOpenGraph(title: string, description: string, path: string, image = DEFAULT_OG_IMAGE) {
  const url = toCanonicalUrl(path);
  return {
    title,
    description,
    url,
    siteName: BRAND_NAME,
    images: [{ url: image, width: 1200, height: 630, alt: title }],
    type: "website" as const,
  };
}

function buildTwitter(title: string, description: string, image = DEFAULT_OG_IMAGE) {
  return {
    card: "summary_large_image" as const,
    title,
    description,
    images: [image],
  };
}

export function buildPageMetadata(input: {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const canonical = toCanonicalUrl(input.path);
  const description = trimText(input.description);
  return {
    title: input.title,
    description,
    metadataBase: new URL(getSiteUrl()),
    alternates: {
      canonical,
    },
    openGraph: buildOpenGraph(input.title, description, input.path, input.image),
    twitter: buildTwitter(input.title, description, input.image),
    robots: input.noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
  };
}

export function generateListingMetadata(listing: UnifiedCatalogListing): Metadata {
  const title = `${listing.title} - ${BRAND_NAME}`;
  const description = `${listing.categoryLabel}, ${listing.location}. ${listing.description || "Объявление с подробным описанием и контактами продавца."}`;
  return buildPageMetadata({
    title,
    description,
    path: `/listings/${listing.id}`,
  });
}

export function generateStoreMetadata(store: SellerStorefront): Metadata {
  const title = `${store.storefrontName} - ${BRAND_NAME}`;
  const description = `${store.shortDescription} Город: ${store.city}. Активных объявлений: ${store.metrics.activeListingsCount}.`;
  return buildPageMetadata({
    title,
    description,
    path: `/stores/${store.id}`,
  });
}

export function generateWorldMetadata(world: Exclude<CatalogWorld, "all">): Metadata {
  const presentation = getWorldPresentation(world);
  const title = `${presentation.title} - ${BRAND_NAME}`;
  const description = `${presentation.subtitle} Мир ${getWorldLabel(world)} с объявлениями, магазинами и сообществом.`;
  return buildPageMetadata({
    title,
    description,
    path: `/worlds/${world}`,
  });
}

export function generateRequestMetadata(request: BuyerRequest): Metadata {
  const title = `${request.title} - ${BRAND_NAME}`;
  const description = `${request.description} Локация: ${request.location}. Бюджет: ${request.budget.min ? `от ${request.budget.min}` : "по договоренности"}${request.budget.max ? ` до ${request.budget.max}` : ""} ₽.`;
  return buildPageMetadata({
    title,
    description,
    path: `/requests/${request.id}`,
  });
}

