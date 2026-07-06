import { Shimmer } from "./Shimmer";

/** Skeleton matching the shape of the dashboard content. */
export function DashboardSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Greeting */}
      <div className="space-y-2">
        <Shimmer className="h-7 w-48" />
        <Shimmer className="h-4 w-32" />
      </div>
      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3">
        <Shimmer className="h-24 rounded-xl" />
        <Shimmer className="h-24 rounded-xl" />
      </div>
      {/* Subject cards */}
      <div className="space-y-3">
        <Shimmer className="h-4 w-28" />
        {[0, 1, 2].map((i) => (
          <Shimmer key={i} className="h-16 rounded-xl" />
        ))}
      </div>
      {/* Notes list */}
      <div className="space-y-3">
        <Shimmer className="h-4 w-24" />
        {[0, 1].map((i) => (
          <Shimmer key={i} className="h-14 rounded-xl" />
        ))}
      </div>
    </div>
  );
}