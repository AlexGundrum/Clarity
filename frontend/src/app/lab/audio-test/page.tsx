"use client";

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Recorder } from "./recorder";

export default function AudioTestLabPage() {
  return (
    <main className="relative z-10 min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-2xl px-4 pt-28 pb-16">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="font-mono text-2xl font-bold tracking-tight text-slate-800">
            Audio Lab
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Record, playback, and test audio for the one-shot pipeline
          </p>
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

          <Recorder />
        </div>
      </div>
    </main>
  );
}
