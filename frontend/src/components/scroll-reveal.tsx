"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

type Direction = "up" | "down" | "left" | "right" | "none";

interface ScrollRevealProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
    direction?: Direction;
    distance?: number;
    scale?: boolean;
    once?: boolean;
}

const directionOffset: Record<Direction, { x: number; y: number }> = {
    up: { x: 0, y: 1 },
    down: { x: 0, y: -1 },
    left: { x: 1, y: 0 },
    right: { x: -1, y: 0 },
    none: { x: 0, y: 0 },
};

/**
 * ScrollReveal — wraps children with a viewport-triggered entrance animation.
 * Supports fade-up, fade-down, fade-left, fade-right, and scale effects.
 */
export function ScrollReveal({
    children,
    className = "",
    delay = 0,
    duration = 0.6,
    direction = "up",
    distance = 30,
    scale = false,
    once = true,
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once, margin: "-60px" });

    const offset = directionOffset[direction];

    return (
        <motion.div
            ref={ref}
            className={className}
            initial={{
                opacity: 0,
                x: offset.x * distance,
                y: offset.y * distance,
                scale: scale ? 0.95 : 1,
            }}
            animate={
                isInView
                    ? { opacity: 1, x: 0, y: 0, scale: 1 }
                    : {
                        opacity: 0,
                        x: offset.x * distance,
                        y: offset.y * distance,
                        scale: scale ? 0.95 : 1,
                    }
            }
            transition={{
                duration,
                delay,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
        >
            {children}
        </motion.div>
    );
}
