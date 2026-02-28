"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function FloatingLogo() {
  return (
    <motion.div
      className="relative z-10"
      animate={{
        y: [0, -15, 5, -12, 0],
        x: [0, 60, -45, 55, 0],
        rotate: [0, 8, -6, 10, 0],
        scale: [1, 1.05, 0.98, 1.03, 1],
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <motion.div
        animate={{
          opacity: [0.85, 1, 0.8, 1, 0.85],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Image
          src="/logo.png"
          alt="Clarity mascot"
          width={220}
          height={220}
          className="h-56 w-56 object-contain drop-shadow-2xl"
          priority
          style={{
            filter: "drop-shadow(0 10px 40px rgba(37, 99, 235, 0.15))",
          }}
        />
      </motion.div>
    </motion.div>
  );
}
