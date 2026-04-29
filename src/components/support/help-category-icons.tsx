import type { LucideIcon } from "lucide-react";
import { CreditCard, FileText, HelpCircle, Shield, Store, User } from "lucide-react";

import type { HelpCategory } from "@/services/support";

const iconMap: Record<HelpCategory["icon"], LucideIcon> = {
  user: User,
  fileText: FileText,
  creditCard: CreditCard,
  shield: Shield,
  store: Store,
  helpCircle: HelpCircle,
};

export function HelpCategoryIcon({ icon, className }: { icon: HelpCategory["icon"]; className?: string }) {
  const Icon = iconMap[icon];
  return <Icon className={className} strokeWidth={1.6} aria-hidden />;
}
