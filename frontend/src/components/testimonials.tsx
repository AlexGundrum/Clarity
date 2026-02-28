"use client";

import { ScrollReveal } from "@/components/scroll-reveal";
import { MarkerText } from "@/components/marker-text";

const testimonials = [
    {
        quote:
            "I've stuttered my entire life. Clarity gave me my first presentation where I wasn't thinking about every word before I said it. I just... spoke.",
        name: "Devon K.",
        role: "Software Engineer",
        annotation: "— neurodivergent talent retention",
        accent: "border-l-blue-400",
    },
    {
        quote:
            "As a multilingual executive, I sometimes slip into Spanish mid-sentence. Clarity catches it and translates seamlessly — my team in London never even notices.",
        name: "Alejandra M.",
        role: "VP of Product, Fortune 500",
        annotation: "— code-switching in real time",
        accent: "border-l-violet-400",
    },
    {
        quote:
            "We piloted Clarity across our DEI programs. Employees with Tourette's reported a 73% increase in willingness to turn their cameras on during meetings.",
        name: "James L.",
        role: "Head of People & Culture",
        annotation: "— measurable DEI impact",
        accent: "border-l-emerald-400",
    },
];

export function Testimonials() {
    return (
        <section className="relative px-4 py-24">
            <ScrollReveal className="mx-auto mb-16 max-w-2xl text-center">
                <p className="text-annotation mb-3 text-lg text-slate-400">
                    ↓ impact stories
                </p>
                <MarkerText as="h2" className="text-3xl sm:text-4xl md:text-5xl">
                    VOICES HEARD
                </MarkerText>
                <p className="mt-4 text-base leading-relaxed text-slate-500">
                    From the people who use Clarity every day.
                </p>
            </ScrollReveal>

            <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
                {testimonials.map((t, i) => (
                    <ScrollReveal key={t.name} delay={i * 0.15} direction="up">
                        <div
                            className={`glass group relative flex h-full flex-col overflow-hidden border-l-4 ${t.accent} p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]`}
                        >
                            {/* Quote icon */}
                            <svg
                                className="mb-4 h-6 w-6 text-slate-300"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.994 2.151C7.546 6.068 5.983 8.789 5.983 11h4v10H0z" />
                            </svg>

                            {/* Quote text */}
                            <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-600 italic">
                                &ldquo;{t.quote}&rdquo;
                            </p>

                            {/* Author */}
                            <div>
                                <p className="text-sm font-semibold text-slate-800">{t.name}</p>
                                <p className="text-xs text-slate-400">{t.role}</p>
                            </div>

                            {/* Annotation */}
                            <p className="text-annotation mt-3 text-xs">{t.annotation}</p>
                        </div>
                    </ScrollReveal>
                ))}
            </div>
        </section>
    );
}
