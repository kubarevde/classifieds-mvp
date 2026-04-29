import { mockSearchIntentService } from "./mock";

export type { SearchIntentService } from "./types";

export const getSearchIntentFromFilters = mockSearchIntentService.fromFilters.bind(mockSearchIntentService);
export const getStoreSearchIntentFromFilters = mockSearchIntentService.fromStoreFilters.bind(mockSearchIntentService);
export const getSearchIntentFromNaturalLanguage =
  mockSearchIntentService.fromNaturalLanguage.bind(mockSearchIntentService);
export const getSearchIntentFromImageSearch = mockSearchIntentService.fromImageSearch.bind(mockSearchIntentService);

export { mockSearchIntentService };
