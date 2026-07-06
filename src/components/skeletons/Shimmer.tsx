import { cn } from "@/lib/utils";

/** A single grey shimmer placeholder block. */
export function Shimmer({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-md", className)} />;
}