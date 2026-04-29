"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { createSupportTicket, type SupportCategory } from "@/services/support";
import { Button, Card } from "@/components/ui";
import { buttonVariants } from "@/lib/button-styles";
import { cn } from "@/components/ui/cn";

const categories: { value: SupportCategory; label: string }[] = [
  { value: "account", label: "Аккаунт" },
  { value: "listing", label: "Объявление" },
  { value: "payment", label: "Оплата" },
  { value: "safety", label: "Безопасность" },
  { value: "store", label: "Магазин" },
  { value: "other", label: "Другое" },
];

const schema = z.object({
  category: z.enum(["account", "listing", "payment", "safety", "store", "other"]),
  subject: z.string().min(6, "Тема — минимум 6 символов").max(200),
  message: z.string().min(20, "Опишите ситуацию подробнее (от 20 символов)").max(8000),
});

type FormValues = z.infer<typeof schema>;

type NewTicketFormProps = {
  userId: string;
};

function parseCategory(raw: string | null): SupportCategory | undefined {
  const allowed = categories.map((c) => c.value);
  return allowed.includes(raw as SupportCategory) ? (raw as SupportCategory) : undefined;
}

export function NewTicketForm({ userId }: NewTicketFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaults = useMemo(() => {
    const category = parseCategory(searchParams.get("category")) ?? "other";
    const subject = searchParams.get("subject")?.slice(0, 200) ?? "";
    const message = searchParams.get("message")?.slice(0, 8000) ?? "";
    return { category, subject, message };
  }, [searchParams]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });

  async function onSubmit(values: FormValues) {
    const ticket = createSupportTicket({
      userId,
      category: values.category,
      subject: values.subject,
      message: values.message,
    });
    router.push(`/support/tickets/${ticket.id}`);
  }

  return (
    <Card className="p-4 sm:p-6">
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="ticket-category" className="text-sm font-medium text-slate-700">
            Категория
          </label>
          <select
            id="ticket-category"
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
            {...form.register("category")}
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          {form.formState.errors.category ? (
            <p className="mt-1 text-xs text-red-600">{form.formState.errors.category.message}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="ticket-subject" className="text-sm font-medium text-slate-700">
            Тема
          </label>
          <input
            id="ticket-subject"
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
            {...form.register("subject")}
          />
          {form.formState.errors.subject ? (
            <p className="mt-1 text-xs text-red-600">{form.formState.errors.subject.message}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="ticket-message" className="text-sm font-medium text-slate-700">
            Сообщение
          </label>
          <textarea
            id="ticket-message"
            rows={6}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            {...form.register("message")}
          />
          {form.formState.errors.message ? (
            <p className="mt-1 text-xs text-red-600">{form.formState.errors.message.message}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={form.formState.isSubmitting} loading={form.formState.isSubmitting}>
            Отправить обращение
          </Button>
          <Link href="/support/tickets" className={cn(buttonVariants({ variant: "outline" }), "inline-flex h-10 items-center justify-center px-4")}>
            Отмена
          </Link>
        </div>
      </form>
    </Card>
  );
}
