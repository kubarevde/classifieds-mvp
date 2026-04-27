import { describe, expect, it } from "vitest";

import {
  createDefaultSellerActivityState,
  parseStoredSellerActivity,
  sellerActivityStatesEqual,
} from "@/lib/seller-activity-storage";

describe("parseStoredSellerActivity", () => {
  it("returns defaults for null and empty string", () => {
    const a = parseStoredSellerActivity(null);
    const b = parseStoredSellerActivity("");
    expect(sellerActivityStatesEqual(a, b)).toBe(true);
    expect(a.messagesUnreadCount).toBeGreaterThanOrEqual(0);
    expect(a.notificationsUnreadCount).toBeGreaterThanOrEqual(0);
  });

  it("parses valid JSON", () => {
    const raw = JSON.stringify({ messagesUnreadCount: 3, notificationsUnreadCount: 7 });
    expect(parseStoredSellerActivity(raw)).toEqual({
      messagesUnreadCount: 3,
      notificationsUnreadCount: 7,
    });
  });

  it("falls back to defaults on invalid JSON", () => {
    const fallback = createDefaultSellerActivityState();
    const parsed = parseStoredSellerActivity("{not json");
    expect(sellerActivityStatesEqual(parsed, fallback)).toBe(true);
  });

  it("clamps negative and non-finite values", () => {
    const raw = JSON.stringify({
      messagesUnreadCount: -5,
      notificationsUnreadCount: Number.NaN,
    });
    const out = parseStoredSellerActivity(raw);
    expect(out.messagesUnreadCount).toBe(0);
    expect(Number.isFinite(out.notificationsUnreadCount)).toBe(true);
  });
});

describe("sellerActivityStatesEqual", () => {
  it("returns true only when both fields match", () => {
    expect(
      sellerActivityStatesEqual(
        { messagesUnreadCount: 1, notificationsUnreadCount: 2 },
        { messagesUnreadCount: 1, notificationsUnreadCount: 2 },
      ),
    ).toBe(true);
    expect(
      sellerActivityStatesEqual(
        { messagesUnreadCount: 1, notificationsUnreadCount: 2 },
        { messagesUnreadCount: 2, notificationsUnreadCount: 2 },
      ),
    ).toBe(false);
  });
});
