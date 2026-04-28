import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getStorefrontSellerById } from "@/lib/sellers";
import { generateStoreMetadata } from "@/lib/seo/metadata";

type StoreAliasPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: StoreAliasPageProps): Promise<Metadata> {
  const { slug } = await params;
  const store = getStorefrontSellerById(slug);
  if (!store) {
    return {
      title: "Магазин не найден - Classify",
      robots: { index: false, follow: false },
    };
  }
  return generateStoreMetadata(store);
}

export default async function StoreAliasPage({ params }: StoreAliasPageProps) {
  const { slug } = await params;
  redirect(`/sellers/${slug}`);
}
