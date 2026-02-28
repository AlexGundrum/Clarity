"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function LiveTranscriptOverlay() {
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);

  const mockTranscript = "I was th-th-thinking we should use k-k-k kubernetes para el deployment";
  const words = mockTranscript.split(" ");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => {
        if (prev >= words.length - 1) {
          return -1; // Reset to loop
        }
        return prev + 1;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [words.length]);

  const getWordStyle = (word: string, index: number) => {
    // Stutter detection
    if (word.includes("th-th-")) {
      return "line-through text-red-400";
    }
    // Filler detection
    if (word.includes("k-k-k")) {
      return "bg-blue-500/30 text-blue-200 px-1 rounded";
    }
    // Translation detection
    if (word === "para") {
      return "underline decoration-green-400 decoration-2";
    }
    return "text-white/90";
  };

  return (
    <div className="text-sm leading-relaxed">
      {words.map((word, index) => {
        if (index > currentWordIndex) return null;
        
        return (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`inline-block mr-1.5 ${getWordStyle(word, index)}`}
          >
            {word}
          </motion.span>
        );
      })}
    </div>
  );
}
