import Link from "next/link";

import { Container } from "@/components/ui/container";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50/80 py-8 text-sm text-slate-600">
      <Container className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <nav aria-label="Ссылки в подвале">
          <ul className="m-0 flex list-none flex-wrap items-center gap-4 p-0">
            <li className="shrink-0">
              <Link
                href="/support"
                className="inline-flex min-h-10 items-center font-medium text-slate-800 underline-offset-2 hover:text-slate-950 hover:underline sm:min-h-0"
              >
                Помощь
              </Link>
            </li>
            <li className="shrink-0">
              <Link
                href="/support/listing/pravila-razmeshcheniya"
                className="inline-flex min-h-10 items-center font-medium text-slate-800 underline-offset-2 hover:text-slate-950 hover:underline sm:min-h-0"
              >
                Правила
              </Link>
            </li>
            <li className="shrink-0">
              <Link
                href="/support/tickets/new"
                className="inline-flex min-h-10 items-center font-medium text-slate-800 underline-offset-2 hover:text-slate-950 hover:underline sm:min-h-0"
              >
                Связаться с нами
              </Link>
            </li>
          </ul>
        </nav>
        <p className="shrink-0 text-xs text-slate-500">© Classify</p>
      </Container>
    </footer>
  );
}
