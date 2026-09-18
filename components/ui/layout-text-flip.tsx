"use client";
import { cn } from "lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export const LayoutTextFlip = ({
  text = "Build Amazing",
  words = ["Landing Pages", "Component Blocks", "Page Sections", "3D Shaders"],
  duration = 2500,
}: {
  text: string;
  words: string[];
  duration?: number;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);

    return () => clearInterval(interval);
  }, [words.length, duration]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <motion.span
        layoutId="subtext"
        className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-4xl md:text-5xl"
      >
        {text}
      </motion.span>

      <motion.span
        layout
        className="relative w-fit overflow-hidden rounded-xl border border-red-500/20 bg-neutral-950/80 px-4 py-1.5 font-sans text-3xl font-extrabold tracking-tight text-white shadow-[0_0_25px_rgba(239,68,68,0.15)] ring-1 ring-white/10 drop-shadow-lg sm:text-4xl md:text-5xl"
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={currentIndex}
            initial={{ y: -35, filter: "blur(8px)", opacity: 0 }}
            animate={{
              y: 0,
              filter: "blur(0px)",
              opacity: 1,
            }}
            exit={{ y: 35, filter: "blur(8px)", opacity: 0 }}
            transition={{
              duration: 0.45,
              ease: "easeInOut",
            }}
            className={cn("inline-block whitespace-nowrap bg-gradient-to-r from-red-500 via-rose-500 to-red-600 bg-clip-text text-transparent")}
          >
            {words[currentIndex]}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </div>
  );
};