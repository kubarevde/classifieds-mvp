export type { HomeCategory, HomeFeature, ListingDraft, ListingFilters, ListingsService } from "./types";

import {
  getHomeCategoriesMock,
  getHomeCategoriesMockSync,
  getHomeFeaturesMock,
  getHomeFeaturesMockSync,
  mockListingsService,
} from "./mock";

export const getListings = mockListingsService.getAll.bind(mockListingsService);
export const getListingById = mockListingsService.getById.bind(mockListingsService);
export const getListingsByWorld = mockListingsService.getByWorld.bind(mockListingsService);
export const getFeaturedListings = mockListingsService.getFeatured.bind(mockListingsService);
export const createListing = mockListingsService.create.bind(mockListingsService);
export const updateListing = mockListingsService.update.bind(mockListingsService);
export const deleteListing = mockListingsService.delete.bind(mockListingsService);
export const getHomeCategories = getHomeCategoriesMock;
export const getHomeFeatures = getHomeFeaturesMock;
export const getHomeCategoriesSync = getHomeCategoriesMockSync;
export const getHomeFeaturesSync = getHomeFeaturesMockSync;

export { mockListingsService };
