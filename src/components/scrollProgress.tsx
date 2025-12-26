"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";

export default function ScrollProgress({ children }: { children: React.ReactNode }) {
  const contentRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: contentRef,
    // "start start" = 0% when top of content hits top of screen
    // "end end" = 100% when bottom of content hits bottom of screen
    offset: ["start start", "end end"] 
  });
  
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <>
      {/* The Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-blue-600 dark:bg-blue-400 origin-left z-50"
        style={{ scaleX }}
      />
      
      {/* The Content Being Tracked */}
      <div ref={contentRef} className="relative">
        {children}
      </div>
    </>
  );
}