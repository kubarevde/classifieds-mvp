import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleHelpful } from "@/components/support/ArticleHelpful";
import { ArticleMarkdown } from "@/components/support/ArticleMarkdown";
import { Navbar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { Container } from "@/components/ui/container";
import { StructuredDataScript } from "@/components/seo/structured-data-script";
import { getSupportCategoryTitle, isSupportCategorySlug } from "@/lib/support/category-titles";
import { buildHelpArticleJsonLd } from "@/lib/seo/support-structured-data";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getArticleBySlugs } from "@/services/support";

type PageProps = { params: Promise<{ category: string; slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, slug } = await params;
  if (!isSupportCategorySlug(category)) {
    return { title: "Статья — Classify" };
  }
  const article = getArticleBySlugs(category, slug);
  if (!article) {
    return { title: "Статья не найдена — Classify", robots: { index: false, follow: false } };
  }
  return buildPageMetadata({
    title: `${article.title} | Classify`,
    description: article.summary,
    path: `/support/${category}/${slug}`,
  });
}

export default async function SupportArticlePage({ params }: PageProps) {
  const { category, slug } = await params;
  if (!isSupportCategorySlug(category)) {
    notFound();
  }
  const article = getArticleBySlugs(category, slug);
  if (!article) {
    notFound();
  }
  const jsonLd = buildHelpArticleJsonLd(article);
  const catTitle = getSupportCategoryTitle(category);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/60">
      <StructuredDataScript id={`article-${article.id}`} data={jsonLd} />
      <Navbar />
      <main className="flex-1 py-8 sm:py-10">
        <Container className="max-w-3xl space-y-6">
          <nav className="text-sm text-slate-600">
            <Link href="/support" className="font-medium text-blue-700 hover:text-blue-800">
              Центр помощи
            </Link>
            <span className="mx-2 text-slate-400">/</span>
            <Link href={`/support/${category}`} className="font-medium text-blue-700 hover:text-blue-800">
              {catTitle}
            </Link>
            <span className="mx-2 text-slate-400">/</span>
            <span className="text-slate-900">{article.title}</span>
          </nav>
          <header className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{article.title}</h1>
            <p className="text-sm text-slate-600 sm:text-base">{article.summary}</p>
          </header>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <ArticleMarkdown content={article.content} />
          </article>
          <ArticleHelpful />
          <p className="text-sm text-slate-600">
            Нужна персональная помощь?{" "}
            <Link href="/support/tickets/new" className="font-semibold text-blue-700 hover:text-blue-800">
              Создать обращение
            </Link>
          </p>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
