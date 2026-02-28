"use client";

import Image from "next/image";
import Link from "next/link";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { MarkerText } from "@/components/marker-text";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Marquee } from "@/components/ui/marquee";
import { FloatingLogo } from "@/components/floating-logo";
import { LiveTranscriptOverlay } from "@/components/live-transcript-overlay";

/* ── Platform logos for inline marquee ── */
function CUhackitLogo() {
    return (
        <svg viewBox="0 0 140 32" fill="none" className="h-6 w-auto">
            <rect x="4" y="6" width="20" height="20" rx="4" fill="#FF6B35" />
            <text x="8" y="22" fontSize="14" fontWeight="700" fill="white" style={{ fontFamily: "system-ui, -apple-system" }}>CU</text>
            <text x="30" y="21" fontSize="16" fontWeight="600" fill="currentColor" style={{ fontFamily: "system-ui, -apple-system" }}>hackit</text>
        </svg>
    );
}

const logos = [
    { name: "Zoom", src: "/logos/zoom-communications-logo.svg" },
    { name: "Microsoft Teams", src: "/logos/microsoft-teams-1.svg" },
    { name: "Google Meet", src: "/logos/google-meet-icon-2020-.svg" },
    { name: "Discord", src: "/logos/discord.svg" },
    { name: "CUhackit", icon: CUhackitLogo },
];

export function Hero() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"],
    });

    const heroY = useTransform(scrollYProgress, [0, 1], [0, -80]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 1]);

    return (
        <section
            ref={sectionRef}
            className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-28 pb-16"
        >
            <motion.div
                style={{ y: heroY, opacity: heroOpacity }}
                className="flex flex-col items-center"
            >
                {/* Annotation */}
                <ScrollReveal delay={0.05} className="mb-4">
                    <p className="text-annotation text-lg sm:text-xl">
                        ↓ the future of voice communication
                    </p>
                </ScrollReveal>

                {/* Logo — big, centered right above CLARITY with floating animation */}
                <ScrollReveal delay={0.15} className="-mb-6 z-10">
                    <FloatingLogo />
                </ScrollReveal>

                {/* CLARITY — character-by-character marker drawing */}
                <MarkerText
                    as="h1"
                    className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl"
                    delay={0.3}
                >
                    CLARITY
                </MarkerText>

                {/* Subheadline */}
                <ScrollReveal delay={0.9} className="mt-5 max-w-2xl text-center">
                    <p className="text-lg leading-relaxed text-slate-500 sm:text-xl">
                        Enterprise AI middleware that corrects stutters, mutes vocal tics,
                        and translates code-switching — all within a{" "}
                        <span className="font-mono font-semibold text-slate-700">
                            2‑second
                        </span>{" "}
                        buffer.
                    </p>
                </ScrollReveal>

                {/* CTA Buttons */}
                <ScrollReveal delay={1.1} className="mt-8 flex flex-col gap-4 sm:flex-row">
                    <Link href="/dashboard" className="rounded-full bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:bg-blue-700 hover:shadow-blue-700/25 hover:-translate-y-0.5 text-center">
                        Try Dashboard
                    </Link>
                </ScrollReveal>

                {/* Marquee — on first screen */}
                <ScrollReveal delay={1.3} className="mt-10 w-full max-w-3xl">
                    <p className="text-annotation mb-3 text-center text-sm text-slate-400">
                        works with your existing stack
                    </p>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#f0f4f8] to-transparent" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#f0f4f8] to-transparent" />
                        <Marquee pauseOnHover className="[--duration:25s] [--gap:2.5rem]">
                            {logos.map((logo) => (
                                <div key={logo.name} className="flex items-center px-4 text-slate-300 transition-all duration-300 hover:text-slate-600">
                                    {logo.icon ? (
                                        <logo.icon />
                                    ) : (
                                        <Image src={logo.src!} alt={logo.name} width={120} height={32} className="h-8 w-auto" />
                                    )}
                                </div>
                            ))}
                        </Marquee>
                    </div>
                </ScrollReveal>

                {/* Video Container with Live Transcript Overlay */}
                <ScrollReveal delay={0.8} scale className="mt-10 w-full max-w-5xl px-4">
                    <div className="glass-heavy glow-frame relative overflow-hidden rounded-2xl">
                        <div className="flex items-center gap-2 border-b border-slate-200/40 px-5 py-3">
                            <div className="h-3 w-3 rounded-full bg-red-400/50" />
                            <div className="h-3 w-3 rounded-full bg-yellow-400/50" />
                            <div className="h-3 w-3 rounded-full bg-green-400/50" />
                            <span className="ml-3 font-mono text-[11px] tracking-wider text-slate-400">
                                clarity — live session
                            </span>
                        </div>
                        <div className="relative aspect-video w-full bg-slate-900">
                            <video 
                                autoPlay 
                                loop 
                                muted 
                                playsInline 
                                className="h-full w-full object-cover" 
                                src="/demo-videos/demovideo1.mp4" 
                            />
                            
                            {/* Transcript Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900/95 via-slate-900/80 to-transparent">
                                <div className="glass-heavy rounded-xl p-4 max-w-2xl">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-xs font-semibold text-white/90">LIVE TRANSCRIPTION</span>
                                    </div>
                                    <LiveTranscriptOverlay />
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            </motion.div>
        </section>
    );
}
