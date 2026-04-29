import Link from "next/link";

import type { HelpArticle } from "@/services/support";
import { Badge, Card } from "@/components/ui";

type HelpArticleCardProps = {
  article: HelpArticle;
  /** Подпись раздела для бейджа в списках. */
  categoryLabel?: string;
};

export function HelpArticleCard({ article, categoryLabel }: HelpArticleCardProps) {
  return (
    <Link href={`/support/${article.categorySlug}/${article.slug}`}>
      <Card className="h-full p-4 transition hover:border-slate-300 hover:shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-900 sm:text-base">{article.title}</h3>
          {categoryLabel ? (
            <Badge variant="secondary" size="sm" className="font-normal">
              {categoryLabel}
            </Badge>
          ) : null}
        </div>
        <p className="mt-2 line-clamp-2 text-xs text-slate-600 sm:text-sm">{article.summary}</p>
      </Card>
    </Link>
  );
}
