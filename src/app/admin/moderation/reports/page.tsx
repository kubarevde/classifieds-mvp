"use client";
import { Suspense } from "react";

import ReportsQueueClient from "./ReportsQueueClient";

export default function AdminModerationReportsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Загружаем очередь жалоб…</div>}>
      <ReportsQueueClient />
    </Suspense>
  );
}

