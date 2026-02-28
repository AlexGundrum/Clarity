import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Permanent_Marker, Caveat } from "next/font/google";
import "./globals.css";
import { RainEffect } from "@/components/rain-effect/rain-effect";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const permanentMarker = Permanent_Marker({
  weight: "400",
  variable: "--font-permanent-marker",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clarity — Your Voice, Perfected",
  description:
    "Enterprise-grade AI middleware that corrects stutters, mutes vocal tics, and translates code-switching in real-time during video calls.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${permanentMarker.variable} ${caveat.variable} font-sans antialiased`}
      >
        {/* Glass whiteboard background */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          {/* Base: cool off-white with slight blue tint */}
          <div className="absolute inset-0 bg-[#eef4fb]" />

          {/* Radial gradient — stronger blue tint at center */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 30%, rgba(186,220,254,0.38) 0%, rgba(255,255,255,0) 65%)",
            }}
          />

          {/* Floating soft blobs for depth */}
          <div
            className="absolute -top-[20%] -left-[10%] h-[60vh] w-[60vh] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(147,197,253,0.22) 0%, transparent 70%)",
              animation: "float-blob 25s ease-in-out infinite",
            }}
          />
          <div
            className="absolute -right-[5%] top-[30%] h-[50vh] w-[50vh] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(196,181,253,0.14) 0%, transparent 70%)",
              animation: "float-blob 30s ease-in-out infinite reverse",
            }}
          />
          <div
            className="absolute bottom-[-10%] left-[40%] h-[45vh] w-[45vh] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(147,197,253,0.18) 0%, transparent 70%)",
              animation: "float-blob 20s ease-in-out infinite",
            }}
          />
          <div
            className="absolute -bottom-[10%] -right-[10%] h-[40vh] w-[40vh] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(186,220,254,0.15) 0%, transparent 70%)",
              animation: "float-blob 22s ease-in-out infinite 5s",
            }}
          />

          {/* Grid pattern — whiteboard feel */}
          <div
            className="absolute inset-0 opacity-[0.055]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,0,80,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,80,0.08) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
        </div>

        {/* Frosted glass overlay — the "layer between us and the page" */}
        <div className="glass-page-overlay" />

        {/* Glassmorphism rain effect */}
        <RainEffect />

        {children}
      </body>
    </html>
  );
}
