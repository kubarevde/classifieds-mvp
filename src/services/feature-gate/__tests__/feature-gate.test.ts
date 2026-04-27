import { describe, expect, it } from "vitest";

import { createMockFeatureGateService } from "../mock";

describe("createMockFeatureGateService", () => {
  it("allows listing_create for a buyer on the demo (free-tier) plan", () => {
    const gate = createMockFeatureGateService(
      { isPro: false, planName: "demo", storePlan: "basic" },
      "buyer",
    );
    expect(gate.canUse("listing_create")).toBe(true);
  });

  it("allows auction_create for a seller on the Pro store plan", () => {
    const gate = createMockFeatureGateService(
      { isPro: false, planName: "demo", storePlan: "pro" },
      "seller",
    );
    expect(gate.canUse("auction_create")).toBe(true);
  });

  it("denies auction_create for buyer without Pro", () => {
    const gate = createMockFeatureGateService(
      { isPro: false, planName: "demo", storePlan: "basic" },
      "buyer",
    );
    expect(gate.canUse("auction_create")).toBe(false);
  });

  it("allows auction_create for buyer with Pro", () => {
    const gate = createMockFeatureGateService(
      { isPro: true, planName: "pro", storePlan: "basic" },
      "buyer",
    );
    expect(gate.canUse("auction_create")).toBe(true);
  });
});
