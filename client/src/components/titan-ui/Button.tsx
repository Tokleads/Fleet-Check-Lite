import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface TitanButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  children: React.ReactNode;
}

const motionFast = { duration: 0.14, ease: [0.2, 0.8, 0.2, 1] as const };

const variants = {
  primary: "bg-primary text-primary-foreground shadow-sm hover:shadow-md active:shadow-sm",
  secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200/80 active:bg-slate-200",
  ghost: "hover:bg-slate-100 active:bg-slate-100 text-slate-700",
  destructive: "bg-red-500 text-white shadow-sm hover:bg-red-600 active:bg-red-600",
  outline: "border border-slate-200/80 bg-white shadow-sm hover:bg-slate-50 active:bg-slate-100 text-slate-700",
};

const sizes = {
  sm: "h-9 px-4 text-xs rounded-xl",
  md: "h-11 px-5 text-sm rounded-xl",
  lg: "h-14 px-6 text-base rounded-2xl",
  icon: "h-11 w-11 rounded-xl flex items-center justify-center",
};

export const TitanButton = React.forwardRef<HTMLButtonElement, TitanButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.99 }}
        transition={motionFast}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
          "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </motion.button>
    );
  }
);
TitanButton.displayName = "TitanButton";
