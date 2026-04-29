import Link from "next/link";

import type { SafetyGuideArticle } from "@/services/safety";
import { cn } from "@/components/ui/cn";

type SafetyCategoryCardProps = {
  article: SafetyGuideArticle;
  className?: string;
};

export function SafetyCategoryCard({ article, className }: SafetyCategoryCardProps) {
  return (
    <Link
      href={`/safety/guide/${article.slug}`}
      className={cn(
        "block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md sm:p-5",
        className,
      )}
    >
      <h3 className="text-base font-semibold text-slate-900">{article.title}</h3>
      <p className="mt-2 text-sm text-slate-600">{article.summary}</p>
      <span className="mt-3 inline-block text-sm font-medium text-blue-700">Читать →</span>
    </Link>
  );
}
