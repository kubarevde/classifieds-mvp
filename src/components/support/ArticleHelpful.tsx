"use client";

import { useState } from "react";

import { Button } from "@/components/ui";

export function ArticleHelpful() {
  const [choice, setChoice] = useState<"yes" | "no" | null>(null);

  if (choice) {
    return (
      <p className="text-sm text-slate-600">
        {choice === "yes" ? "Спасибо, нам важна обратная связь." : "Поняли. При необходимости напишите в поддержку — доработаем материал."}
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
      <p className="text-sm font-medium text-slate-900">Это помогло?</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => setChoice("yes")}>
          Да
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setChoice("no")}>
          Нет
        </Button>
      </div>
    </div>
  );
}
