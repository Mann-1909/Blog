"use client";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

interface TypewriterProps {
  text: string;
  style:string
}

export default function Typewriter2({ text, style }: TypewriterProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  
  // Slice the text from 0 to the current count
  const displayText = useTransform(rounded, (latest) =>
    text.slice(0, latest)
  );

  useEffect(() => {
    // Animate count from 0 to the full length of the text
    const controls = animate(count, text.length, {
      type: "tween",
      duration: 1.5, // How long the typing takes (adjust as needed)
      ease: "linear", // "linear" makes it look more like a robot/typewriter
      // We REMOVED 'repeat', 'repeatType', and 'onUpdate'
    });
    
    return controls.stop;
  }, [text.length]); // Add text.length to dependencies so it recalculates if text changes

  return (
    <span className={style}>
      <motion.span>{displayText}</motion.span>
      {/* The Cursor (still blinks forever) */}
      <motion.div
        animate={{ opacity: [0, 1, 0] }}
        transition={{
            duration: 0.8,
            repeat: 2,
            ease: "linear",
        }}
        // className="w-0.5 h-10 bg-white ml-1 inline-block"
      />
    </span>
  );
}