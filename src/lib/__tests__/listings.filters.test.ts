import { describe, expect, it } from "vitest";

import {
  electronicsCatalogListings,
  jobsCatalogListings,
  unifiedCatalogListings,
} from "@/lib/listings.data";
import {
  filterAndSortUnifiedListings,
  formatPostedAt,
  getListingBadges,
  getWorldScopedListings,
} from "@/lib/listings.filters";
import {
  defaultSavedSearchFilters,
  parseFiltersFromSearchParams,
} from "@/lib/saved-searches";

describe("filterAndSortUnifiedListings", () => {
  it("returns empty array when no listing matches query", () => {
    const result = filterAndSortUnifiedListings(jobsCatalogListings, {
      query: "__no_match_xyz__",
      category: "all",
      location: "all",
      sortBy: "newest",
    });
    expect(result).toEqual([]);
  });

  it("filters by categoryId", () => {
    const electronics = getWorldScopedListings("electronics");
    const phonesOnly = filterAndSortUnifiedListings(electronics, {
      query: "",
      category: "phones",
      location: "all",
      sortBy: "newest",
    });
    expect(phonesOnly.length).toBeGreaterThan(0);
    expect(phonesOnly.every((l) => l.categoryId === "phones")).toBe(true);
  });

  it("filters by search query across title, description and categoryLabel", () => {
    const electronics = getWorldScopedListings("electronics");
    const withIphone = filterAndSortUnifiedListings(electronics, {
      query: "iphone",
      category: "all",
      location: "all",
      sortBy: "newest",
    });
    expect(withIphone.length).toBeGreaterThan(0);
    expect(
      withIphone.every((l) =>
        `${l.title} ${l.description} ${l.categoryLabel}`.toLowerCase().includes("iphone"),
      ),
    ).toBe(true);
  });

  it("filters by exact location", () => {
    const moscowJobs = filterAndSortUnifiedListings(jobsCatalogListings, {
      query: "",
      category: "all",
      location: "Москва",
      sortBy: "newest",
    });
    expect(moscowJobs).toHaveLength(1);
    expect(moscowJobs[0]?.location).toBe("Москва");
  });

  it("combines world-scoped catalog with filters (electronics context)", () => {
    const electronics = getWorldScopedListings("electronics");
    const filtered = filterAndSortUnifiedListings(electronics, {
      query: "macbook",
      category: "laptops",
      location: "all",
      sortBy: "newest",
    });
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((l) => l.world === "electronics")).toBe(true);
    expect(filtered.every((l) => l.categoryId === "laptops")).toBe(true);
  });

  it("sorts by price ascending", () => {
    const sorted = filterAndSortUnifiedListings(jobsCatalogListings, {
      query: "",
      category: "all",
      location: "all",
      sortBy: "price_asc",
    });
    expect(sorted.map((l) => l.priceValue)).toEqual([90000, 110000]);
  });

  it("sorts by price descending", () => {
    const sorted = filterAndSortUnifiedListings(jobsCatalogListings, {
      query: "",
      category: "all",
      location: "all",
      sortBy: "price_desc",
    });
    expect(sorted.map((l) => l.priceValue)).toEqual([110000, 90000]);
  });

  it("sorts by newest (postedAtIso descending)", () => {
    const sorted = filterAndSortUnifiedListings(jobsCatalogListings, {
      query: "",
      category: "all",
      location: "all",
      sortBy: "newest",
    });
    const t0 = new Date(sorted[0]!.postedAtIso).getTime();
    const t1 = new Date(sorted[1]!.postedAtIso).getTime();
    expect(t0).toBeGreaterThanOrEqual(t1);
  });

  it("trims query whitespace", () => {
    const electronics = electronicsCatalogListings;
    const q = filterAndSortUnifiedListings(electronics, {
      query: "  iphone  ",
      category: "all",
      location: "all",
      sortBy: "newest",
    });
    const noSpace = filterAndSortUnifiedListings(electronics, {
      query: "iphone",
      category: "all",
      location: "all",
      sortBy: "newest",
    });
    expect(q).toEqual(noSpace);
  });

  it("uses unified catalog when world is all", () => {
    const all = getWorldScopedListings("all");
    expect(all).toBe(unifiedCatalogListings);
    const subset = filterAndSortUnifiedListings(all, {
      query: "",
      category: "vacancies",
      location: "all",
      sortBy: "newest",
    });
    expect(subset.every((l) => l.categoryId === "vacancies")).toBe(true);
  });
});

describe("parseFiltersFromSearchParams", () => {
  it("returns null when no catalog URL keys are present", () => {
    expect(parseFiltersFromSearchParams(new URLSearchParams(""))).toBeNull();
    expect(parseFiltersFromSearchParams(new URLSearchParams("foo=bar"))).toBeNull();
  });

  it("parses valid parameters", () => {
    const params = new URLSearchParams(
      "world=electronics&q=ноут&category=laptops&location=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0&sort=price_asc&view=list",
    );
    expect(parseFiltersFromSearchParams(params)).toEqual({
      world: "electronics",
      query: "ноут",
      category: "laptops",
      location: "Москва",
      saleMode: "all",
      sortBy: "price_asc",
      view: "list",
    });
  });

  it("falls back for invalid world, sort and view", () => {
    const params = new URLSearchParams("world=unknown&sort=invalid&view=wide&q=test");
    expect(parseFiltersFromSearchParams(params)).toEqual({
      world: defaultSavedSearchFilters.world,
      query: "test",
      category: "all",
      location: "all",
      saleMode: "all",
      sortBy: defaultSavedSearchFilters.sortBy,
      view: defaultSavedSearchFilters.view,
    });
  });

  it("treats category all and location all as defaults", () => {
    const params = new URLSearchParams("world=jobs&category=all&location=all");
    expect(parseFiltersFromSearchParams(params)).toMatchObject({
      world: "jobs",
      category: "all",
      location: "all",
    });
  });

  it("keeps raw location when decodeURIComponent throws", () => {
    const params = new URLSearchParams();
    params.set("location", "%E0%A4%A"); // invalid UTF-8 sequence
    const parsed = parseFiltersFromSearchParams(params);
    expect(parsed).not.toBeNull();
    expect(parsed?.location).toBe("%E0%A4%A");
  });
});

describe("getListingBadges", () => {
  it("caps badges at two entries", () => {
    const listing = electronicsCatalogListings.find(
      (l) => l.world === "electronics" && l.priceValue <= 70000 && l.title.toLowerCase().includes("playstation"),
    );
    expect(listing).toBeDefined();
    const badges = getListingBadges(listing!);
    expect(badges.length).toBeLessThanOrEqual(2);
  });

  it("returns agriculture badges for low price in allowed city", () => {
    const listing = {
      id: "test-agri",
      title: "Урожай",
      price: "10 000 ₽",
      priceValue: 1000,
      location: "Москва",
      publishedAt: "Сегодня",
      postedAtIso: new Date().toISOString(),
      image: "x",
      condition: "new",
      description: "d",
      sellerName: "s",
      sellerPhone: "1",
      categoryId: "berries",
      categoryLabel: "Ягоды",
      world: "agriculture" as const,
      worldLabel: "Агро",
    };
    const badges = getListingBadges(listing);
    expect(badges.map((b) => b.id)).toEqual(["agri-price", "agri-near"]);
  });
});

describe("formatPostedAt", () => {
  it("formats ISO string in Russian locale", () => {
    const out = formatPostedAt("2026-04-20T12:00:00.000Z");
    expect(out).toMatch(/2026/);
    expect(out.length).toBeGreaterThan(5);
  });
});
