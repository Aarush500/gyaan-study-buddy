import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { AnimatedProgress } from "@/components/motion/AnimatedProgress";

const MESSAGES = [
  "Reading the NCERT textbook so you don't have to...",
  "Adding Indian examples your teacher never thought of...",
  "Making sure every concept actually makes sense...",
  "Writing exam tips that actually help...",
  "Almost done — this chapter is going to be different from anything you've read before...",
  "Adding memory tricks, diagram descriptions, and quick checks...",
  "Quality checking everything before showing you...",
];

/** Dedicated "Cooking up your notes" screen with rotating messages + smooth progress. */
export function GeneratingNotes() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 5000);
    // Rise quickly to 90%, then crawl for the verification step — never jumpy.
    const progTimer = setInterval(() => {
      setProgress((p) => {
        if (p >= 98) return 98;
        const step = p < 90 ? (90 - p) * 0.06 + 0.4 : 0.06;
        return Math.min(98, p + step);
      });
    }, 250);
    return () => {
      clearInterval(msgTimer);
      clearInterval(progTimer);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <motion.div
        animate={{ scale: [1, 1.12, 1], rotate: [0, 6, -6, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6"
      >
        <Sparkles className="w-8 h-8 text-primary" />
      </motion.div>
      <h2 className="font-display text-2xl font-extrabold mb-2">Cooking up your notes</h2>
      <div className="h-6 mb-6 text-muted-foreground">
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-sm"
          >
            {MESSAGES[msgIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="w-full max-w-xs">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}

// Re-export for callers that prefer the shared progress primitive.
export { AnimatedProgress };