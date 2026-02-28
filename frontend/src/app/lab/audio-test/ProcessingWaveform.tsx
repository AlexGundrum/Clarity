"use client";

import { motion } from "framer-motion";

interface ProcessingWaveformProps {
  isProcessing: boolean;
}

/** Jagged red waveform bars for "incoming" rough audio */
function JaggedWaveform({ className }: { className?: string }) {
  const bars = [12, 28, 18, 35, 22, 40, 15, 32, 25, 38, 20];
  return (
    <div className={`flex items-end gap-0.5 ${className ?? ""}`}>
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-sm bg-red-500/80"
          style={{ height: h }}
          animate={{
            height: [h, h + 4, h],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.05,
          }}
        />
      ))}
    </div>
  );
}

/** Smooth blue waveform bars for "outgoing" healed audio */
function SmoothWaveform({ className }: { className?: string }) {
  const bars = [20, 24, 22, 26, 24, 28, 26, 24, 26, 24, 22];
  return (
    <div className={`flex items-end gap-0.5 ${className ?? ""}`}>
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-sm bg-blue-500/90"
          style={{ height: h }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.4,
            delay: i * 0.03,
          }}
        />
      ))}
    </div>
  );
}

export function ProcessingWaveform({ isProcessing }: ProcessingWaveformProps) {
  if (!isProcessing) return null;

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200/60 bg-slate-50/50 px-6 py-5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Incoming rough waveform */}
        <div className="flex flex-1 items-center justify-end">
          <motion.div
            className="flex items-end"
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <JaggedWaveform />
          </motion.div>
        </div>

        {/* Center: Clarity Filter divider */}
        <div className="flex shrink-0 flex-col items-center gap-1">
          <div className="h-12 w-0.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
          <span className="whitespace-nowrap font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            Clarity Filter
          </span>
        </div>

        {/* Right: Outgoing smooth waveform */}
        <div className="flex flex-1 items-center justify-start">
          <motion.div
            className="flex items-end"
            animate={{ x: [-4, 0, -4] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3,
            }}
          >
            <SmoothWaveform />
          </motion.div>
        </div>
      </div>

      {/* Flow label */}
      <p className="mt-3 text-center font-mono text-[10px] text-slate-500">
        Active Mastering · ~2s buffer
      </p>
    </div>
  );
}
