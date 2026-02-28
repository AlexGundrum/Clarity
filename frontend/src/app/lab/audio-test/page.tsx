"use client";

import Link from "next/link";
import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Recorder } from "./recorder";

export default function AudioTestLabPage() {
  const [compareMode, setCompareMode] = useState(false);

  return (
    <main className="relative z-10 min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 pt-28 pb-16">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="font-mono text-2xl font-bold tracking-tight text-slate-800">
            Audio Lab
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Record, playback, and test audio for the one-shot pipeline
          </p>

          {/* A/B Comparison Mode toggle */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={compareMode}
              onClick={() => setCompareMode((c) => !c)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                compareMode ? "bg-blue-600" : "bg-slate-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                  compareMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-sm font-medium text-slate-700">
              A/B Comparison Mode
            </span>
          </div>

          <Link
            href="/"
            className="mt-4 inline-block text-sm text-blue-600 hover:underline"
          >
            ← Back to home
          </Link>
        </div>

        {/* Lab card */}
        <div className="glass relative overflow-hidden rounded-2xl p-8">
          <div className="mb-6 flex items-center gap-2">
            <span className="rounded bg-amber-100 px-2 py-0.5 font-mono text-xs text-amber-800">
              EXPERIMENTAL
            </span>
          </div>

          <Recorder compareMode={compareMode} />
        </div>
      </div>
    </main>
  );
}
