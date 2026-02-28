"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Droplet {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
}

export function CondensationDroplets() {
  const [droplets, setDroplets] = useState<Droplet[]>([]);

  useEffect(() => {
    // Generate visible water droplets on glass proliferated across page
    const newDroplets: Droplet[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 12,
      duration: 3 + Math.random() * 4,
      size: 4 + Math.random() * 6,
    }));
    setDroplets(newDroplets);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Water droplets dripping down glass - more visible */}
      {droplets.map((droplet) => (
        <motion.div
          key={droplet.id}
          className="absolute rounded-full bg-white/60"
          style={{
            left: `${droplet.x}%`,
            top: 0,
            width: droplet.size,
            height: droplet.size * 3,
            filter: "blur(0.5px)",
            boxShadow: "inset 0 1px 3px rgba(255,255,255,0.7), 0 2px 4px rgba(0,0,0,0.15)",
            willChange: "transform, opacity",
          }}
          animate={{
            y: ["0vh", "100vh"],
            opacity: [0, 0.8, 0.7, 0],
            scaleY: [1, 1.3, 1.8, 1.5],
          }}
          transition={{
            duration: droplet.duration,
            delay: droplet.delay,
            repeat: Infinity,
            ease: "easeIn",
          }}
        />
      ))}

      {/* Visible glass layer effect */}
      <div 
        className="absolute inset-0 bg-white/10"
        style={{
          backdropFilter: "blur(1px)",
        }}
      />
    </div>
  );
}
