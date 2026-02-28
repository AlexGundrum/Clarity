"use client";

import { useEffect, useState } from "react";
import { AnimatedTranscript, TranscriptEdit } from "./animated-transcript";

export function LiveSessionDemo() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Mock transcript with stutters and code-switching
  const mockTranscript = "I was th-th-thinking we should use k-k-k kubernetes para el deployment";
  
  const mockEdits: TranscriptEdit[] = [
    {
      type: "stutter",
      original: "th-th-thinking",
      corrected: "thinking",
      position: 2,
    },
    {
      type: "filler",
      original: "k-k-k",
      corrected: "kubernetes",
      context: "Kubernetes meeting",
      position: 6,
    },
    {
      type: "translation",
      original: "para",
      corrected: "for",
      position: 8,
    },
  ];

  useEffect(() => {
    // Auto-restart animation when it completes
    const timer = setTimeout(() => {
      setIsVideoPlaying(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleTranscriptComplete = () => {
    // Loop the animation
    setTimeout(() => {
      setIsVideoPlaying(false);
      setTimeout(() => setIsVideoPlaying(true), 500);
    }, 2000);
  };

  return (
    <section className="relative py-20 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="text-marker text-3xl sm:text-4xl !text-blue-600/80 mb-4">
            SEE CLARITY IN ACTION
          </h2>
          <p className="text-annotation text-lg text-slate-500">
            Real-time speech correction with intelligent context awareness
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 items-start">
          {/* Live Transcription Overlay */}
          <div className="glass relative overflow-hidden rounded-2xl p-8 order-2 lg:order-1">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-semibold text-slate-700">LIVE TRANSCRIPTION</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Real-Time Corrections
              </h3>
              <p className="text-sm text-slate-500">
                Watch as Clarity detects and corrects speech issues instantly
              </p>
            </div>

            {/* Animated Transcript */}
            <div className="rounded-xl bg-white/50 p-6 backdrop-blur-sm border border-slate-200/50">
              {isVideoPlaying && (
                <AnimatedTranscript
                  transcript={mockTranscript}
                  edits={mockEdits}
                  speed={2}
                  autoPlay={true}
                  onComplete={handleTranscriptComplete}
                  showControls={false}
                />
              )}
            </div>

            {/* Detection Summary */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-red-50 p-3 text-center">
                <div className="text-2xl font-bold text-red-600">1</div>
                <div className="text-xs text-red-700">Stutter</div>
              </div>
              <div className="rounded-lg bg-blue-50 p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">1</div>
                <div className="text-xs text-blue-700">Context Fill</div>
              </div>
              <div className="rounded-lg bg-green-50 p-3 text-center">
                <div className="text-2xl font-bold text-green-600">1</div>
                <div className="text-xs text-green-700">Translation</div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="line-through text-red-500">Strikethrough</span>
                <span className="text-slate-500">= Removed stutter</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Highlight</span>
                <span className="text-slate-500">= Context-filled word</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="underline decoration-green-500 decoration-2">Underline</span>
                <span className="text-slate-500">= Translated word</span>
              </div>
            </div>
          </div>

          {/* Video Placeholder */}
          <div className="glass-heavy relative overflow-hidden rounded-2xl order-1 lg:order-2">
            <div className="flex items-center gap-2 border-b border-slate-200/40 px-5 py-3">
              <div className="h-3 w-3 rounded-full bg-red-400/50" />
              <div className="h-3 w-3 rounded-full bg-yellow-400/50" />
              <div className="h-3 w-3 rounded-full bg-green-400/50" />
              <span className="ml-3 font-mono text-[11px] tracking-wider text-slate-400">
                clarity — live session
              </span>
            </div>
            <div className="relative aspect-video w-full bg-slate-900">
              {/* Placeholder for video - will be replaced with actual video */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
                <div className="glass flex h-20 w-20 items-center justify-center rounded-2xl mb-4">
                  <svg className="h-10 w-10 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm text-slate-400 font-mono">Live Demo Video</p>
                <p className="text-xs text-slate-500 mt-2">Coming soon</p>
              </div>
              
              {/* Simulated waveform overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-end gap-1 h-12">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-blue-500/30 rounded-t"
                    style={{
                      height: `${Math.random() * 100}%`,
                      animation: `pulse ${1 + Math.random()}s ease-in-out infinite`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
