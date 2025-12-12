import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface TitanCardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "flat" | "elevated" | "interactive";
}

const motionFast = { duration: 0.14, ease: [0.2, 0.8, 0.2, 1] as const };

const variants = {
  default: "rounded-2xl border border-slate-200/70 bg-white/90 shadow-[0_1px_1px_rgba(15,23,42,0.06),0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur supports-[backdrop-filter]:bg-white/75",
  flat: "rounded-2xl bg-slate-50/80 border-transparent",
  elevated: "rounded-2xl border-transparent bg-white shadow-[0_1px_2px_rgba(15,23,42,0.07),0_12px_28px_rgba(15,23,42,0.12)]",
  interactive: "rounded-2xl border border-slate-200/70 bg-white/90 shadow-[0_1px_1px_rgba(15,23,42,0.06),0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur cursor-pointer transition-all active:scale-[0.99] active:shadow-[0_1px_1px_rgba(15,23,42,0.06),0_6px_16px_rgba(15,23,42,0.10)] hover:bg-slate-50/60",
};

export const TitanCard = React.forwardRef<HTMLDivElement, TitanCardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={motionFast}
        className={cn(
          "overflow-hidden",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
TitanCard.displayName = "TitanCard";

export function TitanCardHeader({ className, children }: { className?: string, children: React.ReactNode }) {
  return <div className={cn("px-5 py-4 border-b border-slate-100", className)}>{children}</div>;
}

export function TitanCardContent({ className, children }: { className?: string, children: React.ReactNode }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}
