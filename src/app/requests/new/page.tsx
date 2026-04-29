import type { Metadata } from "next";
import Link from "next/link";

import { Navbar } from "@/components/layout/navbar";
import { NewRequestPageClient } from "@/components/requests/NewRequestPageClient";
import { Container } from "@/components/ui/container";
import { parseIntentFromSearchParams } from "@/lib/saved-searches";
import { searchIntentToBuyerRequestDraft } from "@/services/requests/intent-adapter";

type NewRequestPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Разместить запрос - Classify",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewRequestPage({ searchParams }: NewRequestPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const url = new URLSearchParams();
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        value.forEach((item) => url.append(key, item));
      } else if (typeof value === "string") {
        url.set(key, value);
      }
    }
  }
  const intent = parseIntentFromSearchParams(url);
  const prefillDraft = intent ? searchIntentToBuyerRequestDraft(intent) : undefined;
  const showSearchPrefillBanner = Boolean(intent && intent.target === "listing");

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="py-6 sm:py-8">
        <Container className="max-w-3xl space-y-4">
          <header className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Создать запрос</h1>
            <p className="text-sm text-slate-600">
              Главная точка demand-слоя: после публикации запрос появится на доске, а вы перейдёте к откликам. Черновик можно
              привезти из поиска или повторить из старого запроса.
            </p>
            <p className="text-sm">
              <Link href="/requests" className="font-medium text-blue-700 underline-offset-2 hover:underline">
                Доска запросов
              </Link>
            </p>
          </header>
          <NewRequestPageClient prefillDraft={prefillDraft} showSearchPrefillBanner={showSearchPrefillBanner} />
        </Container>
      </main>
    </div>
  );
}

