"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface MistParticle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
}

export function MistEffect() {
  const [particles, setParticles] = useState<MistParticle[]>([]);

  useEffect(() => {
    // Generate visible mist particles proliferated across page
    const newParticles: MistParticle[] = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: 120 + Math.random() * 180,
      duration: 15 + Math.random() * 10,
      delay: Math.random() * 10,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Visible glass fog proliferated across page */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white/30 blur-2xl"
          style={{
            left: `${particle.x}%`,
            width: particle.size,
            height: particle.size,
            willChange: "transform, opacity",
          }}
          animate={{
            y: ["100vh", "-20vh"],
            opacity: [0, 0.4, 0.5, 0.4, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
