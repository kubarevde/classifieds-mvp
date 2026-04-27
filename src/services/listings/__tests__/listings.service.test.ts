import { describe, expect, it } from "vitest";

import { unifiedCatalogListings } from "@/lib/listings.data";

import { mockListingsService } from "../mock";

describe("mockListingsService", () => {
  it("getAll returns an array of listings", async () => {
    const all = await mockListingsService.getAll();
    expect(Array.isArray(all)).toBe(true);
    expect(all.length).toBeGreaterThan(0);
  });

  it("getById returns the listing with the given id", async () => {
    const known = unifiedCatalogListings[0];
    const found = await mockListingsService.getById(known.id);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(known.id);
    expect(found?.title).toBe(known.title);
  });

  it("getById returns null when id is unknown", async () => {
    const found = await mockListingsService.getById("__no_such_listing__");
    expect(found).toBeNull();
  });
});
