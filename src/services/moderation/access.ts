import { canAccessModerationPersona, defaultAdminPersonaFromDemoRole } from "@/lib/admin-access";
import type { DemoRoleId } from "@/lib/demo-role-constants";
import { DEFAULT_DEMO_ROLE } from "@/lib/demo-role-constants";

function normalizeDemoRole(role?: string | null): DemoRoleId {
  if (role === "guest" || role === "buyer" || role === "seller" || role === "all") {
    return role;
  }
  return DEFAULT_DEMO_ROLE;
}

/** Mock gate: персона консоли из демо-роли (см. `defaultAdminPersonaFromDemoRole`). */
export function canAccessModerationConsole(user: { role?: string | null } | null | undefined): boolean {
  const persona = defaultAdminPersonaFromDemoRole(normalizeDemoRole(user?.role));
  return canAccessModerationPersona(persona);
}

