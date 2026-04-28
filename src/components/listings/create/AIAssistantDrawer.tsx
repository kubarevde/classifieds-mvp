"use client";

import Link from "next/link";
import { useEffect } from "react";
import { X, Wand2 } from "lucide-react";

import type { WizardCoreValues } from "@/components/create-listing/create-listing-schema";
import { AIUsageIndicator } from "@/components/ai/AIUsageIndicator";
import { InlineNotice, SectionCard, UpgradeBanner } from "@/components/platform";
import { AIPriceRecommendation } from "@/components/listings/create/AIPriceRecommendation";
import { AIListingScore } from "@/components/listings/create/AIListingScore";
import { AITitleSuggestions } from "@/components/listings/create/AITitleSuggestions";
import type { CreateListingAiController } from "@/components/listings/create/useCreateListingAiController";
import type { WizardAiDrawerContext } from "@/components/listings/create/wizard-ai-types";
import { Button } from "@/components/ui";
import { cn } from "@/components/ui/cn";
import type { AIIssue } from "@/services/ai/listing-assistant";

const contextTitle: Record<WizardAiDrawerContext, string> = {
  basics: "Категория и мир",
  details: "Описание и цена",
  auction: "Аукцион",
  photos: "Фото объявления",
  contacts: "Контакты",
  preview: "Перед публикацией",
};

function AiDisabledNotice() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3">
      <UpgradeBanner feature="ai_listing_assistant" compact />
      <p className="mt-2 text-xs text-amber-900">Оформите подписку, чтобы открыть подсказки и проверку текста.</p>
    </div>
  );
}

type DrawerBodyProps = {
  context: WizardAiDrawerContext;
  ai: CreateListingAiController;
  featureAllowed: boolean;
  dailyLimit: number;
  usedToday: number;
  hasUnlimited: boolean;
  saleMode: WizardCoreValues["saleMode"];
  onScrollToField?: (field: AIIssue["field"]) => void;
};

function AssistantDrawerBody({
  context,
  ai,
  featureAllowed,
  dailyLimit,
  usedToday,
  hasUnlimited,
  saleMode,
  onScrollToField,
}: DrawerBodyProps) {
  const aiBusy = Boolean(ai.busyKey);
  const showUpsell = featureAllowed && !hasUnlimited && Number.isFinite(dailyLimit);

  const showCategory = context === "basics";
  const showTitleDescPrice = context === "details";
  const showScoreFull = context === "details" || context === "preview";
  const showScoreCompact = context === "basics";
  const showPhotoTips = context === "photos";

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2">
        <AIUsageIndicator usedToday={usedToday} dailyLimit={dailyLimit} />
      </div>

      {showUpsell ? (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
          <span className="font-medium text-slate-800">Расширение тарифа</span> — больше ИИ-запросов и приоритетные подсказки.{" "}
          <Link href="/pricing?feature=ai_listing_assistant" className="font-semibold text-slate-900 underline underline-offset-2">
            Тарифы
          </Link>
        </div>
      ) : null}

      {!featureAllowed ? <AiDisabledNotice /> : null}

      {featureAllowed && ai.lastError ? (
        <InlineNotice
          type="warning"
          title="Не удалось выполнить запрос"
          description={ai.lastError.message}
          action={ai.lastError.retry ? { label: "Повторить", onClick: () => ai.lastError?.retry?.() } : undefined}
        />
      ) : null}

      {showPhotoTips && featureAllowed ? (
        <SectionCard padding="sm" title="Анализ фото">
          <p className="text-xs leading-relaxed text-slate-600">
            После загрузки каждого снимка ИИ предложит теги и тип товара — они появятся на карточке фото и подставятся в поле ключевых слов после вашего подтверждения в блоке ниже галереи.
          </p>
        </SectionCard>
      ) : null}

      {context === "auction" && featureAllowed ? (
        <p className="text-sm text-slate-600">
          На этом шаге ИИ не меняет параметры аукциона. Вернитесь к описанию и цене или откройте шаг фото для тегов.
        </p>
      ) : null}

      {context === "contacts" && featureAllowed ? (
        <p className="text-sm text-slate-600">Проверьте контакты вручную. ИИ оценит полный черновик на шаге предпросмотра.</p>
      ) : null}

      {featureAllowed && showCategory ? (
        <SectionCard padding="sm" title="Категория">
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" disabled={aiBusy || ai.categoryLoading} onClick={() => void ai.suggestCategory()}>
              {ai.categoryLoading ? "…" : "Подобрать варианты"}
            </Button>
          </div>
          {ai.categoryOptions.length ? (
            <ul className="mt-2 space-y-1.5">
              {ai.categoryOptions.map((row) => (
                <li key={`${row.categoryId}-${row.worldId ?? ""}`}>
                  <button
                    type="button"
                    onClick={() => ai.selectCategoryPreview({ categoryId: row.categoryId, worldId: row.worldId, label: row.label })}
                    className={cn(
                      "w-full rounded-lg border px-3 py-2 text-left text-xs transition",
                      ai.categoryApplyPreview?.categoryId === row.categoryId && ai.categoryApplyPreview?.worldId === row.worldId
                        ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900/10"
                        : "border-slate-200 bg-white hover:border-slate-300",
                    )}
                  >
                    <span className="font-semibold text-slate-900">{row.label}</span>
                    <span className="ml-2 text-slate-500">{(row.confidence * 100).toFixed(0)}%</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {ai.categoryApplyPreview ? (
            <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-2">
              <Button type="button" size="sm" variant="primary" disabled={aiBusy} onClick={() => ai.applyCategoryPreview()}>
                Применить «{ai.categoryApplyPreview.label}»
              </Button>
              <Button type="button" size="sm" variant="outline" disabled={aiBusy} onClick={() => ai.dismissCategoryPreview()}>
                Отменить
              </Button>
            </div>
          ) : null}
          {ai.catalogHrefFromCategory ? (
            <Link href={ai.catalogHrefFromCategory} className="mt-2 inline-block text-xs font-semibold text-slate-800 underline underline-offset-2">
              Похожие в каталоге
            </Link>
          ) : null}
        </SectionCard>
      ) : null}

      {featureAllowed && showTitleDescPrice ? (
        <>
          <SectionCard padding="sm" title="Заголовок">
            <AITitleSuggestions
              key={(ai.titlePack?.suggestions ?? []).join("|")}
              suggestions={ai.titlePack?.suggestions ?? []}
              confidence={ai.titlePack?.confidence ?? 0}
              loading={ai.titlesLoading}
              disabled={aiBusy}
              onApply={ai.applyTitle}
              onGenerate={() => void ai.generateTitles(false)}
              onMore={() => void ai.generateTitles(true)}
              onDismiss={ai.dismissTitlePack}
            />
            <div className="mt-2">
              <Button type="button" size="sm" variant="outline" disabled={aiBusy} onClick={() => void ai.improveTitle()}>
                Улучшить текущий заголовок
              </Button>
            </div>
          </SectionCard>

          <SectionCard padding="sm" title="Описание">
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" disabled={aiBusy || ai.descLoading} onClick={() => void ai.generateDescription()}>
                {ai.descLoading ? "…" : "Сгенерировать черновик"}
              </Button>
              <Button type="button" size="sm" variant="ghost" disabled={aiBusy} onClick={() => void ai.improveDescription()}>
                Улучшить текст
              </Button>
            </div>
          </SectionCard>

          <SectionCard padding="sm" title="Цена">
            {saleMode !== "fixed" ? (
              <p className="text-xs text-slate-600">Подсказка цены доступна для фиксированной цены.</p>
            ) : (
              <AIPriceRecommendation
                min={ai.priceBlock?.min ?? 0}
                max={ai.priceBlock?.max ?? 0}
                recommended={ai.priceBlock?.recommended ?? 0}
                reasoning={ai.priceBlock?.reasoning ?? ""}
                comparables={ai.priceBlock?.comparables ?? []}
                loading={ai.priceLoading}
                disabled={aiBusy}
                onSuggest={() => void ai.suggestPrice()}
                onApply={ai.applyRecommendedPrice}
                onDismiss={ai.dismissPriceBlock}
              />
            )}
          </SectionCard>
        </>
      ) : null}

      {featureAllowed && showScoreCompact && !showTitleDescPrice ? (
        <SectionCard padding="sm" title="Качество">
          <p className="mb-2 text-xs text-slate-600">Краткая проверка черновика по основным полям.</p>
          <Button type="button" size="sm" variant="outline" disabled={aiBusy || ai.scoreLoading} onClick={() => void ai.runDetect()}>
            {ai.scoreLoading ? "…" : "Запустить оценку"}
          </Button>
          {ai.score !== null ? (
            <p className="mt-2 text-sm font-semibold text-slate-900">
              Оценка: <span className="tabular-nums">{ai.score}</span>/100
            </p>
          ) : null}
        </SectionCard>
      ) : null}

      {featureAllowed && showScoreFull ? (
        <AIListingScore
          score={ai.score}
          issues={ai.issues}
          loading={ai.scoreLoading}
          onRefresh={() => void ai.runDetect()}
          onFix={(issue) => void ai.fixIssue(issue)}
          onScrollToField={onScrollToField}
          disabled={aiBusy}
        />
      ) : null}
    </div>
  );
}

export type AIAssistantDrawerProps = {
  open: boolean;
  onClose: () => void;
  context: WizardAiDrawerContext;
  ai: CreateListingAiController;
  featureAllowed: boolean;
  dailyLimit: number;
  usedToday: number;
  hasUnlimited: boolean;
  saleMode: WizardCoreValues["saleMode"];
  onScrollToField?: (field: AIIssue["field"]) => void;
};

export function AIAssistantDrawer({
  open,
  onClose,
  context,
  ai,
  featureAllowed,
  dailyLimit,
  usedToday,
  hasUnlimited,
  saleMode,
  onScrollToField,
}: AIAssistantDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]" aria-label="Закрыть" onClick={onClose} />
      <div
        className={cn(
          "relative flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl",
          "max-lg:max-w-full",
        )}
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
              <Wand2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">Помощник</p>
              <p className="truncate text-xs text-slate-500">{contextTitle[context]}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          <AssistantDrawerBody
            context={context}
            ai={ai}
            featureAllowed={featureAllowed}
            dailyLimit={dailyLimit}
            usedToday={usedToday}
            hasUnlimited={hasUnlimited}
            saleMode={saleMode}
            onScrollToField={onScrollToField}
          />
        </div>
      </div>
    </div>
  );
}
