import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99]",
  {
    variants: {
      variant: {
        primary: "bg-slate-900 text-white hover:bg-slate-700",
        secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        outline: "border border-slate-200 bg-transparent text-slate-800 hover:bg-slate-50",
        ghost: "text-slate-700 hover:bg-slate-100",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-5 text-base",
        iconSm: "h-8 w-8 shrink-0 p-0",
        iconMd: "h-9 w-9 shrink-0 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
