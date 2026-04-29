"use client";

import type { EnforcementActionType, EnforcementStatus } from "@/services/enforcement/types";

import { Badge } from "@/components/ui/badge";

function actionTypeLabel(actionType: EnforcementActionType): string {
  switch (actionType) {
    case "warning":
      return "Предупреждение";
    case "content_hidden":
      return "Скрыто";
    case "content_removed":
      return "Удалено";
    case "account_limited":
      return "Ограничено";
    case "account_suspended":
      return "Приостановлено";
    case "verification_required":
      return "Требуется подтверждение";
    default:
      return "Решение";
  }
}

function statusTone(status: EnforcementStatus): "default" | "secondary" | "outline" {
  if (status === "active") return "secondary";
  if (status === "lifted") return "default";
  return "outline";
}

function statusLabel(status: EnforcementStatus): string {
  switch (status) {
    case "active":
      return "в силе";
    case "lifted":
      return "снято";
    case "expired":
      return "истекло";
    default:
      return status;
  }
}

export function EnforcementStatusBadge({
  actionType,
  status,
}: {
  actionType: EnforcementActionType;
  status: EnforcementStatus;
}) {
  const label = actionTypeLabel(actionType);
  return (
    <Badge variant={statusTone(status)} size="sm">
      <span className="font-semibold">{label}</span>
      <span className="ml-2 opacity-80">{statusLabel(status)}</span>
    </Badge>
  );
}

