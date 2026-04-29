"use client";
import { Suspense } from "react";

import EnforcementQueueClient from "./EnforcementQueueClient";

export default function AdminModerationEnforcementQueuePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Загружаем очередь enforcement…</div>}>
      <EnforcementQueueClient />
    </Suspense>
  );
}

