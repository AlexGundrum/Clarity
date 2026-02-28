"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface TranscriptEdit {
  type: "stutter" | "filler" | "translation";
  original: string;
  corrected: string;
  context?: string;
  position: number; // word index where this edit occurs
}

interface AnimatedTranscriptProps {
  transcript: string;
  edits: TranscriptEdit[];
  speed?: number; // words per second (default: 3)
  autoPlay?: boolean;
  onComplete?: () => void;
  showControls?: boolean;
}

export function AnimatedTranscript({
  transcript,
  edits,
  speed = 3,
  autoPlay = true,
  onComplete,
  showControls = false,
}: AnimatedTranscriptProps) {
  const words = transcript.split(" ");
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeEdit, setActiveEdit] = useState<TranscriptEdit | null>(null);

  useEffect(() => {
    if (!isPlaying || currentWordIndex >= words.length) {
      if (currentWordIndex >= words.length && onComplete) {
        onComplete();
      }
      return;
    }

    const delay = (1000 / (speed * playbackSpeed));
    const timer = setTimeout(() => {
      setCurrentWordIndex((prev) => prev + 1);
      
      // Check if current word has an edit
      const edit = edits.find((e) => e.position === currentWordIndex + 1);
      if (edit) {
        setActiveEdit(edit);
        // Clear active edit after animation
        setTimeout(() => setActiveEdit(null), 2000);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [currentWordIndex, isPlaying, speed, playbackSpeed, words.length, edits, onComplete]);

  const handleReplay = () => {
    setCurrentWordIndex(-1);
    setActiveEdit(null);
    setIsPlaying(true);
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const getWordStyle = (index: number) => {
    const edit = edits.find((e) => e.position === index);
    if (!edit) return "";

    switch (edit.type) {
      case "stutter":
        return "line-through text-red-500/70";
      case "filler":
        return "bg-blue-100 text-blue-800 px-1 rounded";
      case "translation":
        return "underline decoration-green-500 decoration-2";
      default:
        return "";
    }
  };

  const renderWord = (word: string, index: number) => {
    const edit = edits.find((e) => e.position === index);
    const isVisible = index <= currentWordIndex;

    if (!isVisible) return null;

    // Handle stutter - show original then strike through
    if (edit?.type === "stutter") {
      return (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block"
        >
          <motion.span
            className="relative inline-block"
            animate={activeEdit?.position === index ? {
              textDecoration: ["none", "line-through"],
              color: ["rgb(71, 85, 105)", "rgb(239, 68, 68)"],
            } : {}}
            transition={{ duration: 0.5 }}
          >
            {edit.original}
          </motion.span>
          {activeEdit?.position === index && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="ml-1 inline-block"
            >
              {edit.corrected}
            </motion.span>
          )}
        </motion.span>
      );
    }

    // Handle filler - show placeholder then replace
    if (edit?.type === "filler") {
      return (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block"
        >
          {activeEdit?.position === index ? (
            <motion.span
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.1, 1] }}
              className="relative inline-block"
            >
              <motion.span
                className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded"
                initial={{ opacity: 1 }}
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.3 }}
              >
                {edit.original}
              </motion.span>
              <motion.span
                className="absolute left-0 top-0 px-2 py-0.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1] }}
                transition={{ delay: 0.3 }}
              >
                {edit.corrected}
              </motion.span>
            </motion.span>
          ) : (
            <span className={getWordStyle(index)}>{word}</span>
          )}
          {activeEdit?.position === index && edit.context && (
            <motion.span
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="ml-2 inline-block rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white"
            >
              🔍 {edit.context}
            </motion.span>
          )}
        </motion.span>
      );
    }

    // Handle translation
    if (edit?.type === "translation") {
      return (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block"
        >
          <span className={getWordStyle(index)}>{edit.original}</span>
          {activeEdit?.position === index && (
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="ml-2 inline-block text-green-700"
            >
              → {edit.corrected}
            </motion.span>
          )}
        </motion.span>
      );
    }

    // Regular word
    return (
      <motion.span
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="inline-block"
      >
        {word}
      </motion.span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="min-h-[100px] text-lg leading-relaxed text-slate-700">
        {words.map((word, index) => (
          <span key={index} className="mr-2">
            {renderWord(word, index)}
          </span>
        ))}
      </div>

      {showControls && (
        <div className="flex items-center gap-3 border-t border-slate-200 pt-4">
          <button
            onClick={handleReplay}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-200"
          >
            Replay
          </button>
          <button
            onClick={handleTogglePlay}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Speed:</span>
            {[1, 2, 4].map((s) => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                className={`rounded px-2 py-1 text-sm transition-all ${
                  playbackSpeed === s
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
