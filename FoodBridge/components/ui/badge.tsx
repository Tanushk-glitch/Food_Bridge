import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset", {
  variants: {
    variant: {
      default: "bg-primary/10 text-primary ring-primary/20",
      success: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-300",
      warning: "bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-300",
      info: "bg-sky-500/10 text-sky-600 ring-sky-500/20 dark:text-sky-300",
      subtle: "bg-white/50 text-foreground ring-white/20 dark:bg-white/5"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
