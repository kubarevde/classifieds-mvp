"use client";

import { useCallback, useState } from "react";
import type { UseFormGetValues, UseFormSetValue } from "react-hook-form";

import type { WizardCoreValues } from "@/components/create-listing/create-listing-schema";
import type { AiAssistRequestType } from "@/entities/ai/model";
import type { AiUsageCheckResult } from "@/entities/ai/model";
import { filterAndSortUnifiedListings, unifiedCatalogListings, type CatalogWorld, type UnifiedCatalogListing } from "@/lib/listings";
import { buildListingsHrefFromIntent, createSearchIntentFromFilters, defaultSavedSearchFilters } from "@/lib/saved-searches";
import type { AIIssue, AIListingAssistant } from "@/services/ai/listing-assistant";

import type { AiActionError } from "@/components/listings/create/use-listing-ai-actions";

export type CategoryApplyPreview = {
  categoryId: string;
  worldId?: string;
  label: string;
};

export type CreateListingAiController = {
  titlePack: { suggestions: string[]; confidence: number } | null;
  dismissTitlePack: () => void;
  descPreview: { text: string; highlights: string[] } | null;
  applyDescPreview: () => void;
  dismissDescPreview: () => void;
  titleImprovePreview: { improved: string; changes: string[] } | null;
  applyTitleImprovePreview: () => void;
  dismissTitleImprovePreview: () => void;
  descImprovePreview: { improved: string; changes: string[] } | null;
  applyDescImprovePreview: () => void;
  dismissDescImprovePreview: () => void;
  categoryApplyPreview: CategoryApplyPreview | null;
  selectCategoryPreview: (row: CategoryApplyPreview) => void;
  applyCategoryPreview: () => void;
  dismissCategoryPreview: () => void;
  clearInlineAiPreviews: () => void;
  priceBlock: {
    min: number;
    max: number;
    recommended: number;
    reasoning: string;
    comparables: UnifiedCatalogListing[];
  } | null;
  dismissPriceBlock: () => void;
  categoryOptions: { categoryId: string; worldId?: string; confidence: number; label: string }[];
  score: number | null;
  issues: AIIssue[];
  catalogHrefFromCategory: string | null;
  titlesLoading: boolean;
  descLoading: boolean;
  priceLoading: boolean;
  categoryLoading: boolean;
  scoreLoading: boolean;
  busyKey: string | null;
  lastError: AiActionError | null;
  setLastError: (v: AiActionError | null) => void;
  guard: () => AiUsageCheckResult;
  onBlocked: (check: AiUsageCheckResult) => void;
  generateTitles: (more: boolean) => Promise<void>;
  applyTitle: (title: string) => void;
  generateDescription: () => Promise<void>;
  improveTitle: () => Promise<void>;
  improveDescription: () => Promise<void>;
  suggestPrice: () => Promise<void>;
  applyRecommendedPrice: (n: number) => void;
  suggestCategory: () => Promise<void>;
  applyCategory: (categoryId: string, worldId: string | undefined) => void;
  runDetect: () => Promise<void>;
  fixIssue: (issue: AIIssue) => Promise<void>;
};

type RunFn = <T,>(key: string, type: AiAssistRequestType, fn: () => Promise<T>) => Promise<T | null>;

export function useCreateListingAiController(params: {
  assistant: AIListingAssistant;
  run: RunFn;
  busyKey: string | null;
  lastError: AiActionError | null;
  setLastError: (v: AiActionError | null) => void;
  guard: () => AiUsageCheckResult;
  getValues: UseFormGetValues<WizardCoreValues>;
  setValue: UseFormSetValue<WizardCoreValues>;
  categoryLabel: (categoryId: string) => string;
  onBlocked: (check: AiUsageCheckResult) => void;
}): CreateListingAiController {
  const { assistant, run, busyKey, lastError, setLastError, guard, getValues, setValue, categoryLabel, onBlocked } = params;

  const [titlePack, setTitlePack] = useState<{ suggestions: string[]; confidence: number } | null>(null);
  const [descPreview, setDescPreview] = useState<{ text: string; highlights: string[] } | null>(null);
  const [titleImprovePreview, setTitleImprovePreview] = useState<{ improved: string; changes: string[] } | null>(null);
  const [descImprovePreview, setDescImprovePreview] = useState<{ improved: string; changes: string[] } | null>(null);
  const [categoryApplyPreview, setCategoryApplyPreview] = useState<CategoryApplyPreview | null>(null);
  const [priceBlock, setPriceBlock] = useState<CreateListingAiController["priceBlock"]>(null);
  const [categoryOptions, setCategoryOptions] = useState<CreateListingAiController["categoryOptions"]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [issues, setIssues] = useState<AIIssue[]>([]);
  const [catalogHrefFromCategory, setCatalogHrefFromCategory] = useState<string | null>(null);

  const [titlesLoading, setTitlesLoading] = useState(false);
  const [descLoading, setDescLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [scoreLoading, setScoreLoading] = useState(false);

  const dismissTitlePack = useCallback(() => setTitlePack(null), []);

  const dismissPriceBlock = useCallback(() => setPriceBlock(null), []);

  const clearInlineAiPreviews = useCallback(() => {
    setTitlePack(null);
    setDescPreview(null);
    setTitleImprovePreview(null);
    setDescImprovePreview(null);
    setCategoryApplyPreview(null);
    setPriceBlock(null);
  }, []);

  const beforeRun = useCallback(
    (check: AiUsageCheckResult) => {
      if (!check.ok) {
        onBlocked(check);
        return false;
      }
      return true;
    },
    [onBlocked],
  );

  const applyCategoryInternal = useCallback(
    (categoryId: string, worldId: string | undefined) => {
      const v = getValues();
      const rawWorld = (worldId ?? v.world) as CatalogWorld;
      const w = rawWorld === "all" ? "electronics" : rawWorld;
      setValue("world", w, { shouldDirty: true });
      setValue("category", categoryId, { shouldValidate: true, shouldDirty: true });
      setValue("subCategory", "", { shouldDirty: true });
      const intent = createSearchIntentFromFilters(
        {
          ...defaultSavedSearchFilters,
          world: w,
          category: categoryId,
          query: v.title.slice(0, 80),
        },
        "keyword",
      );
      setCatalogHrefFromCategory(buildListingsHrefFromIntent(intent));
    },
    [getValues, setValue],
  );

  const generateTitles = useCallback(
    async (more: boolean) => {
      if (!beforeRun(guard())) return;
      setTitlesLoading(true);
      const v = getValues();
      const out = await run(`title-${more ? "more" : "gen"}`, "title", () =>
        assistant.generateTitle({
          categoryId: v.category || "services",
          worldId: v.world === "all" ? undefined : v.world,
          description: v.description,
          photos: [],
        }),
      );
      setTitlesLoading(false);
      if (out) {
        setTitleImprovePreview(null);
        setTitlePack(out);
      }
    },
    [assistant, beforeRun, getValues, guard, run],
  );

  const applyTitle = useCallback(
    (title: string) => {
      setValue("title", title, { shouldValidate: true, shouldDirty: true });
      setTitlePack(null);
    },
    [setValue],
  );

  const applyDescPreview = useCallback(() => {
    if (!descPreview) return;
    setValue("description", descPreview.text, { shouldValidate: true, shouldDirty: true });
    setDescPreview(null);
    setDescImprovePreview(null);
  }, [descPreview, setValue]);

  const dismissDescPreview = useCallback(() => setDescPreview(null), []);

  const applyTitleImprovePreview = useCallback(() => {
    if (!titleImprovePreview) return;
    setValue("title", titleImprovePreview.improved, { shouldValidate: true, shouldDirty: true });
    setTitleImprovePreview(null);
    setTitlePack(null);
  }, [setValue, titleImprovePreview]);

  const dismissTitleImprovePreview = useCallback(() => setTitleImprovePreview(null), []);

  const applyDescImprovePreview = useCallback(() => {
    if (!descImprovePreview) return;
    setValue("description", descImprovePreview.improved, { shouldValidate: true, shouldDirty: true });
    setDescImprovePreview(null);
    setDescPreview(null);
  }, [descImprovePreview, setValue]);

  const dismissDescImprovePreview = useCallback(() => setDescImprovePreview(null), []);

  const selectCategoryPreview = useCallback((row: CategoryApplyPreview) => {
    setCategoryApplyPreview(row);
  }, []);

  const applyCategoryPreview = useCallback(() => {
    if (!categoryApplyPreview) return;
    applyCategoryInternal(categoryApplyPreview.categoryId, categoryApplyPreview.worldId);
    setCategoryApplyPreview(null);
  }, [applyCategoryInternal, categoryApplyPreview]);

  const dismissCategoryPreview = useCallback(() => setCategoryApplyPreview(null), []);

  const generateDescription = useCallback(async () => {
    if (!beforeRun(guard())) return;
    setDescLoading(true);
    setDescImprovePreview(null);
    const v = getValues();
    const out = await run("desc", "description", () =>
      assistant.generateDescription({
        title: v.title,
        categoryId: v.category || "services",
        condition: v.condition,
      }),
    );
    setDescLoading(false);
    if (out) {
      setDescPreview({ text: out.text, highlights: out.highlights });
    }
  }, [assistant, beforeRun, getValues, guard, run]);

  const improveTitle = useCallback(async () => {
    if (!beforeRun(guard())) return;
    const v = getValues();
    const out = await run("improve-title", "improve", () => assistant.improveText({ text: v.title, type: "title" }));
    if (out) {
      setTitlePack(null);
      setTitleImprovePreview({ improved: out.improved, changes: out.changes });
    }
  }, [assistant, beforeRun, getValues, guard, run]);

  const improveDescription = useCallback(async () => {
    if (!beforeRun(guard())) return;
    const v = getValues();
    setDescPreview(null);
    const out = await run("improve-desc", "improve", () => assistant.improveText({ text: v.description, type: "description" }));
    if (out) {
      setDescImprovePreview({ improved: out.improved, changes: out.changes });
    }
  }, [assistant, beforeRun, getValues, guard, run]);

  const suggestPrice = useCallback(async () => {
    if (!beforeRun(guard())) return;
    setPriceLoading(true);
    const v = getValues();
    const out = await run("price", "price", () =>
      assistant.suggestPrice({
        title: v.title,
        categoryId: v.category || "services",
        condition: v.condition,
        location: v.city || "",
      }),
    );
    setPriceLoading(false);
    if (!out) return;
    const comparables = filterAndSortUnifiedListings(unifiedCatalogListings, {
      query: v.title.slice(0, 28).toLowerCase(),
      category: v.category || "all",
      location: "all",
      sortBy: "newest",
      saleMode: "all",
    }).slice(0, 3);
    setPriceBlock({
      min: out.min,
      max: out.max,
      recommended: out.recommended,
      reasoning: out.reasoning,
      comparables,
    });
  }, [assistant, beforeRun, getValues, guard, run]);

  const applyRecommendedPrice = useCallback(
    (n: number) => {
      setValue("price", String(n), { shouldValidate: true, shouldDirty: true });
      setPriceBlock(null);
    },
    [setValue],
  );

  const suggestCategory = useCallback(async () => {
    if (!beforeRun(guard())) return;
    setCategoryLoading(true);
    const v = getValues();
    const out = await run("category", "category", () => assistant.suggestCategory({ title: v.title, description: v.description }));
    setCategoryLoading(false);
    if (!out) return;
    setCategoryOptions(
      out.map((row) => ({
        ...row,
        label: categoryLabel(row.categoryId),
      })),
    );
  }, [assistant, beforeRun, categoryLabel, getValues, guard, run]);

  const applyCategory = useCallback(
    (categoryId: string, worldId: string | undefined) => {
      applyCategoryInternal(categoryId, worldId);
      setCategoryApplyPreview(null);
    },
    [applyCategoryInternal],
  );

  const runDetect = useCallback(async () => {
    if (!beforeRun(guard())) return;
    setScoreLoading(true);
    const v = getValues();
    const priceNum =
      v.saleMode === "auction"
        ? Number.parseFloat(v.auctionStartPrice.replace(",", ".")) || 0
        : Number.parseFloat(v.price.replace(",", ".")) || 0;
    const out = await run("detect", "detect", () =>
      assistant.detectProblems({
        title: v.title,
        description: v.description,
        price: priceNum,
        categoryId: v.category,
      }),
    );
    setScoreLoading(false);
    if (!out) return;
    setScore(out.score);
    setIssues(out.issues);
  }, [assistant, beforeRun, getValues, guard, run]);

  const fixIssue = useCallback(
    async (issue: AIIssue) => {
      if (issue.field === "title") {
        await improveTitle();
        return;
      }
      if (issue.field === "description") {
        await improveDescription();
        return;
      }
      if (issue.field === "price") {
        await suggestPrice();
      }
    },
    [improveDescription, improveTitle, suggestPrice],
  );

  return {
    titlePack,
    dismissTitlePack,
    descPreview,
    applyDescPreview,
    dismissDescPreview,
    titleImprovePreview,
    applyTitleImprovePreview,
    dismissTitleImprovePreview,
    descImprovePreview,
    applyDescImprovePreview,
    dismissDescImprovePreview,
    categoryApplyPreview,
    selectCategoryPreview,
    applyCategoryPreview,
    dismissCategoryPreview,
    clearInlineAiPreviews,
    priceBlock,
    dismissPriceBlock,
    categoryOptions,
    score,
    issues,
    catalogHrefFromCategory,
    titlesLoading,
    descLoading,
    priceLoading,
    categoryLoading,
    scoreLoading,
    busyKey,
    lastError,
    setLastError,
    guard,
    onBlocked,
    generateTitles,
    applyTitle,
    generateDescription,
    improveTitle,
    improveDescription,
    suggestPrice,
    applyRecommendedPrice,
    suggestCategory,
    applyCategory,
    runDetect,
    fixIssue,
  };
}
