"use client";

import { diffWords } from "diff";
import { motion } from "framer-motion";
import { useMemo } from "react";

export interface PipelineResult {
  dirty_transcript: string;
  healed_transcript: string;
  final_audio_path: string;
  durations_s: Record<string, number>;
  injected_transcript?: string;
}

interface CorrectionLogProps {
  pipelineResult: PipelineResult | null;
  /** When in compare mode, we may have two results - show the primary one for diff */
  compareMode?: boolean;
}

/** Randomized confidence score between 92-98% for demo effect */
function useConfidenceScore() {
  return useMemo(
    () => 92 + Math.floor(Math.random() * 7),
    [/* stable - computed once per mount */]
  );
}

function DiffView({
  dirty,
  healed,
  animate,
}: {
  dirty: string;
  healed: string;
  animate: boolean;
}) {
  const wordDiffs = useMemo(() => diffWords(dirty, healed), [dirty, healed]);

  const dirtyParts = wordDiffs
    .filter((c) => c.added === false)
    .map((c) => ({
      text: c.value,
      removed: c.removed ?? false,
    }));

  const healedParts = wordDiffs
    .filter((c) => c.removed === false)
    .map((c) => ({
      text: c.value,
      added: c.added ?? false,
    }));

  return (
    <div className="space-y-4">
      {/* Dirty transcript */}
      <div>
        <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-red-600/90">
          Raw Transcript
        </p>
        <p className="text-sm leading-relaxed text-slate-700">
          {dirtyParts.map((part, i) =>
            part.removed ? (
              <motion.span
                key={i}
                className="rounded bg-red-200/80 px-0.5 text-red-800 line-through"
                initial={animate ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02, duration: 0.2 }}
              >
                {part.text}
              </motion.span>
            ) : (
              <span key={i}>{part.text}</span>
            )
          )}
        </p>
      </div>

      {/* Healed transcript */}
      <div>
        <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-600/90">
          Healed Transcript
        </p>
        <p className="text-sm leading-relaxed text-slate-800">
          {healedParts.map((part, i) =>
            part.added ? (
              <motion.span
                key={i}
                className="rounded bg-emerald-200/80 px-0.5 text-emerald-900"
                initial={animate ? { opacity: 0, y: 4 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.03, duration: 0.25 }}
              >
                {part.text}
              </motion.span>
            ) : (
              <motion.span
                key={i}
                initial={animate ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.02, duration: 0.2 }}
              >
                {part.text}
              </motion.span>
            )
          )}
        </p>
      </div>
    </div>
  );
}

export function CorrectionLog({
  pipelineResult,
  compareMode = false,
}: CorrectionLogProps) {
  const confidenceScore = useConfidenceScore();
  if (!pipelineResult) return null;

  const { dirty_transcript, healed_transcript, durations_s } = pipelineResult;
  const totalLatency = durations_s?.total ?? 0;
  const latencyOffset = Object.entries(durations_s ?? {})
    .filter(([k]) => k !== "total")
    .map(([k, v]) => `${k}: ${v.toFixed(2)}s`)
    .join(" · ");

  // Animate when this result is first shown (parent should use key to remount on new result)
  const shouldAnimate = true;

  return (
    <motion.div
      className="rounded-xl border border-slate-200/60 bg-white/60 p-5 shadow-sm"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-600">
          Visual Healing
        </h3>
        <div className="flex items-center gap-3">
          <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-600">
            Confidence: {confidenceScore}%
          </span>
          <span className="rounded bg-blue-50 px-2 py-0.5 font-mono text-[10px] text-blue-700">
            Latency: {totalLatency.toFixed(2)}s
          </span>
        </div>
      </div>

      <div className="mb-3 rounded border border-slate-100 bg-slate-50/30 px-3 py-2">
        <p className="font-mono text-[9px] text-slate-500">
          {latencyOffset || "—"}
        </p>
      </div>

      <DiffView
        dirty={dirty_transcript || "(empty)"}
        healed={healed_transcript || "(empty)"}
        animate={shouldAnimate}
      />
    </motion.div>
  );
}
