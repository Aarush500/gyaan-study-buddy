import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/** A button that scales to 97% on press and bounces back on release. */
export const PressButton = forwardRef<HTMLButtonElement, HTMLMotionProps<"button">>(
  ({ className, children, ...props }, ref) => (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  )
);
PressButton.displayName = "PressButton";

/** A tappable card: subtle background change + slight scale on press. */
export const PressCard = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  ({ className, children, ...props }, ref) => (
    <motion.div
      ref={ref}
      whileTap={{ scale: 0.985, backgroundColor: "hsl(var(--muted))" }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn("cursor-pointer", className)}
      {...props}
    >
      {children}
    </motion.div>
  )
);
PressCard.displayName = "PressCard";