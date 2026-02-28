"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

interface MarkerTextProps {
    children: string;
    className?: string;
    delay?: number;
    as?: "h1" | "h2" | "h3" | "span";
}

/**
 * MarkerText — renders each character with SVG stroke→fill animation
 * simulating a whiteboard marker drawing letter-by-letter.
 * Words are wrapped as atomic units to prevent mid-word line breaks.
 */
export function MarkerText({
    children,
    className = "",
    delay = 0,
    as: Tag = "h2",
}: MarkerTextProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (isInView) setAnimate(true);
    }, [isInView]);

    const charDelay = 0.055;

    // Split into words to wrap as atomic units
    const words = children.split(" ");
    let globalCharIndex = 0;

    return (
        <div ref={ref} className={`relative inline-block ${className}`}>
            <Tag className="text-marker relative flex flex-wrap items-baseline justify-center gap-x-[0.15em] gap-y-1">
                {words.map((word, wi) => {
                    const wordStart = globalCharIndex;
                    globalCharIndex += word.length;
                    const wordChars = word.split("");

                    return (
                        /* Each word is nowrap so characters stay together */
                        <span key={`word-${wi}`} className="inline-flex items-baseline whitespace-nowrap">
                            {wordChars.map((char, ci) => {
                                const charIdx = wordStart + ci;
                                return (
                                    <span key={`${char}-${charIdx}`} className="relative inline-block">
                                        <svg
                                            viewBox="0 0 100 120"
                                            width="0.65em"
                                            height="0.78em"
                                            style={{ overflow: "visible", display: "inline-block" }}
                                        >
                                            <motion.text
                                                x="50"
                                                y="95"
                                                textAnchor="middle"
                                                fontSize="110"
                                                fontFamily="var(--font-permanent-marker, 'Permanent Marker'), cursive"
                                                fill="none"
                                                stroke="rgba(37, 99, 235, 0.9)"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                initial={{ strokeDasharray: 400, strokeDashoffset: 400, fillOpacity: 0 }}
                                                animate={
                                                    animate
                                                        ? { strokeDashoffset: 0, fillOpacity: 1, fill: "rgba(37, 99, 235, 0.9)" }
                                                        : { strokeDashoffset: 400, fillOpacity: 0 }
                                                }
                                                transition={{
                                                    strokeDashoffset: {
                                                        duration: 0.45,
                                                        delay: delay + charIdx * charDelay,
                                                        ease: [0.4, 0, 0.2, 1],
                                                    },
                                                    fillOpacity: {
                                                        duration: 0.25,
                                                        delay: delay + charIdx * charDelay + 0.22,
                                                        ease: "easeIn",
                                                    },
                                                    fill: {
                                                        duration: 0.25,
                                                        delay: delay + charIdx * charDelay + 0.22,
                                                        ease: "easeIn",
                                                    },
                                                }}
                                            >
                                                {char}
                                            </motion.text>
                                        </svg>
                                    </span>
                                );
                            })}
                        </span>
                    );
                })}
            </Tag>
        </div>
    );
}
