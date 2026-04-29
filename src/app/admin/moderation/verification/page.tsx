"use client";
import { Suspense } from "react";

import VerificationQueueClient from "./VerificationQueueClient";

export default function AdminModerationVerificationQueuePage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Загружаем очередь верификации…</div>}>
      <VerificationQueueClient />
    </Suspense>
  );
}

