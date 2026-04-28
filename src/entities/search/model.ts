export type SearchInputMode = "keyword" | "natural_language" | "image";
export type SearchTarget = "listing" | "store";

export type SearchAlertChannel = "off" | "push" | "email";

export interface SearchFilters {
  query?: string;
  categoryId?: string | null;
  location?: string | null;
  priceMin?: number | null;
  priceMax?: number | null;
  condition?: string[];
  sellerType?: string[];
  attributes?: Record<string, string | string[]>;
  photoOnly?: boolean;
}

export interface SearchIntentChip {
  key: string;
  label: string;
  value?: string;
}

export interface SearchIntent {
  id: string;
  target: SearchTarget;
  mode: SearchInputMode;
  rawQuery: string;
  normalizedQuery: string;
  filters: SearchFilters;
  chips: SearchIntentChip[];
  autoTitle: string;
  sort?: string;
  imageSearchMeta?: {
    imageUrl?: string;
    dominantTraits?: string[];
  };
  aiMeta?: {
    interpretedFromNaturalLanguage: boolean;
    extractedAttributes?: string[];
  };
}

export interface SearchAlertPreference {
  channel: SearchAlertChannel;
  enabled: boolean;
}

export interface SavedSearch {
  id: string;
  intent: SearchIntent;
  title?: string;
  alertPreference: SearchAlertPreference;
  createdAt: string;
  lastViewedAt?: string | null;
}

export interface SearchMatchSnapshot {
  searchId: string;
  totalMatches: number;
  newMatches: number;
  previewTitles: string[];
  checkedAt: string;
}
