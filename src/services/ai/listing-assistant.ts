export type AIIssue = {
  field: "title" | "description" | "price" | "photos";
  severity: "warning" | "error" | "suggestion";
  message: string;
  fix?: string;
};

export type SnapAndFillCondition = "new" | "excellent" | "good" | "used";

export type SnapAndFillPrice = {
  min: number;
  max: number;
  recommended: number;
  reasoning: string;
};

export type SnapAndFillResult = {
  world: string;
  category: string;
  title: string;
  description: string;
  condition: SnapAndFillCondition;
  price: SnapAndFillPrice;
  tags: string[];
  confidence: number;
  needsClarification: boolean;
  clarificationQuestions?: string[];
};

export interface AIListingAssistant {
  generateTitle(params: {
    categoryId: string;
    worldId?: string;
    description?: string;
    photos?: string[];
  }): Promise<{ suggestions: string[]; confidence: number }>;

  generateDescription(params: {
    title: string;
    categoryId: string;
    condition?: string;
  }): Promise<{ text: string; highlights: string[] }>;

  suggestPrice(params: {
    title: string;
    categoryId: string;
    condition: string;
    location: string;
  }): Promise<{
    min: number;
    max: number;
    recommended: number;
    reasoning: string;
    comparables: number;
  }>;

  suggestCategory(params: { title: string; description: string }): Promise<
    { categoryId: string; worldId?: string; confidence: number }[]
  >;

  improveText(params: { text: string; type: "title" | "description" }): Promise<{ improved: string; changes: string[] }>;

  detectProblems(params: {
    title: string;
    description: string;
    price: number;
    categoryId: string;
  }): Promise<{ issues: AIIssue[]; score: number }>;

  snapAndFillFromPhotos(params: { photos: string[] }): Promise<SnapAndFillResult>;

  /** Анализ одного загруженного фото для тегов (per-listing, не каталог). */
  analyzePhotoForTags(params: { fileName: string; dataUrl?: string }): Promise<{
    detectedLabel: string;
    tags: string[];
  }>;
}

export { createListingAssistantMock, buildListingFromClarifications } from "@/services/ai/mock";
