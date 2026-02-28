"use client";

import { Sidebar } from "@/components/sidebar";
import { VideoComparison } from "@/components/dashboard/video-comparison";
import { useState } from "react";
import dynamic from "next/dynamic";

const Recorder = dynamic(() => import("../lab/audio-test/recorder").then(mod => ({ default: mod.Recorder })), {
  ssr: false,
  loading: () => <div className="text-center text-slate-400">Loading audio recorder...</div>
});

const demoPairs = [
  {
    id: "demovid1",
    title: "Demo Video 1",
    before: "/demo-videos/demovid1_before.mp4",
    after: "/demo-videos/demovid1_after.mp4",
  },
  {
    id: "demovid2",
    title: "Demo Video 2",
    before: "/demo-videos/demovid2_before.mp4",
    after: "/demo-videos/demovid2_after.mp4",
  },
] as const;

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"audio" | "video">("audio");

  return (
    <main className="relative z-10 min-h-screen">
      <Sidebar />

      <div className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-marker text-4xl sm:text-5xl !text-blue-600/80">
            DASHBOARD
          </h1>
          <p className="text-annotation mt-2 text-lg text-slate-500">
            Test audio correction and view video demonstrations
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex gap-2">
          <button
            onClick={() => setActiveTab("audio")}
            className={`rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 ${
              activeTab === "audio"
                ? "glass-heavy text-blue-700 shadow-lg"
                : "glass-subtle text-slate-600 hover:bg-white/40"
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
              Audio Lab
            </div>
          </button>
          <button
            onClick={() => setActiveTab("video")}
            className={`rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 ${
              activeTab === "video"
                ? "glass-heavy text-blue-700 shadow-lg"
                : "glass-subtle text-slate-600 hover:bg-white/40"
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5" />
              </svg>
              Video Showcase
            </div>
          </button>
        </div>

        {/* Content Sections */}
        {activeTab === "audio" && (
          <div className="glass relative overflow-hidden rounded-2xl p-8">
            <div className="mb-6 flex items-center gap-2">
              <span className="rounded bg-amber-100 px-2 py-0.5 font-mono text-xs text-amber-800">
                AUDIO LAB
              </span>
            </div>
            
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Audio Correction Testing
              </h2>
              <p className="text-sm text-slate-500">
                Record your voice and test the real-time audio correction pipeline
              </p>
            </div>

            <Recorder compareMode={false} />
          </div>
        )}

        {activeTab === "video" && (
          <div className="space-y-8">
            <div className="glass relative overflow-hidden rounded-2xl p-8">
              <div className="mb-6 flex items-center gap-2">
                <span className="rounded bg-blue-100 px-2 py-0.5 font-mono text-xs text-blue-800">
                  VIDEO SHOWCASE
                </span>
              </div>
              
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  Clarity Session Demonstrations
                </h2>
                <p className="text-sm text-slate-500">
                  See how Clarity corrects speech in real-time with various camouflage modes
                </p>
              </div>

              {/* Video Comparison */}
              <VideoComparison
                beforeVideo="/demo-videos/demovideo1.mp4"
                fakeLagVideo="/demo-videos/fake-lag.mp4"
                pixelateVideo="/demo-videos/pixelate.mp4"
                museSyncVideo="/demo-videos/muse-sync.mp4"
              />
            </div>

            <div className="glass relative overflow-hidden rounded-2xl p-8">
              <div className="mb-6 flex items-center gap-2">
                <span className="rounded bg-indigo-100 px-2 py-0.5 font-mono text-xs text-indigo-800">
                  VIDEO LABS · BEFORE/AFTER
                </span>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Demo Clip Pairs
                </h3>
                <p className="text-sm text-slate-500">
                  Side-by-side raw vs Clarity-corrected outputs for Demo 1 and Demo 2.
                </p>
              </div>

              <div className="space-y-8">
                {demoPairs.map((demo) => (
                  <div key={demo.id} className="space-y-3">
                    <h4 className="text-sm font-semibold tracking-wide uppercase text-slate-600">
                      {demo.title}
                    </h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
                        <div className="px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800/80">
                          Before
                        </div>
                        <video
                          controls
                          playsInline
                          preload="metadata"
                          className="aspect-video w-full object-cover"
                          src={demo.before}
                        />
                      </div>

                      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
                        <div className="px-3 py-2 text-xs font-medium text-blue-200 bg-blue-900/50">
                          After (Clarity)
                        </div>
                        <video
                          controls
                          playsInline
                          preload="metadata"
                          className="aspect-video w-full object-cover"
                          src={demo.after}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
