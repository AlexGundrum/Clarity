"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function FloatingLogo() {
  return (
    <motion.div
      className="relative z-10"
      animate={{
        y: [0, -15, 0, -10, 0],
        x: [0, 10, -5, 8, 0],
        rotate: [0, 3, -2, 4, 0],
        scale: [1, 1.03, 0.98, 1.02, 1],
      }}
      transition={{
        duration: 25,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <motion.div
        animate={{
          opacity: [0.9, 1, 0.85, 1, 0.9],
        }}
        transition={{
          duration: 8,
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
