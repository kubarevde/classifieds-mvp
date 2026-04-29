export function canAccessModerationConsole(user: { role?: string | null } | null | undefined): boolean {
  // Mock gate: in demo mode role=all acts as internal moderator.
  return user?.role === "all" || user?.role === "admin" || user?.role === "moderator";
}

