"use client";

import { useRef, useEffect, useState } from "react";
import { useInView } from "framer-motion";
import { ScrollReveal } from "@/components/scroll-reveal";
import { MarkerText } from "@/components/marker-text";

interface StatProps {
    value: string;
    numericValue: number;
    prefix?: string;
    suffix?: string;
    label: string;
    delay?: number;
}

function AnimatedStat({ numericValue, prefix = "", suffix = "", label, delay = 0 }: StatProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (!isInView) return;

        const timeout = setTimeout(() => {
            const duration = 1500;
            const steps = 40;
            let step = 0;

            const interval = setInterval(() => {
                step++;
                const progress = step / steps;
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.min(numericValue, Math.round(eased * numericValue * 10) / 10);
                setDisplayValue(current);

                if (step >= steps) {
                    setDisplayValue(numericValue);
                    clearInterval(interval);
                }
            }, duration / steps);

            return () => clearInterval(interval);
        }, delay * 1000);

        return () => clearTimeout(timeout);
    }, [isInView, numericValue, delay]);

    const formatValue = (v: number) => {
        if (Number.isInteger(numericValue)) return Math.round(v).toString();
        return v.toFixed(1);
    };

    return (
        <div ref={ref} className="text-center">
            <div className="whitespace-nowrap text-4xl font-bold text-slate-800 sm:text-5xl md:text-6xl">
                <span className="text-blue-600/60">{prefix}</span>
                <span>{isInView ? formatValue(displayValue) : "0"}</span>
                <span className="text-blue-600/60">{suffix}</span>
            </div>
            <p className="mt-2 text-sm text-slate-500">{label}</p>
        </div>
    );
}

const stats = [
    { value: "< 2s", numericValue: 2, prefix: "< ", suffix: "s", label: "Processing latency" },
    { value: "99.2%", numericValue: 99.2, suffix: "%", label: "Stutter detection accuracy" },
    { value: "40+", numericValue: 40, suffix: "+", label: "Languages supported" },
    { value: "0", numericValue: 0, suffix: "", label: "Audience-visible artifacts" },
];

export function Stats() {
    return (
        <section className="relative px-4 py-24">
            <ScrollReveal className="mx-auto mb-16 max-w-3xl text-center">
                <p className="text-annotation mb-3 text-lg text-slate-400">
                    ↓ by the numbers
                </p>
                {/* Wider container so "BUILT TO PERFORM" fits on one line */}
                <div className="w-full">
                    <MarkerText as="h2" className="text-3xl sm:text-4xl md:text-5xl">
                        BUILT TO PERFORM
                    </MarkerText>
                </div>
            </ScrollReveal>

            <div className="glass-heavy mx-auto max-w-5xl p-10 sm:p-14">
                <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
                    {stats.map((stat, i) => (
                        <ScrollReveal key={stat.label} delay={i * 0.1}>
                            <AnimatedStat {...stat} delay={i * 0.15} />
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
