"use client";

import type { ModerationCaseStatus, ModerationPriority, ModerationQueueFilters, ModerationQueueType } from "@/services/moderation";
import { AdminFiltersBar } from "@/components/admin/AdminFiltersBar";

type Option<T extends string> = { value: T | "all"; label: string };

const statusOptions: Option<ModerationCaseStatus>[] = [
  { value: "all", label: "Все статусы" },
  { value: "new", label: "Новый" },
  { value: "in_review", label: "На рассмотрении" },
  { value: "awaiting_info", label: "Ожидает данных" },
  { value: "resolved", label: "Решён" },
  { value: "escalated", label: "Эскалирован" },
];

const priorityOptions: Option<ModerationPriority>[] = [
  { value: "all", label: "Все приоритеты" },
  { value: "low", label: "Низкий" },
  { value: "medium", label: "Средний" },
  { value: "high", label: "Высокий" },
  { value: "urgent", label: "Критический" },
];

const queueOptions: Option<ModerationQueueType>[] = [
  { value: "all", label: "Все кейсы" },
  { value: "safety_report", label: "Жалобы" },
  { value: "verification_case", label: "Верификация" },
  { value: "appeal_case", label: "Appeals" },
  { value: "risk_case", label: "Высокий риск" },
];

export function ModerationFilters({
  value,
  onChange,
  showQueueType = true,
}: {
  value: ModerationQueueFilters;
  onChange: (next: ModerationQueueFilters) => void;
  showQueueType?: boolean;
}) {
  return (
    <AdminFiltersBar>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <input
          value={value.search ?? ""}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          placeholder="Поиск"
          className="h-10 rounded-lg border border-slate-200 px-3 text-sm lg:col-span-2"
        />
        {showQueueType ? (
          <select
            value={value.queueType ?? "all"}
            onChange={(e) => onChange({ ...value, queueType: e.target.value as ModerationQueueType | "all" })}
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
          >
            {queueOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : null}
        <select
          value={value.status ?? "all"}
          onChange={(e) => onChange({ ...value, status: e.target.value as ModerationCaseStatus | "all" })}
          className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={value.priority ?? "all"}
          onChange={(e) => onChange({ ...value, priority: e.target.value as ModerationPriority | "all" })}
          className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
        >
          {priorityOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={value.assignedTo ?? "all"}
          onChange={(e) => onChange({ ...value, assignedTo: e.target.value as ModerationQueueFilters["assignedTo"] })}
          className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
        >
          <option value="all">Назначено: все</option>
          <option value="mine">Назначено: только мои</option>
          <option value="unassigned">Назначено: без ответственного</option>
        </select>
      </div>
    </AdminFiltersBar>
  );
}

