"use client";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react"; // Changed useState to useRef
interface textProps {
    texts: string[];
}
export default function Typewriter1({ texts }: textProps) {
  const textIndex = useMotionValue(0);

  const baseText = useTransform(textIndex, (latest) => texts[latest] || "");
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const displayText = useTransform(rounded, (latest) =>
    baseText.get().slice(0, latest)
  );
  
  // FIXED: Use useRef to track logic without re-rendering
  const updatedThisRound = useRef(true);

  useEffect(() => {
    const controls = animate(count, 60, {
      type: "tween",
      duration: 1,
      ease: "easeIn",
      repeat: Infinity,
      repeatType: "reverse",
      repeatDelay: 0.5,
      onUpdate(latest) {
        // FIXED: Access .current instead of state
        if (updatedThisRound.current === true && latest > 0) {
          updatedThisRound.current = false;
        } else if (updatedThisRound.current === false && latest === 0) {
          if (textIndex.get() === texts.length - 1) {
            textIndex.set(0);
          } else {
            textIndex.set(textIndex.get() + 1);
          }
          updatedThisRound.current = true;
        }
      }
    });
    return controls.stop;
  }, []); // Dependencies are safely empty now

  return (
    <span className="inline-flex items-center text-cyan-400 font-bold text-4xl">
      <motion.span>{displayText}</motion.span>
      <motion.div
        animate={{ opacity: [0, 1, 0] }}
        transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "linear",
        }}
        className="w-0.5 h-10 bg-white ml-1 inline-block"
      />
    </span>
  );
}