import type { ModerationQueueItem } from "@/services/moderation";

/** Demo buyer raw id — matches `buyer-account:` rows in admin users mock. */
const DEMO_BUYER_RAW_ID = "buyer-dmitriy";

/**
 * Maps moderation case target to an admin console path (mock-safe).
 * Returns null when there is no sensible admin entity (e.g. message thread).
 */
export function moderationTargetToAdminHref(
  targetType: ModerationQueueItem["targetType"],
  targetId: string,
): string | null {
  if (targetType === "message") {
    return null;
  }

  if (targetType === "listing") {
    const id = targetId.includes(":") ? (targetId.split(":").pop() ?? targetId) : targetId;
    return `/admin/listings/${encodeURIComponent(id)}`;
  }

  if (targetType === "store") {
    const id = targetId.startsWith("store:") ? targetId.slice("store:".length) : targetId;
    return `/admin/stores/${encodeURIComponent(id)}`;
  }

  if (targetType === "request") {
    const id = targetId.includes(":") ? (targetId.split(":").pop() ?? targetId) : targetId;
    return `/admin/requests/${encodeURIComponent(id)}`;
  }

  if (targetType === "user") {
    const raw = targetId.replace(/^(seller|buyer|user):/, "") || targetId;
    const adminUserId = raw === DEMO_BUYER_RAW_ID ? `buyer-account:${raw}` : `seller-account:${raw}`;
    return `/admin/users/${encodeURIComponent(adminUserId)}`;
  }

  return null;
}
