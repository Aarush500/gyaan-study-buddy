import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Mobile-app style page transition: slides in from the right on enter,
 * slides out to the right on exit. Snappy 280ms.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}