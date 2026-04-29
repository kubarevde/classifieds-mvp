"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button, Card } from "@/components/ui";
import { getReportReasonsForTarget, reportReasonLabels } from "@/lib/safety/report-reasons";
import { createSafetyReport, type ReportReason, type ReportTargetType } from "@/services/safety";

const targetTypes: { value: ReportTargetType; label: string }[] = [
  { value: "listing", label: "Объявление" },
  { value: "store", label: "Магазин / витрина" },
  { value: "user", label: "Пользователь" },
  { value: "request", label: "Запрос / отклик" },
  { value: "message", label: "Сообщение / переписка" },
  { value: "transaction", label: "Сделка / оплата" },
  { value: "other", label: "Другое" },
];

function parseTargetType(raw: string | null): ReportTargetType | undefined {
  const allowed = targetTypes.map((t) => t.value);
  return allowed.includes(raw as ReportTargetType) ? (raw as ReportTargetType) : undefined;
}

const schema = z
  .object({
    targetType: z.enum([
      "listing",
      "store",
      "user",
      "request",
      "message",
      "transaction",
      "other",
    ]),
    targetId: z.string().max(200).optional(),
    targetLabel: z.string().max(300).optional(),
    reason: z.string(),
    description: z.string().min(20, "Опишите ситуацию не менее чем в 20 символов").max(8000),
    evidenceText: z.string().max(4000).optional(),
  })
  .superRefine((data, ctx) => {
    const allowed = getReportReasonsForTarget(data.targetType);
    if (!allowed.includes(data.reason as ReportReason)) {
      ctx.addIssue({
        code: "custom",
        path: ["reason"],
        message: "Выберите причину, подходящую для типа жалобы",
      });
    }
  });

type FormValues = z.infer<typeof schema>;

type NewSafetyReportFormProps = {
  userId: string;
};

export function NewSafetyReportForm({ userId }: NewSafetyReportFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const defaults = useMemo(() => {
    const targetType = parseTargetType(searchParams.get("targetType")) ?? "other";
    const reasons = getReportReasonsForTarget(targetType);
    const urlReason = searchParams.get("reason");
    const reason =
      urlReason && reasons.includes(urlReason as ReportReason) ? (urlReason as ReportReason) : reasons[0];
    return {
      targetType,
      targetId: searchParams.get("targetId")?.slice(0, 200) ?? "",
      targetLabel: searchParams.get("targetLabel")?.slice(0, 300) ?? "",
      reason,
      description: "",
      evidenceText: "",
    };
  }, [searchParams]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  const watchedType = useWatch({ control: form.control, name: "targetType" }) ?? defaults.targetType;
  const reasons = getReportReasonsForTarget(watchedType);

  async function onSubmit(values: FormValues) {
    const lines = (values.evidenceText ?? "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const report = createSafetyReport({
      userId,
      targetType: values.targetType,
      targetId: values.targetId?.trim() || null,
      targetLabel: values.targetLabel?.trim() || null,
      reason: values.reason as ReportReason,
      description: values.description,
      evidenceLines: lines,
    });
    window.setTimeout(() => {
      router.push(`/safety/reports/${report.id}`);
    }, 0);
  }

  return (
    <Card className="p-4 sm:p-6">
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="safety-target-type" className="text-sm font-medium text-slate-700">
            На что жалоба
          </label>
          <select
            id="safety-target-type"
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
            {...form.register("targetType", {
              onChange: (e) => {
                const next = e.target.value as ReportTargetType;
                const first = getReportReasonsForTarget(next)[0];
                form.setValue("reason", first);
              },
            })}
          >
            {targetTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="safety-target-id" className="text-sm font-medium text-slate-700">
              ID объекта (если есть)
            </label>
            <input
              id="safety-target-id"
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
              {...form.register("targetId")}
            />
          </div>
          <div>
            <label htmlFor="safety-target-label" className="text-sm font-medium text-slate-700">
              Краткое название
            </label>
            <input
              id="safety-target-label"
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
              {...form.register("targetLabel")}
            />
          </div>
        </div>

        <div>
          <label htmlFor="safety-reason" className="text-sm font-medium text-slate-700">
            Причина
          </label>
          <select
            id="safety-reason"
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
            {...form.register("reason")}
          >
            {reasons.map((r) => (
              <option key={r} value={r}>
                {reportReasonLabels[r]}
              </option>
            ))}
          </select>
          {form.formState.errors.reason ? (
            <p className="mt-1 text-xs text-red-600">{form.formState.errors.reason.message}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="safety-description" className="text-sm font-medium text-slate-700">
            Описание
          </label>
          <textarea
            id="safety-description"
            rows={5}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            {...form.register("description")}
          />
          {form.formState.errors.description ? (
            <p className="mt-1 text-xs text-red-600">{form.formState.errors.description.message}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="safety-evidence" className="text-sm font-medium text-slate-700">
            Доказательства (ссылки или текст, по одному на строку)
          </label>
          <textarea
            id="safety-evidence"
            rows={3}
            placeholder="https://…"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            {...form.register("evidenceText")}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Отправить жалобу
          </Button>
          <Link href="/safety" className="inline-flex h-10 items-center px-3 text-sm font-medium text-slate-600 hover:text-slate-900">
            Отмена
          </Link>
        </div>
      </form>
    </Card>
  );
}
