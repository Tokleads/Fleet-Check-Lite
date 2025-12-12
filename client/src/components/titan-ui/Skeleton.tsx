import { cn } from "@/lib/utils";

interface TitanSkeletonProps {
  className?: string;
  variant?: "text" | "card" | "circle" | "button";
}

export function TitanSkeleton({ className, variant = "text" }: TitanSkeletonProps) {
  const baseClass = "titan-skeleton animate-pulse";
  
  const variants = {
    text: "h-4 w-full rounded",
    card: "h-20 w-full rounded-2xl",
    circle: "h-11 w-11 rounded-full",
    button: "h-12 w-full rounded-xl",
  };
  
  return <div className={cn(baseClass, variants[variant], className)} />;
}

export function TitanCardSkeleton() {
  return (
    <div className="titan-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <TitanSkeleton variant="circle" />
        <div className="flex-1 space-y-2">
          <TitanSkeleton className="h-4 w-3/4" />
          <TitanSkeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function TitanListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <TitanCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TitanChecklistSkeleton() {
  return (
    <div className="space-y-3">
      <TitanSkeleton variant="card" className="h-16" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <TitanSkeleton key={i} variant="card" className="h-14" />
        ))}
      </div>
    </div>
  );
}
