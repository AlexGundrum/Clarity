"use client";

import { MarkerText } from "@/components/marker-text";
import { ScrollReveal } from "@/components/scroll-reveal";

export function CtaSection() {
    return (
        <section className="relative px-4 py-32">
            <ScrollReveal scale className="mx-auto max-w-4xl">
                <div className="glass-heavy relative overflow-hidden p-12 text-center sm:p-16">
                    {/* Background gradient accent */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-violet-50/20" />

                    <div className="relative">
                        <p className="text-annotation mb-4 text-lg text-slate-400">
                            ↓ your move
                        </p>

                        {/* Fixed-width container ensures the phrase never wraps mid-word */}
                        <div className="mx-auto w-full max-w-3xl">
                            <MarkerText as="h2" className="text-4xl sm:text-5xl md:text-6xl">
                                READY TO BE HEARD?
                            </MarkerText>
                        </div>

                        <ScrollReveal delay={0.4} className="mx-auto mt-6 max-w-xl">
                            <p className="text-base leading-relaxed text-slate-500">
                                Join the private beta and experience what it feels like to
                                speak without hesitation. No hardware. No downloads. Just
                                your voice, perfected.
                            </p>
                        </ScrollReveal>

                        <ScrollReveal
                            delay={0.6}
                            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
                        >
                            <button className="whitespace-nowrap rounded-full bg-blue-600 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:bg-blue-700 hover:shadow-blue-700/25 hover:-translate-y-0.5">
                                Request Early Access
                            </button>
                            <button className="glass-subtle whitespace-nowrap rounded-full px-10 py-4 text-base font-semibold text-blue-700 transition-all duration-300 hover:bg-white/40 hover:-translate-y-0.5">
                                Schedule a Demo
                            </button>
                        </ScrollReveal>

                        <ScrollReveal delay={0.8}>
                            <p className="text-annotation mt-6 text-sm text-slate-400">
                                — no credit card · no commitment · instant setup —
                            </p>
                        </ScrollReveal>
                    </div>
                </div>
            </ScrollReveal>
        </section>
    );
}
