"use client";

import Image from "next/image";
import Link from "next/link";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { MarkerText } from "@/components/marker-text";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Marquee } from "@/components/ui/marquee";
import { FloatingLogo } from "@/components/floating-logo";

/* ── Platform logos for inline marquee ── */
function ZoomLogo() {
    return (
        <svg viewBox="0 0 100 28" fill="currentColor" className="h-4 w-auto">
            <text x="0" y="22" fontSize="20" fontWeight="700" letterSpacing="-0.5" style={{ fontFamily: "var(--font-geist-sans)" }}>Zoom</text>
        </svg>
    );
}
function TeamsLogo() {
    return (
        <svg viewBox="0 0 170 28" fill="currentColor" className="h-4 w-auto">
            <text x="0" y="22" fontSize="20" fontWeight="700" letterSpacing="-0.5" style={{ fontFamily: "var(--font-geist-sans)" }}>Microsoft Teams</text>
        </svg>
    );
}
function MeetLogo() {
    return (
        <svg viewBox="0 0 150 28" fill="currentColor" className="h-4 w-auto">
            <text x="0" y="22" fontSize="20" fontWeight="700" letterSpacing="-0.5" style={{ fontFamily: "var(--font-geist-sans)" }}>Google Meet</text>
        </svg>
    );
}
function DiscordLogo() {
    return (
        <svg viewBox="0 0 110 28" fill="currentColor" className="h-4 w-auto">
            <text x="0" y="22" fontSize="20" fontWeight="700" letterSpacing="-0.5" style={{ fontFamily: "var(--font-geist-sans)" }}>Discord</text>
        </svg>
    );
}
function WebexLogo() {
    return (
        <svg viewBox="0 0 100 28" fill="currentColor" className="h-4 w-auto">
            <text x="0" y="22" fontSize="20" fontWeight="700" letterSpacing="-0.5" style={{ fontFamily: "var(--font-geist-sans)" }}>Webex</text>
        </svg>
    );
}

const logos = [
    { name: "Zoom", icon: ZoomLogo },
    { name: "Microsoft Teams", icon: TeamsLogo },
    { name: "Google Meet", icon: MeetLogo },
    { name: "Discord", icon: DiscordLogo },
    { name: "Webex", icon: WebexLogo },
];

export function Hero() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"],
    });

    const heroY = useTransform(scrollYProgress, [0, 1], [0, -80]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

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
                                    <logo.icon />
                                </div>
                            ))}
                        </Marquee>
                    </div>
                </ScrollReveal>

                {/* Video Container */}
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
                        <div className="relative aspect-video w-full bg-slate-100/50">
                            <video autoPlay loop muted playsInline className="h-full w-full object-cover mix-blend-multiply" src="/clarity-demo-reel.mp4" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50/60 via-white/40 to-slate-50/60">
                                <div className="glass flex h-20 w-20 items-center justify-center rounded-2xl">
                                    <svg className="h-8 w-8 text-blue-500/50" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                    </svg>
                                </div>
                                <p className="text-annotation mt-4 text-base text-slate-400">
                                    Demo Reel — coming soon
                                </p>
                            </div>
                        </div>
                    </div>
                    <p className="text-annotation mt-4 text-center text-base text-slate-400">
                        ↑ real‑time audio correction in action
                    </p>
                </ScrollReveal>
            </motion.div>
        </section>
    );
}
