import { Skeleton } from "@/components/ui/skeleton";

export function GymDashboardSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Title */}
      <Skeleton className="h-9 w-20" />

      {/* Weekly Schedule */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-28" />
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px] rounded-lg" />
          ))}
        </div>
      </div>

      {/* Today's Workout */}
      <Skeleton className="h-[120px] rounded-xl" />

      {/* Heatmap */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-[108px] w-full rounded-lg" />
      </div>

      {/* Stats */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-16" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[100px] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
