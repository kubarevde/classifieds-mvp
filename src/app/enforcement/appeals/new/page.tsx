import { Suspense } from "react";

import { EnforcementAppealNewClient } from "./EnforcementAppealNewClient";

export default function EnforcementAppealNewPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Загрузка…</div>}>
      <EnforcementAppealNewClient />
    </Suspense>
  );
}

