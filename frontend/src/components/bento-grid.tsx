"use client";

import { motion } from "framer-motion";

const pillars = [
    {
        title: "Stutter Detection & Correction",
        tag: "2s buffer",
        annotation: "intercepts → predicts → re‑synthesizes",
        description:
            "Our AI intercepts speech blocks in real-time, predicts the intended sentence with Gemini, and outputs a fluid voice clone via ElevenLabs — all within a 2-second broadcast buffer.",
        icon: (
            <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                />
            </svg>
        ),
        accentColor: "text-blue-500",
        hoverBorder: "hover:border-blue-200/60",
        glowColor: "from-blue-100/40 to-blue-50/20",
    },
    {
        title: "Vocal Tic Neutralization",
        tag: "Hard-mute",
        annotation: "detect → mute → seamless",
        description:
            "Detects involuntary vocal sounds and instantly hard-mutes the outgoing audio stream for the duration of the tic — without disrupting video or breaking the conversation flow.",
        icon: (
            <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
                />
            </svg>
        ),
        accentColor: "text-violet-500",
        hoverBorder: "hover:border-violet-200/60",
        glowColor: "from-violet-100/40 to-violet-50/20",
    },
    {
        title: "Code-Switching Translation",
        tag: "Contextual",
        annotation: "detects foreign words → translates in‑context",
        description:
            "When a non-native speaker inserts a word from their native language mid-sentence, Clarity detects, translates contextually, and synthesizes the corrected sentence in their cloned voice.",
        icon: (
            <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802"
                />
            </svg>
        ),
        accentColor: "text-emerald-500",
        hoverBorder: "hover:border-emerald-200/60",
        glowColor: "from-emerald-100/40 to-emerald-50/20",
    },
];

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            delay: i * 0.15,
            ease: "easeOut" as const,
        },
    }),
};

export function BentoGrid() {
    return (
        <section className="relative px-4 py-24">
            {/* Section header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="mx-auto mb-16 max-w-2xl text-center"
            >
                <p className="text-annotation mb-3 text-lg text-slate-400">
                    ↓ how it works
                </p>
                <h2 className="text-marker text-3xl sm:text-4xl md:text-5xl">
                    THREE PILLARS
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-500">
                    Each module runs independently on your audio stream, ensuring zero
                    compounding latency.
                </p>
            </motion.div>

            {/* Grid */}
            <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
                {pillars.map((pillar, i) => (
                    <motion.div
                        key={pillar.title}
                        custom={i}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={cardVariants}
                        whileHover={{
                            y: -6,
                            transition: { duration: 0.25, ease: "easeOut" as const },
                        }}
                        className={`glass group relative flex flex-col overflow-hidden p-8 transition-all duration-300 ${pillar.hoverBorder}`}
                    >
                        {/* Icon + Tag row */}
                        <div className="mb-5 flex items-center justify-between">
                            <div className={pillar.accentColor}>{pillar.icon}</div>
                            <span className="glass-subtle inline-flex items-center rounded-full px-3 py-1 font-mono text-[10px] font-medium tracking-widest text-slate-400 uppercase">
                                {pillar.tag}
                            </span>
                        </div>

                        {/* Title */}
                        <h3 className="mb-2 text-lg font-semibold text-slate-800">
                            {pillar.title}
                        </h3>

                        {/* Annotation */}
                        <p className="text-annotation mb-3 text-sm">
                            {pillar.annotation}
                        </p>

                        {/* Description */}
                        <p className="text-sm leading-relaxed text-slate-500">
                            {pillar.description}
                        </p>

                        {/* Bottom gradient accent on hover */}
                        <div
                            className={`absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t ${pillar.glowColor} opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-60`}
                        />
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
