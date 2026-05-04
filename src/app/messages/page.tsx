"use client";

import { Suspense, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useDemoRole } from "@/components/demo-role/demo-role";
import { Navbar } from "@/components/layout/navbar";
import { MessagesSplitView } from "@/components/messages/messages-split-view";
import { Container } from "@/components/ui/container";
import { resolveActorIdsForRole } from "@/lib/messages-actors";

export default function MessagesInboxPage() {
  return (
    <Suspense fallback={null}>
      <MessagesInboxContent />
    </Suspense>
  );
}

function MessagesInboxContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role, currentSellerId, isHydrated } = useDemoRole();
  const actorIds = useMemo(() => resolveActorIdsForRole(role, currentSellerId), [role, currentSellerId]);
  const selectedThreadId = searchParams.get("thread");
  const from = searchParams.get("from");
  const actor = searchParams.get("actor");
  const isStoreActor = actor === "store" || role === "seller";
  const backHref = from === "dashboard" ? "/dashboard?section=messages" : from === "store-dashboard" || isStoreActor ? `/dashboard/store?sellerId=${currentSellerId ?? ""}&section=messages` : undefined;
  const backLabel = from === "dashboard" ? "Вернуться в кабинет" : from === "store-dashboard" || isStoreActor ? "Вернуться в кабинет магазина" : undefined;

  const onSelectedThreadChange = useCallback(
    (threadId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (threadId) params.set("thread", threadId);
      else params.delete("thread");
      const q = params.toString();
      router.replace(q ? `/messages?${q}` : "/messages", { scroll: false });
    },
    [router, searchParams],
  );

  if (isHydrated && role === "guest") {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50/60">
      <Navbar />
      <main className="py-6 sm:py-8">
        <Container className="space-y-4">
          <header className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Сообщения</h1>
            <p className="text-sm text-slate-600">Все диалоги по объявлениям, запросам и магазинам.</p>
          </header>
          <MessagesSplitView
            actorIds={actorIds}
            title="Сообщения"
            subtitle={isStoreActor ? "Рабочий inbox продавца: лиды и диалоги с покупателями." : "Общайтесь с продавцами по объявлениям, запросам и заказам."}
            fullscreenHref="/messages"
            selectedThreadId={selectedThreadId}
            onSelectedThreadChange={onSelectedThreadChange}
            backHref={backHref}
            backLabel={backLabel}
            isSellerWorkspace={isStoreActor}
          />
        </Container>
      </main>
    </div>
  );
}
