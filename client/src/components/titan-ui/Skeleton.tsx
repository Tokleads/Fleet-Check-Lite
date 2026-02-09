import { cn } from "@/lib/utils";

function SkeletonBase({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-lg bg-slate-200", className)} />
  );
}

export function SkeletonText({ className, width = "w-full" }: { className?: string; width?: string }) {
  return <SkeletonBase className={cn("h-4", width, className)} />;
}

export function SkeletonCircle({ size = "h-20 w-20" }: { size?: string }) {
  return <SkeletonBase className={cn("rounded-full", size)} />;
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white rounded-xl border border-slate-200 p-6", className)}>
      <div className="flex items-center gap-3 mb-4">
        <SkeletonBase className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <SkeletonText width="w-24" />
          <SkeletonText width="w-16" />
        </div>
      </div>
      <SkeletonBase className="h-8 w-20" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        <SkeletonText width="w-1/4" />
        <SkeletonText width="w-1/4" />
        <SkeletonText width="w-1/4" />
        <SkeletonText width="w-1/4" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <SkeletonBase className="h-5 w-1/4" />
          <SkeletonBase className="h-5 w-1/4" />
          <SkeletonBase className="h-5 w-1/4" />
          <SkeletonBase className="h-5 w-1/4" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonComplianceScore() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <SkeletonBase className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <SkeletonText width="w-32" />
          <SkeletonText width="w-20" />
        </div>
      </div>
      <div className="flex justify-center mb-6">
        <SkeletonCircle size="h-32 w-32" />
      </div>
      <div className="space-y-3">
        <SkeletonBase className="h-3 w-full rounded-full" />
        <SkeletonBase className="h-3 w-full rounded-full" />
        <SkeletonBase className="h-3 w-full rounded-full" />
        <SkeletonBase className="h-3 w-full rounded-full" />
      </div>
    </div>
  );
}
