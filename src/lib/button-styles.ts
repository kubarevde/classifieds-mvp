import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99]",
  {
    variants: {
      variant: {
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500",
        secondary:
          "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 focus-visible:ring-slate-400",
        outline:
          "border border-slate-300 bg-transparent text-slate-800 hover:bg-slate-50 focus-visible:ring-slate-400",
        ghost: "text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400",
        destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
      },
      size: {
        sm: "h-11 min-h-[44px] px-3 text-sm",
        md: "h-11 min-h-[44px] px-4 text-sm",
        lg: "h-12 min-h-[48px] px-5 text-base",
        iconSm: "h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 p-0",
        iconMd: "h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
