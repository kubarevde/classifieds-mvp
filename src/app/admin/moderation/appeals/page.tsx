"use client";
import { Suspense } from "react";

import AppealsQueueClient from "./AppealsQueueClient";

export default function AdminModerationAppealsQueuePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Загружаем очередь appeals…</div>}>
      <AppealsQueueClient />
    </Suspense>
  );
}

