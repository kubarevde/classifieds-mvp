import type { Metadata } from "next";
import Link from "next/link";

import { Navbar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SafetyCategoryCard } from "@/components/safety/SafetyCategoryCard";
import { SafetyQuickActions } from "@/components/safety/SafetyQuickActions";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getQuickSafetyTips, getSafetyGuides } from "@/services/safety";
import { TransactionSafetyChecklist } from "@/components/risk/TransactionSafetyChecklist";

export const metadata: Metadata = buildPageMetadata({
  title: "Безопасность и жалобы",
  description:
    "Как пожаловаться на объявление или пользователя, сообщить о мошенничестве и безопасно совершать сделки на Classify.",
  path: "/safety",
});

export default function SafetyHomePage() {
  const guides = getSafetyGuides();
  const tips = getQuickSafetyTips();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/60">
      <Navbar />
      <main className="flex-1 py-8 sm:py-10">
        <Container className="space-y-10">
          <SectionHeader
            as="h1"
            title="Безопасность и жалобы"
            description="Пожалуйтесь на объявление, продавца или переписку; сообщите о мошенничестве или запрещённом контенте. Отдельно от обычной поддержки по аккаунту и тарифам."
          />

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Быстрые действия</h2>
            <SafetyQuickActions />
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Советы по безопасной сделке</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tips.map((tip) => (
                <article
                  key={tip.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                >
                  <h3 className="text-sm font-semibold text-slate-900">{tip.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{tip.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Материалы по безопасности</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {guides.map((article) => (
                <SafetyCategoryCard key={article.id} article={article} />
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-slate-900">Как распознать рискованную сделку</h2>
            <p className="mt-1 text-sm text-slate-600">
              Спокойный чеклист перед оплатой и контактом с продавцом.
            </p>
            <div className="mt-3">
              <TransactionSafetyChecklist variant="full" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/safety/reports/new"
                className="inline-flex min-h-10 items-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Сообщить о нарушении
              </Link>
              <Link
                href="/verification"
                className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                Подтверждение профиля
              </Link>
            </div>
          </section>

          <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 sm:p-5">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900">Нужна обычная поддержка?</p>
              <p className="text-sm text-slate-600">Аккаунт, тарифы, ошибки интерфейса — через центр помощи и тикеты.</p>
              <Link
                href="/support"
                className="inline-flex min-h-10 items-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                Центр помощи
              </Link>
            </div>
            <div className="space-y-2 border-t border-slate-100 pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
              <p className="text-sm font-semibold text-slate-900">Связаться с поддержкой</p>
              <p className="text-sm text-slate-600">Демо-обращение после выбора роли не «Гость».</p>
              <Link
                href="/support/tickets/new"
                className="inline-flex min-h-10 items-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Новый тикет
              </Link>
            </div>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
