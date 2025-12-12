import { cn } from "@/lib/utils";
import { TitanButton } from "./Button";

interface TitanEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function TitanEmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className 
}: TitanEmptyStateProps) {
  return (
    <div className={cn("titan-empty flex flex-col items-center gap-3", className)}>
      {icon && (
        <div className="h-14 w-14 rounded-2xl bg-slate-100 grid place-items-center text-slate-400">
          {icon}
        </div>
      )}
      <div className="text-center space-y-1">
        <p className="font-semibold text-slate-900">{title}</p>
        {description && (
          <p className="titan-meta max-w-[280px]">{description}</p>
        )}
      </div>
      {action && (
        <TitanButton 
          variant="outline" 
          size="sm" 
          onClick={action.onClick}
          className="mt-2"
        >
          {action.label}
        </TitanButton>
      )}
    </div>
  );
}
