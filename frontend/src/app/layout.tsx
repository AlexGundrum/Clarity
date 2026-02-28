import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Permanent_Marker, Caveat } from "next/font/google";
import "./globals.css";

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
          {/* Base: cool off-white */}
          <div className="absolute inset-0 bg-[#f8fafc]" />

          {/* Subtle radial gradient — blue tint at center */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(219,234,254,0.25) 0%, rgba(255,255,255,0) 65%)",
            }}
          />

          {/* Floating soft blobs for depth */}
          <div
            className="absolute -top-[20%] -left-[10%] h-[60vh] w-[60vh] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(191,219,254,0.15) 0%, transparent 70%)",
              animation: "float-blob 25s ease-in-out infinite",
            }}
          />
          <div
            className="absolute -right-[5%] top-[30%] h-[50vh] w-[50vh] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(196,181,253,0.08) 0%, transparent 70%)",
              animation: "float-blob 30s ease-in-out infinite reverse",
            }}
          />
          <div
            className="absolute bottom-[-10%] left-[40%] h-[45vh] w-[45vh] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(191,219,254,0.1) 0%, transparent 70%)",
              animation: "float-blob 20s ease-in-out infinite",
            }}
          />

          {/* Very subtle grid pattern — "whiteboard" feel */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {children}
      </body>
    </html>
  );
}
