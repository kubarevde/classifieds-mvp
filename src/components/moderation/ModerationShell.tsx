"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { AdminAccessGate } from "@/components/admin/AdminAccessGate";
import { Navbar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { Container } from "@/components/ui/container";

export function ModerationShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50/60">
      <Navbar />
      <main className="flex-1 py-8 sm:py-10">
        <Container className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/moderation" className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700">
              Overview
            </Link>
            <Link href="/admin/moderation/reports" className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700">
              Reports
            </Link>
            <Link href="/admin/moderation/verification" className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700">
              Verification
            </Link>
            <Link href="/admin/moderation/appeals" className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700">
              Appeals
            </Link>
            <Link href="/admin/moderation/enforcement" className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700">
              Enforcement
            </Link>
          </div>
          <AdminAccessGate>{children}</AdminAccessGate>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}

