"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ScrollReveal } from "@/components/scroll-reveal";
import { MarkerText } from "@/components/marker-text";

const steps = [
    {
        number: "01",
        title: "Capture",
        description: "Audio is intercepted from the user's microphone and fed into a rolling 2-second broadcast buffer.",
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
        ),
        color: "text-blue-500",
        bg: "from-blue-100/50 to-blue-50/30",
    },
    {
        number: "02",
        title: "Analyze",
        description: "Gemini 2.0 Flash processes the buffered audio in real-time, detecting stutters, tics, or code-switched words.",
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
        ),
        color: "text-violet-500",
        bg: "from-violet-100/50 to-violet-50/30",
    },
    {
        number: "03",
        title: "Correct",
        description: "ElevenLabs Flash v2.5 synthesizes the corrected speech in the user's cloned voice with emotional matching.",
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
        ),
        color: "text-amber-500",
        bg: "from-amber-100/50 to-amber-50/30",
    },
    {
        number: "04",
        title: "Deliver",
        description: "The clean, corrected audio replaces the original in the outgoing stream — completely invisible to the audience.",
        icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
        ),
        color: "text-emerald-500",
        bg: "from-emerald-100/50 to-emerald-50/30",
    },
];

function ProgressLine() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start center", "end center"],
    });
    const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

    return (
        <div
            ref={ref}
            className="absolute left-8 top-0 bottom-0 hidden w-[2px] bg-slate-200/50 md:block"
        >
            <motion.div
                className="h-full w-full origin-top bg-gradient-to-b from-blue-500 via-violet-500 to-emerald-500"
                style={{ scaleY }}
            />
        </div>
    );
}

export function HowItWorks() {
    return (
        <section className="relative px-4 py-24">
            <ScrollReveal className="mx-auto mb-16 max-w-2xl text-center">
                <p className="text-annotation mb-3 text-lg text-slate-400">
                    ↓ under the hood
                </p>
                <MarkerText as="h2" className="text-3xl sm:text-4xl md:text-5xl">
                    HOW IT WORKS
                </MarkerText>
                <p className="mt-4 text-base leading-relaxed text-slate-500">
                    Four stages. Two seconds. Zero artifacts.
                </p>
            </ScrollReveal>

            <div className="relative mx-auto max-w-3xl">
                <ProgressLine />

                <div className="space-y-12 md:pl-20">
                    {steps.map((step, i) => (
                        <ScrollReveal key={step.number} delay={i * 0.1} direction="left">
                            <div className="glass group relative overflow-hidden p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
                                {/* Step number */}
                                <div className="mb-4 flex items-center gap-4">
                                    <span className="text-annotation text-3xl font-bold text-slate-300">
                                        {step.number}
                                    </span>
                                    <div className={`${step.color}`}>{step.icon}</div>
                                </div>

                                <h3 className="mb-2 text-xl font-semibold text-slate-800">
                                    {step.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-slate-500">
                                    {step.description}
                                </p>

                                {/* Background accent on hover */}
                                <div
                                    className={`absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t ${step.bg} opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-60`}
                                />
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
