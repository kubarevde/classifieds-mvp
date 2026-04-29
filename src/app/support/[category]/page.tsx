import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { HelpArticleCard } from "@/components/support/HelpArticleCard";
import { Navbar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui";
import { StructuredDataScript } from "@/components/seo/structured-data-script";
import { getSupportCategoryTitle, isSupportCategorySlug } from "@/lib/support/category-titles";
import { buildFaqPageJsonLd } from "@/lib/seo/support-structured-data";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getArticlesByCategorySlug } from "@/services/support";

type PageProps = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  if (!isSupportCategorySlug(category)) {
    return { title: "Помощь — Classify" };
  }
  const title = `${getSupportCategoryTitle(category)} — Помощь`;
  return buildPageMetadata({
    title: `${title} | Classify`,
    description: `Статьи раздела «${getSupportCategoryTitle(category)}» в центре помощи Classify.`,
    path: `/support/${category}`,
  });
}

export default async function SupportCategoryPage({ params }: PageProps) {
  const { category } = await params;
  if (!isSupportCategorySlug(category)) {
    notFound();
  }
  const articles = getArticlesByCategorySlug(category);
  const title = getSupportCategoryTitle(category);
  const faqJsonLd = buildFaqPageJsonLd(category, articles);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/60">
      <StructuredDataScript id={`support-faq-${category}`} data={faqJsonLd} />
      <Navbar />
      <main className="flex-1 py-8 sm:py-10">
        <Container className="space-y-6">
          <nav className="text-sm text-slate-600">
            <Link href="/support" className="font-medium text-blue-700 hover:text-blue-800">
              Центр помощи
            </Link>
            <span className="mx-2 text-slate-400">/</span>
            <span className="text-slate-900">{title}</span>
          </nav>
          <SectionHeader as="h1" title={title} description="Статьи и ответы по этой теме." />
          <div className="grid gap-3 sm:grid-cols-2">
            {articles.map((article) => (
              <HelpArticleCard key={article.id} article={article} />
            ))}
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
