import type { Metadata } from "next";
import Link from "next/link";

import { HelpArticleCard } from "@/components/support/HelpArticleCard";
import { HelpCategoryCard } from "@/components/support/HelpCategoryCard";
import { HelpSearchBar } from "@/components/support/HelpSearchBar";
import { Navbar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getSupportCategoryTitle } from "@/lib/support/category-titles";
import type { SupportCategory } from "@/services/support";
import { getHelpCategories, getPopularHelpArticles } from "@/services/support";

export const metadata: Metadata = buildPageMetadata({
  title: "Центр помощи",
  description:
    "Ответы на частые вопросы, правила, безопасность, поддержка пользователей Classify.",
  path: "/support",
});

export default function SupportHomePage() {
  const categories = getHelpCategories();
  const popular = getPopularHelpArticles();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/60">
      <Navbar />
      <main className="flex-1 py-8 sm:py-10">
        <Container className="space-y-10">
          <SectionHeader
            as="h1"
            title="Центр помощи"
            description="Найдите ответ по категории или через поиск. Для личного вопроса откройте обращение в поддержку."
          />
          <div className="max-w-xl">
            <HelpSearchBar />
          </div>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Категории</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => (
                <HelpCategoryCard key={cat.slug} category={cat} />
              ))}
            </div>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Популярные статьи</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {popular.map((article) => (
                <HelpArticleCard
                  key={article.id}
                  article={article}
                  categoryLabel={getSupportCategoryTitle(article.categorySlug as SupportCategory)}
                />
              ))}
            </div>
          </section>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 sm:p-5">
            <p className="text-sm font-medium text-slate-900">Сообщить о нарушении</p>
            <p className="mt-1 text-sm text-slate-700">
              Мошенничество, оскорбления, запрещённый контент — через центр безопасности и жалобы, не через обычный
              тикет.
            </p>
            <Link
              href="/safety"
              className="mt-3 inline-flex min-h-11 items-center rounded-xl border border-amber-300 bg-white px-4 text-sm font-semibold text-amber-950 transition hover:bg-amber-100"
            >
              Центр безопасности
            </Link>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <p className="text-sm font-medium text-slate-900">Нужен пересмотр решения?</p>
            <p className="mt-1 text-sm text-slate-700">
              После модерации решения платформы и обращения на пересмотр видны в центре решений — так вы понимаете причину и подаёте
              обращение на пересмотр.
            </p>
            <Link
              href="/enforcement"
              className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Открыть центр решений
            </Link>
          </div>
          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 sm:p-5">
            <p className="text-sm font-medium text-slate-900">Не нашли ответ?</p>
            <p className="mt-1 text-sm text-slate-700">
              Напишите в поддержку — для демо доступно после выбора роли не «Гость».
            </p>
            <Link
              href="/support/tickets/new"
              className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Написать в поддержку
            </Link>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
