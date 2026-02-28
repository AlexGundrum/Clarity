"use client";

import { motion } from "framer-motion";
import { Marquee } from "@/components/ui/marquee";

/* ──────────────────────────────────────────────
   Platform logo wordmarks — light-mode slate
   ────────────────────────────────────────────── */

function ZoomLogo() {
    return (
        <svg viewBox="0 0 100 28" fill="currentColor" className="h-5 w-auto">
            <text x="0" y="22" fontSize="20" fontWeight="700" letterSpacing="-0.5" style={{ fontFamily: "var(--font-geist-sans)" }}>
                Zoom
            </text>
        </svg>
    );
}

function TeamsLogo() {
    return (
        <svg viewBox="0 0 170 28" fill="currentColor" className="h-5 w-auto">
            <text x="0" y="22" fontSize="20" fontWeight="700" letterSpacing="-0.5" style={{ fontFamily: "var(--font-geist-sans)" }}>
                Microsoft Teams
            </text>
        </svg>
    );
}

function MeetLogo() {
    return (
        <svg viewBox="0 0 150 28" fill="currentColor" className="h-5 w-auto">
            <text x="0" y="22" fontSize="20" fontWeight="700" letterSpacing="-0.5" style={{ fontFamily: "var(--font-geist-sans)" }}>
                Google Meet
            </text>
        </svg>
    );
}

function DiscordLogo() {
    return (
        <svg viewBox="0 0 110 28" fill="currentColor" className="h-5 w-auto">
            <text x="0" y="22" fontSize="20" fontWeight="700" letterSpacing="-0.5" style={{ fontFamily: "var(--font-geist-sans)" }}>
                Discord
            </text>
        </svg>
    );
}

function WebexLogo() {
    return (
        <svg viewBox="0 0 100 28" fill="currentColor" className="h-5 w-auto">
            <text x="0" y="22" fontSize="20" fontWeight="700" letterSpacing="-0.5" style={{ fontFamily: "var(--font-geist-sans)" }}>
                Webex
            </text>
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

export function Integrations() {
    return (
        <section className="relative py-16">
            {/* Gradient divider line */}
            <div className="gradient-line mx-auto mb-12 w-48" />

            {/* Section label */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
                className="mb-8 text-center"
            >
                <p className="text-annotation text-lg text-slate-400">
                    works with your existing stack ↓
                </p>
            </motion.div>

            {/* Marquee with fade edges */}
            <div className="relative">
                {/* Left fade */}
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-[#f8fafc] to-transparent" />
                {/* Right fade */}
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-[#f8fafc] to-transparent" />

                <Marquee pauseOnHover className="[--duration:30s] [--gap:3rem]">
                    {logos.map((logo) => (
                        <div
                            key={logo.name}
                            className="flex items-center gap-3 px-6 text-slate-300 transition-all duration-300 hover:text-slate-600"
                        >
                            <logo.icon />
                        </div>
                    ))}
                </Marquee>
            </div>
        </section>
    );
}
