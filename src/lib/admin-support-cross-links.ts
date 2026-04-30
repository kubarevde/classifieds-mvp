/** Maps support mock `userId` (buyer raw id or storefront id) to admin users path. */
export function supportActorToAdminUserHref(userId: string): string {
  if (userId === "buyer-dmitriy") {
    return `/admin/users/${encodeURIComponent("buyer-account:buyer-dmitriy")}`;
  }
  return `/admin/users/${encodeURIComponent(`seller-account:${userId}`)}`;
}
