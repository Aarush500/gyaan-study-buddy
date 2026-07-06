import { Shimmer } from "./Shimmer";

/** Skeleton matching the shape of a chapter's notes. */
export function ChapterSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Title */}
      <Shimmer className="h-8 w-3/4" />
      {/* Tags */}
      <div className="flex gap-2">
        <Shimmer className="h-6 w-20 rounded-full" />
        <Shimmer className="h-6 w-24 rounded-full" />
        <Shimmer className="h-6 w-16 rounded-full" />
      </div>
      {/* Summary */}
      <div className="space-y-2">
        <Shimmer className="h-4 w-full" />
        <Shimmer className="h-4 w-full" />
        <Shimmer className="h-4 w-5/6" />
      </div>
      {/* Key points */}
      <div className="space-y-3">
        <Shimmer className="h-5 w-32" />
        {[0, 1, 2, 3].map((i) => (
          <Shimmer key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}