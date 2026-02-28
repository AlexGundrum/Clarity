"use client";

import { motion } from "framer-motion";

export function Hero() {
    return (
        <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-20 pb-24">
            {/* Title Card — glass panel */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="mb-6 text-center"
            >
                {/* Annotation above the title */}
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-annotation mb-2 text-lg sm:text-xl"
                >
                    ↓ the future of voice communication
                </motion.p>

                {/* CLARITY marker text */}
                <h1 className="text-marker text-6xl sm:text-7xl md:text-8xl lg:text-9xl">
                    CLARITY
                </h1>
            </motion.div>

            {/* Subheadline */}
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                className="mt-2 max-w-2xl text-center text-lg leading-relaxed text-slate-500 sm:text-xl"
            >
                Enterprise AI middleware that corrects stutters, mutes vocal tics, and
                translates code-switching — all within a{" "}
                <span className="font-mono font-semibold text-slate-700">2‑second</span>{" "}
                buffer. Invisible to your audience.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
                className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
                {/* Primary CTA — solid blue */}
                <button className="rounded-full bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:bg-blue-700 hover:shadow-blue-700/25 hover:-translate-y-0.5">
                    Request Early Access
                </button>

                {/* Secondary CTA — glass ghost */}
                <button className="glass-subtle flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-blue-700 transition-all duration-300 hover:bg-white/40 hover:-translate-y-0.5">
                    <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                    Watch Demo
                </button>
            </motion.div>

            {/* Annotation near buttons */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="text-annotation mt-4 text-base text-slate-400"
            >
                — no download required, works in‑browser —
            </motion.p>

            {/* Video Container — "The TV Frame" */}
            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.9, delay: 0.5, ease: "easeOut" }}
                className="mt-14 w-full max-w-5xl px-4"
            >
                <div className="glass-heavy glow-frame relative overflow-hidden rounded-2xl">
                    {/* Top bar — window chrome */}
                    <div className="flex items-center gap-2 border-b border-slate-200/40 px-5 py-3">
                        <div className="h-3 w-3 rounded-full bg-red-400/50" />
                        <div className="h-3 w-3 rounded-full bg-yellow-400/50" />
                        <div className="h-3 w-3 rounded-full bg-green-400/50" />
                        <span className="ml-3 font-mono text-[11px] tracking-wider text-slate-400">
                            clarity — live session
                        </span>
                    </div>

                    {/* Video area */}
                    <div className="relative aspect-video w-full bg-slate-100/50">
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="h-full w-full object-cover mix-blend-multiply"
                            src="/clarity-demo-reel.mp4"
                            poster="/demo-poster.jpg"
                        />

                        {/* Fallback overlay when no video file exists */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50/60 via-white/40 to-slate-50/60">
                            <div className="glass flex h-20 w-20 items-center justify-center rounded-2xl">
                                <svg
                                    className="h-8 w-8 text-blue-500/50"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                </svg>
                            </div>
                            <p className="text-annotation mt-4 text-base text-slate-400">
                                Demo Reel — coming soon
                            </p>
                        </div>
                    </div>
                </div>

                {/* Annotation below the video */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                    className="text-annotation mt-4 text-center text-base text-slate-400"
                >
                    ↑ real‑time audio correction in action
                </motion.p>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="mt-14 flex flex-col items-center gap-2"
            >
                <span className="text-[11px] font-medium tracking-widest text-slate-300 uppercase">
                    Scroll
                </span>
                <div className="h-8 w-[1px] bg-gradient-to-b from-slate-300 to-transparent" />
            </motion.div>
        </section>
    );
}
