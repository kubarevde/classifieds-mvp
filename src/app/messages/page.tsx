import { Suspense } from "react";

import { Navbar } from "@/components/layout/navbar";
import { MessagesPageClient } from "@/components/messages/messages-page-client";
import { Container } from "@/components/ui/container";

function MessagesPageFallback() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
      Загружаем диалоги...
    </div>
  );
}

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-slate-50/60">
      <Navbar />
      <main className="py-6 sm:py-8">
        <Container className="space-y-4">
          <header className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Сообщения</h1>
            <p className="text-sm text-slate-600 sm:text-base">
              Переписывайтесь по объявлениям прямо внутри сервиса.
            </p>
          </header>

          <Suspense fallback={<MessagesPageFallback />}>
            <MessagesPageClient />
          </Suspense>
        </Container>
      </main>
    </div>
  );
}
