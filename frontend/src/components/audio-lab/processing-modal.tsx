"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedTranscript, TranscriptEdit } from "../animated-transcript";

interface ProcessingResult {
  dirtyTranscript: string;
  healedTranscript: string;
  stuttersDetected: number;
  languageSwitches: number;
  fillerWords: number;
  contextMatches: number;
  edits: TranscriptEdit[];
  beforeAudioUrl?: string;
  afterAudioUrl?: string;
}

interface ProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ProcessingResult | null;
  isProcessing: boolean;
}

export function ProcessingModal({ isOpen, onClose, result, isProcessing }: ProcessingModalProps) {
  const [showTranscript, setShowTranscript] = useState(false);
  const [scanningContexts, setScanningContexts] = useState(true);

  useEffect(() => {
    if (isOpen && !isProcessing && result) {
      // Simulate context scanning animation
      setScanningContexts(true);
      const timer = setTimeout(() => {
        setScanningContexts(false);
        setShowTranscript(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isProcessing, result]);

  const mockContexts = [
    { type: "Google Calendar", title: "Kubernetes Deployment Meeting", relevance: "high" },
    { type: "Slack", title: "#kubernetes channel - 15 messages today", relevance: "high" },
    { type: "Email", title: "K8s migration discussion", relevance: "medium" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="glass-heavy w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-8 pointer-events-auto">
              {isProcessing ? (
                // Loading State
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="h-16 w-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mb-4" />
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Processing Audio...</h3>
                  <p className="text-sm text-slate-500">Analyzing speech patterns and corrections</p>
                </div>
              ) : result ? (
                // Results State
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-800">Audio Analysis Complete</h2>
                        <p className="text-sm text-slate-500">Your speech has been processed and corrected</p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Detection Summary */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">📊 Detection Summary</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="rounded-xl bg-red-50 p-4 text-center">
                        <div className="text-3xl font-bold text-red-600">{result.stuttersDetected}</div>
                        <div className="text-sm text-red-700 mt-1">Stutters</div>
                      </div>
                      <div className="rounded-xl bg-green-50 p-4 text-center">
                        <div className="text-3xl font-bold text-green-600">{result.languageSwitches}</div>
                        <div className="text-sm text-green-700 mt-1">Translations</div>
                      </div>
                      <div className="rounded-xl bg-blue-50 p-4 text-center">
                        <div className="text-3xl font-bold text-blue-600">{result.fillerWords}</div>
                        <div className="text-sm text-blue-700 mt-1">Fillers</div>
                      </div>
                      <div className="rounded-xl bg-purple-50 p-4 text-center">
                        <div className="text-3xl font-bold text-purple-600">{result.contextMatches}</div>
                        <div className="text-sm text-purple-700 mt-1">Context Fills</div>
                      </div>
                    </div>
                  </div>

                  {/* Animated Transcript Playback */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">📝 Animated Transcript Playback</h3>
                    <div className="rounded-xl bg-white/50 p-6 backdrop-blur-sm border border-slate-200">
                      {showTranscript && (
                        <AnimatedTranscript
                          transcript={result.healedTranscript}
                          edits={result.edits}
                          speed={2}
                          autoPlay={true}
                          showControls={true}
                        />
                      )}
                    </div>
                  </div>

                  {/* Context Intelligence */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">🔍 Context Intelligence</h3>
                    {scanningContexts ? (
                      <div className="rounded-xl bg-slate-50 p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                          <span className="text-sm font-medium text-slate-700">Scanning your workspace...</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                          {["Google Calendar", "Outlook", "Slack", "Discord", "Email"].map((service, i) => (
                            <motion.div
                              key={service}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white"
                            >
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-xs">📅</span>
                              </div>
                              <span className="text-xs text-slate-600 text-center">{service}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="rounded-lg bg-green-50 p-3 border border-green-200">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-semibold text-green-800">Found {mockContexts.length} relevant contexts</span>
                          </div>
                        </div>
                        {mockContexts.map((context, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="rounded-lg bg-white p-4 border border-slate-200"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-semibold text-blue-600">{context.type}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    context.relevance === "high" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                  }`}>
                                    {context.relevance}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-700">{context.title}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
                          <p className="text-sm text-blue-800">
                            <strong>How it helped:</strong> Based on Slack discussion about Kubernetes, filled "k-k-k" → "kubernetes"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Audio Playback */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">🎧 Audio Playback</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-xl bg-slate-50 p-4">
                        <div className="text-sm font-medium text-slate-700 mb-2">Before</div>
                        {result.beforeAudioUrl && (
                          <audio controls className="w-full">
                            <source src={result.beforeAudioUrl} type="audio/wav" />
                          </audio>
                        )}
                      </div>
                      <div className="rounded-xl bg-blue-50 p-4">
                        <div className="text-sm font-medium text-blue-700 mb-2">After</div>
                        {result.afterAudioUrl && (
                          <audio controls className="w-full">
                            <source src={result.afterAudioUrl} type="audio/wav" />
                          </audio>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <button
                      onClick={onClose}
                      className="rounded-lg bg-slate-100 px-6 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-slate-200"
                    >
                      Close
                    </button>
                    <button className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-blue-700">
                      Download Results
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
