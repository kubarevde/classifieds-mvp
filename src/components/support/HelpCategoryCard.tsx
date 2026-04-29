import Link from "next/link";

import type { HelpCategory } from "@/services/support";
import { Card } from "@/components/ui";

import { HelpCategoryIcon } from "./help-category-icons";

type HelpCategoryCardProps = {
  category: HelpCategory;
};

export function HelpCategoryCard({ category }: HelpCategoryCardProps) {
  return (
    <Link href={`/support/${category.slug}`}>
      <Card className="h-full p-4 transition hover:border-slate-300 hover:shadow-md sm:p-5">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-900 text-white">
            <HelpCategoryIcon icon={category.icon} className="h-5 w-5" />
          </span>
          <div className="min-w-0 space-y-1">
            <h2 className="text-base font-semibold tracking-tight text-slate-900">{category.title}</h2>
            <p className="text-sm text-slate-600">
              {category.articleCount} {category.articleCount === 1 ? "статья" : "статьи"}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
