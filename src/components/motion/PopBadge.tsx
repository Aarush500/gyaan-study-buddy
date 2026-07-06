import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Badge that pops in with a quick scale spring when it first appears. */
export function PopBadge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.span
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 600, damping: 20 }}
      className={cn("inline-flex items-center", className)}
    >
      {children}
    </motion.span>
  );
}