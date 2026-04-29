"use client";

import { Flag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { ReportTargetType } from "@/services/safety";
import { buildSafetyReportNewUrl } from "@/lib/safety/build-report-new-url";
import { ReportAbuseDialog } from "@/components/safety/ReportAbuseDialog";
import { buttonVariants } from "@/lib/button-styles";
import { cn } from "@/components/ui/cn";

type ReportAbuseButtonProps = {
  targetType: ReportTargetType;
  targetId?: string | null;
  targetLabel?: string | null;
  /** Если false — сразу переход на форму без модалки */
  useDialog?: boolean;
  variant?: "outline" | "ghost";
  className?: string;
  label?: string;
};

export function ReportAbuseButton({
  targetType,
  targetId,
  targetLabel,
  useDialog = true,
  variant = "outline",
  className,
  label = "Сообщить о нарушении",
}: ReportAbuseButtonProps) {
  const [open, setOpen] = useState(false);
  const href = buildSafetyReportNewUrl({ targetType, targetId, targetLabel });

  if (!useDialog) {
    return (
      <Link
        href={href}
        className={cn(
          buttonVariants({ variant, size: "md" }),
          "inline-flex min-h-10 items-center gap-1.5 px-3",
          className,
        )}
      >
        <Flag className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
        {label}
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          buttonVariants({ variant, size: "md" }),
          "inline-flex min-h-10 items-center gap-1.5 px-3",
          className,
        )}
      >
        <Flag className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
        {label}
      </button>
      <ReportAbuseDialog
        open={open}
        onOpenChange={setOpen}
        targetType={targetType}
        targetId={targetId}
        targetLabel={targetLabel}
      />
    </>
  );
}
