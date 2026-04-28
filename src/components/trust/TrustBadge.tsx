import { Award, BadgeCheck, BriefcaseBusiness, Clock3, ShieldCheck, Trophy } from "lucide-react";

import type { TrustBadge as TrustBadgeModel } from "@/entities/trust/model";

import { trustBadgeDescription } from "./trust-utils";

type TrustBadgeProps = {
  badge: TrustBadgeModel;
  compact?: boolean;
};

function BadgeIcon({ type }: { type: TrustBadgeModel["type"] }) {
  const className = "h-3.5 w-3.5";
  if (type === "identity_verified") return <ShieldCheck className={className} strokeWidth={1.6} />;
  if (type === "business_verified") return <BriefcaseBusiness className={className} strokeWidth={1.6} />;
  if (type === "top_rated") return <Trophy className={className} strokeWidth={1.6} />;
  if (type === "fast_response") return <Clock3 className={className} strokeWidth={1.6} />;
  if (type === "trusted_seller") return <BadgeCheck className={className} strokeWidth={1.6} />;
  return <Award className={className} strokeWidth={1.6} />;
}

export function TrustBadge({ badge, compact = false }: TrustBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white text-slate-700 ${
        compact ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      }`}
      title={trustBadgeDescription(badge.type)}
    >
      <BadgeIcon type={badge.type} />
      <span className="truncate">{badge.label}</span>
    </span>
  );
}
