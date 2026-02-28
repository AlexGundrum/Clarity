"use client";

import { useRef, useState } from "react";
import { ScrollReveal } from "@/components/scroll-reveal";
import { MarkerText } from "@/components/marker-text";

export function BeforeAfter() {
    const [active, setActive] = useState<"before" | "after">("before");
    const beforeRef = useRef<HTMLVideoElement>(null);
    const afterRef = useRef<HTMLVideoElement>(null);

    function show(which: "before" | "after") {
        setActive(which);
        if (which === "before") {
            afterRef.current?.pause();
            beforeRef.current?.play();
        } else {
            beforeRef.current?.pause();
            afterRef.current?.play();
        }
    }

    return (
        <section className="relative px-4 py-24">
            <ScrollReveal className="mx-auto mb-16 max-w-2xl text-center">
                <p className="text-annotation mb-3 text-lg text-slate-400">
                    ↓ see the difference
                </p>
                <MarkerText as="h2" className="text-3xl sm:text-4xl md:text-5xl">
                    BEFORE &amp; AFTER
                </MarkerText>
                <p className="mt-4 text-base leading-relaxed text-slate-500">
                    The same speaker. The same moment. One with Clarity — one without.
                </p>
            </ScrollReveal>

            <div className="mx-auto max-w-5xl">
                {/* Toggle buttons */}
                <ScrollReveal className="mb-6 flex justify-center">
                    <div className="glass-heavy inline-flex rounded-full p-1">
                        <button
                            onClick={() => show("before")}
                            className={`rounded-full px-7 py-2.5 text-sm font-semibold transition-all duration-300 ${
                                active === "before"
                                    ? "bg-slate-800 text-white shadow-md"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            Without Clarity
                        </button>
                        <button
                            onClick={() => show("after")}
                            className={`rounded-full px-7 py-2.5 text-sm font-semibold transition-all duration-300 ${
                                active === "after"
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                                    : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            With Clarity ✦
                        </button>
                    </div>
                </ScrollReveal>

                {/* Video frame */}
                <ScrollReveal scale>
                    <div className="glass-heavy glow-frame relative overflow-hidden rounded-2xl">
                        {/* Titlebar */}
                        <div className="flex items-center gap-2 border-b border-slate-200/40 px-5 py-3">
                            <div className="h-3 w-3 rounded-full bg-red-400/50" />
                            <div className="h-3 w-3 rounded-full bg-yellow-400/50" />
                            <div className="h-3 w-3 rounded-full bg-green-400/50" />
                            <span className="ml-3 font-mono text-[11px] tracking-wider text-slate-400">
                                clarity —{" "}
                                {active === "before" ? "raw input" : "corrected output"}
                            </span>
                            {active === "after" && (
                                <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-0.5 font-mono text-[10px] font-semibold text-blue-600 uppercase tracking-widest">
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                                    AI corrected
                                </span>
                            )}
                            {active === "before" && (
                                <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-0.5 font-mono text-[10px] font-semibold text-red-500 uppercase tracking-widest">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                                    unprocessed
                                </span>
                            )}
                        </div>

                        {/* Videos stacked, only active is visible */}
                        <div className="relative aspect-video w-full bg-slate-900">
                            <video
                                ref={beforeRef}
                                src="/demo-videos/before.mp4"
                                loop
                                playsInline
                                autoPlay
                                muted
                                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                                    active === "before" ? "opacity-100" : "opacity-0 pointer-events-none"
                                }`}
                            />
                            <video
                                ref={afterRef}
                                src="/demo-videos/after.mp4"
                                loop
                                playsInline
                                muted
                                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                                    active === "after" ? "opacity-100" : "opacity-0 pointer-events-none"
                                }`}
                            />

                            {/* Label badge on video */}
                            <div className="absolute top-4 left-4">
                                {active === "before" ? (
                                    <span className="rounded-lg bg-slate-900/80 backdrop-blur px-3 py-1.5 text-xs font-semibold text-red-400 border border-red-400/20">
                                        ✕ Stuttering detected
                                    </span>
                                ) : (
                                    <span className="rounded-lg bg-slate-900/80 backdrop-blur px-3 py-1.5 text-xs font-semibold text-blue-400 border border-blue-400/20">
                                        ✦ Clarity corrected
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </ScrollReveal>

                {/* Transcript comparison */}
                <ScrollReveal delay={0.2} className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className={`glass rounded-xl p-5 transition-all duration-300 ${active === "before" ? "ring-1 ring-red-300/50" : "opacity-60"}`}>
                        <p className="text-annotation mb-2 text-xs font-semibold text-red-500 uppercase tracking-widest">
                            Raw transcript
                        </p>
                        <p className="text-sm leading-relaxed text-slate-600 font-mono">
                            &ldquo;I, I was really hoping to wa-walk you through, through our project Clarity. It, it&apos;s a complex system, but I&rdquo;
                        </p>
                    </div>
                    <div className={`glass rounded-xl p-5 transition-all duration-300 ${active === "after" ? "ring-1 ring-blue-300/50" : "opacity-60"}`}>
                        <p className="text-annotation mb-2 text-xs font-semibold text-blue-500 uppercase tracking-widest">
                            Clarity output
                        </p>
                        <p className="text-sm leading-relaxed text-slate-600 font-mono">
                            &ldquo;I was really hoping to walk you through our project Clarity. It&apos;s a complex system, but I&rdquo;
                        </p>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}
