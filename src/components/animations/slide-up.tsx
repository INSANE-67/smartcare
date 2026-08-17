"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function SlideUp({
  children,
  delay = 0,
  duration = 0.5,
  yOffset = 20,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] as const }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
