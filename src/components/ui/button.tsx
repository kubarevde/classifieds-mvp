"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import {
  ButtonHTMLAttributes,
  forwardRef,
  ReactNode,
} from "react";

import { cn } from "@/components/ui/cn";

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

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
  };

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading,
      disabled,
      leftIcon,
      rightIcon,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
