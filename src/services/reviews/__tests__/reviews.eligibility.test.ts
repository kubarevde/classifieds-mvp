import { describe, expect, it } from "vitest";

import { reviewsService } from "@/services/reviews";

describe("reviewsService.getReviewEligibility", () => {
  it("returns deal_not_found for unknown deal", () => {
    const el = reviewsService.getReviewEligibility("deal-does-not-exist", "buyer-dmitriy");
    expect(el.canReview).toBe(false);
    expect(el.reason).toBe("deal_not_found");
  });

  it("returns not_participant for outsider", () => {
    const el = reviewsService.getReviewEligibility("deal-demo-completed-mt", "buyer-maria");
    expect(el.canReview).toBe(false);
    expect(el.reason).toBe("not_participant");
  });

  it("returns deal_not_completed for active deal", () => {
    const el = reviewsService.getReviewEligibility("deal-demo-active-ad", "buyer-dmitriy");
    expect(el.canReview).toBe(false);
    expect(el.reason).toBe("deal_not_completed");
  });

  it("returns already_reviewed when author already has a row for deal (including removed)", () => {
    const el = reviewsService.getReviewEligibility("deal-rv-mod-only", "buyer-dmitriy");
    expect(el.canReview).toBe(false);
    expect(el.reason).toBe("already_reviewed");
  });

  it("allows buyer to review store when completed, eligible, and no prior review from buyer", () => {
    const el = reviewsService.getReviewEligibility("deal-demo-completed-ad2", "buyer-dmitriy");
    expect(el.canReview).toBe(true);
    expect(el.targetType).toBe("store");
    expect(el.targetId).toBe("alexey-drive");
  });

  it("allows seller to review buyer on completed eligible deal without prior seller review", () => {
    const el = reviewsService.getReviewEligibility("deal-rv-seed-1", "seller-account:alexey-drive");
    expect(el.canReview).toBe(true);
    expect(el.targetType).toBe("buyer");
    expect(el.targetId).toBe("buyer-anna");
  });
});
