"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { createAppeal, getEnforcementActionById, getAppealableActions } from "@/services/enforcement";
import type { EnforcementAction } from "@/services/enforcement/types";
import { Textarea } from "@/components/create-listing/textarea";
import { Input } from "@/components/create-listing/input";
import { Button, Card } from "@/components/ui";
import { cn } from "@/components/ui/cn";
import { buttonVariants } from "@/lib/button-styles";

const schema = z.object({
  message: z.string().min(20, "Опишите ситуацию подробнее (от 20 символов)").max(8000),
  evidenceNote: z.string().max(2000).optional(),
});

type FormValues = z.infer<typeof schema>;

export function AppealForm({
  userId,
  enforcementActionId,
}: {
  userId: string;
  enforcementActionId: string;
}) {
  const router = useRouter();

  const action: EnforcementAction | null = useMemo(() => getEnforcementActionById(enforcementActionId), [enforcementActionId]);
  const canAppeal = useMemo(() => getAppealableActions({ userId, enforcementActionId }).length > 0, [enforcementActionId, userId]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { message: "", evidenceNote: "" },
  });

  async function onSubmit(values: FormValues) {
    if (!canAppeal) return;
    const appeal = createAppeal({
      userId,
      enforcementActionId,
      message: values.message,
      evidenceNote: values.evidenceNote?.trim() || null,
    });
    router.push(`/enforcement/appeals/${appeal.id}`);
  }

  if (!action) {
    return (
      <Card className="p-4 sm:p-6">
        <p className="text-sm text-slate-600">Исходное действие не найдено.</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Кому подаёте обращение</p>
        <p className="text-sm font-semibold text-slate-900">{action.targetLabel}</p>
        <p className="text-sm text-slate-600">
          Действие: {action.actionType} · Причина: {action.reasonTitle}
        </p>
      </div>

      <form className="mt-4 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="appeal-message" className="text-sm font-medium text-slate-700">
            Сообщение для модерации
          </label>
          <Textarea
            id="appeal-message"
            rows={6}
            {...form.register("message")}
            hasError={Boolean(form.formState.errors.message)}
          />
          {form.formState.errors.message ? (
            <p className="mt-1 text-xs text-red-600">{form.formState.errors.message.message}</p>
          ) : null}
          <p className="mt-1 text-xs text-slate-500">
            Чем конкретнее объяснение, тем быстрее команда сможет принять решение.
          </p>
        </div>

        <div>
          <label htmlFor="appeal-evidence" className="text-sm font-medium text-slate-700">
            Доказательства (mock, текстом)
          </label>
          <Input id="appeal-evidence" placeholder="Ссылки или краткий список (mock)" {...form.register("evidenceNote")} />
          {form.formState.errors.evidenceNote ? (
            <p className="mt-1 text-xs text-red-600">{form.formState.errors.evidenceNote.message}</p>
          ) : null}
          <p className="mt-1 text-xs text-slate-500">В демо-версии это поле не прикрепляет файлы.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={!canAppeal || form.formState.isSubmitting} loading={form.formState.isSubmitting}>
            Отправить обращение
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/enforcement/actions/${enforcementActionId}`)}
            className={cn(buttonVariants({ variant: "outline" }), "h-10")}
          >
            Отмена
          </Button>
        </div>
      </form>

      {!canAppeal ? (
        <p className="mt-4 text-xs text-amber-800">
          Обжалование для этого действия в демо отключено (возможно, уже есть обращение или действие не активно).
        </p>
      ) : null}
    </Card>
  );
}

