import type { SupportCategory } from "@/services/support";
import { getHelpCategories } from "@/services/support";

export function isSupportCategorySlug(value: string): value is SupportCategory {
  return getHelpCategories().some((c) => c.slug === value);
}

export function getSupportCategoryTitle(slug: SupportCategory): string {
  return getHelpCategories().find((c) => c.slug === slug)?.title ?? slug;
}
