import React from "react";
import { cn } from "@/lib/utils";

interface TitanInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const TitanInput = React.forwardRef<HTMLInputElement, TitanInputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="t-cap ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "h-12 w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 text-[15px] font-medium text-slate-900 placeholder:text-slate-400 shadow-sm transition-all",
              "focus:outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary/40",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
              icon && "pl-11",
              error && "border-destructive ring-destructive/20",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-destructive ml-1">{error}</p>}
      </div>
    );
  }
);
TitanInput.displayName = "TitanInput";
