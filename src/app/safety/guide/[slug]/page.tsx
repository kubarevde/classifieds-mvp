import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleMarkdown } from "@/components/support/ArticleMarkdown";
import { Navbar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { StructuredDataScript } from "@/components/seo/structured-data-script";
import { Container } from "@/components/ui/container";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { buildSafetyGuideJsonLd } from "@/lib/seo/safety-structured-data";
import { getSafetyGuideBySlug } from "@/services/safety";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getSafetyGuideBySlug(slug);
  if (!article) {
    return { title: "Материал — Classify", robots: { index: false, follow: false } };
  }
  return buildPageMetadata({
    title: `${article.title} | Classify`,
    description: article.summary,
    path: `/safety/guide/${slug}`,
  });
}

export default async function SafetyGuidePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getSafetyGuideBySlug(slug);
  if (!article) {
    notFound();
  }
  const jsonLd = buildSafetyGuideJsonLd(article);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/60">
      <StructuredDataScript id={`safety-guide-${article.id}`} data={jsonLd} />
      <Navbar />
      <main className="flex-1 py-8 sm:py-10">
        <Container className="max-w-3xl space-y-6">
          <nav className="text-sm text-slate-600">
            <Link href="/safety" className="font-medium text-blue-700 hover:text-blue-800">
              Безопасность
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
          <p className="text-sm text-slate-600">
            Нужна жалоба?{" "}
            <Link href="/safety/reports/new" className="font-semibold text-blue-700 hover:text-blue-800">
              Оформить обращение
            </Link>
          </p>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
