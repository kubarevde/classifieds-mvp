import { cva, type VariantProps } from "class-variance-authority";
import { HTMLAttributes, forwardRef } from "react";

import { cn } from "@/components/ui/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-slate-900 text-white",
        secondary: "border-transparent bg-slate-100 text-slate-800",
        outline: "border-slate-200 bg-white text-slate-700",
        destructive: "border-transparent bg-rose-600 text-white",
      },
      size: {
        sm: "px-2 py-0.5 text-[11px]",
        md: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  },
);

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant, size }), className)} {...props} />
  ),
);

Badge.displayName = "Badge";
