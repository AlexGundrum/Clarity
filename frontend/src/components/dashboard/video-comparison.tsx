"use client";

import { useState, useRef, useEffect } from "react";
import { MacVideoWindow } from "./mac-video-window";
import { AnimatedTranscript, TranscriptEdit } from "../animated-transcript";

interface VideoComparisonProps {
  beforeVideo: string;
  fakeLagVideo: string;
  pixelateVideo: string;
  museSyncVideo?: string;
}

type CamouflageMode = "fake-lag" | "partial-blur" | "lip-sync";
type PlaybackMode = "sequential" | "after-only";
type Scenario = "demovideo1";

// Mock transcript data for scenarios
const scenarioData = {
  demovideo1: {
    name: "Demo Video 1",
    description: "Kubernetes Discussion",
    transcript: "I was th-th-thinking we should use k-k-k kubernetes para el deployment",
    edits: [
      { type: "stutter" as const, original: "th-th-thinking", corrected: "thinking", position: 2 },
      { type: "filler" as const, original: "k-k-k", corrected: "kubernetes", context: "Kubernetes meeting", position: 6 },
      { type: "translation" as const, original: "para", corrected: "for", position: 8 },
    ],
  },
};

export function VideoComparison({ beforeVideo, fakeLagVideo, pixelateVideo, museSyncVideo }: VideoComparisonProps) {
  const [selectedMode, setSelectedMode] = useState<CamouflageMode>("fake-lag");
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>("sequential");
  const [selectedScenario, setSelectedScenario] = useState<Scenario>("demovideo1");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<"before" | "after" | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const beforeRef = useRef<HTMLVideoElement>(null);
  const afterRef = useRef<HTMLVideoElement>(null);

  const modeConfig = {
    "fake-lag": { video: fakeLagVideo, label: "Fake Lag", description: "Frame freeze during corrections" },
    "partial-blur": { video: pixelateVideo, label: "Partial Blur", description: "Blur effect masking" },
    "lip-sync": { video: museSyncVideo || fakeLagVideo, label: "Lip Sync", description: "AI lip sync correction" },
  };

  const currentAfterVideo = modeConfig[selectedMode].video;
  const currentScenario = scenarioData[selectedScenario];

  const handlePlay = async () => {
    if (isPlaying) {
      beforeRef.current?.pause();
      afterRef.current?.pause();
      setIsPlaying(false);
      setPlayingVideo(null);
      return;
    }

    setIsPlaying(true);
    
    if (playbackMode === "after-only") {
      // Play only after video
      if (afterRef.current) {
        afterRef.current.currentTime = 0;
        setPlayingVideo("after");
        await afterRef.current.play();
      }
    } else {
      // Play before video first (sequential)
      if (beforeRef.current) {
        beforeRef.current.currentTime = 0;
        setPlayingVideo("before");
        await beforeRef.current.play();
      }
    }
  };

  useEffect(() => {
    const handleBeforeEnded = async () => {
      if (afterRef.current && isPlaying) {
        afterRef.current.currentTime = 0;
        setPlayingVideo("after");
        await afterRef.current.play();
      }
    };

    const handleAfterEnded = () => {
      setIsPlaying(false);
      setPlayingVideo(null);
    };

    const beforeVideo = beforeRef.current;
    const afterVideo = afterRef.current;

    if (beforeVideo) {
      beforeVideo.addEventListener("ended", handleBeforeEnded);
    }
    if (afterVideo) {
      afterVideo.addEventListener("ended", handleAfterEnded);
    }

    return () => {
      beforeVideo?.removeEventListener("ended", handleBeforeEnded);
      afterVideo?.removeEventListener("ended", handleAfterEnded);
    };
  }, [isPlaying]);

  return (
    <div className="space-y-6">
      {/* Scenario Selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-slate-700">Scenario:</label>
        <select
          value={selectedScenario}
          onChange={(e) => setSelectedScenario(e.target.value as Scenario)}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.entries(scenarioData).map(([key, data]) => (
            <option key={key} value={key}>
              {data.name} - {data.description}
            </option>
          ))}
        </select>
      </div>

      {/* Mode Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Video Comparison</h3>
          <p className="text-sm text-slate-500">Select a camouflage mode to see before/after</p>
        </div>
        
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Playback Mode Toggle */}
          <div className="flex gap-1 rounded-lg bg-slate-100/60 p-1">
            <button
              onClick={() => setPlaybackMode("sequential")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition-all ${
                playbackMode === "sequential"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              Sequential
            </button>
            <button
              onClick={() => setPlaybackMode("after-only")}
              className={`rounded px-3 py-1.5 text-xs font-medium transition-all ${
                playbackMode === "after-only"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              After Only
            </button>
          </div>

          {/* Camouflage Mode Selector */}
          <div className="flex gap-2 rounded-lg bg-slate-100/60 p-1">
            {(Object.keys(modeConfig) as CamouflageMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`rounded px-4 py-2 text-sm font-medium transition-all ${
                  selectedMode === mode
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                {modeConfig[mode].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sequential Video Display */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Before Video */}
        <MacVideoWindow title="Original — Before Correction">
          <div className={`relative aspect-video bg-slate-900 transition-all duration-300 ${
            playingVideo === "before" ? "ring-4 ring-blue-500 ring-inset" : ""
          }`}>
            <video
              ref={beforeRef}
              src={beforeVideo}
              className="h-full w-full object-cover"
              playsInline
            />
            <div className="absolute bottom-3 left-3 rounded-full bg-slate-900/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              Before
            </div>
            {playingVideo === "before" && (
              <div className="absolute top-3 right-3 flex items-center gap-2 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                Playing
              </div>
            )}
          </div>
        </MacVideoWindow>

        {/* After Video */}
        <MacVideoWindow title={`Clarity — ${modeConfig[selectedMode].label}`}>
          <div className={`relative aspect-video bg-slate-900 transition-all duration-300 ${
            playingVideo === "after" ? "ring-4 ring-blue-500 ring-inset" : ""
          }`}>
            <video
              ref={afterRef}
              src={currentAfterVideo}
              className="h-full w-full object-cover"
              playsInline
            />
            <div className="absolute bottom-3 left-3 rounded-full bg-blue-600/90 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              After - {modeConfig[selectedMode].label}
            </div>
            {playingVideo === "after" && (
              <div className="absolute top-3 right-3 flex items-center gap-2 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                Playing
              </div>
            )}
          </div>
        </MacVideoWindow>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between rounded-xl bg-slate-100/60 p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePlay}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white transition-all hover:bg-blue-700 hover:scale-105 active:scale-95"
          >
            {isPlaying ? (
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-6 w-6 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          <div className="text-sm">
            <p className="font-medium text-slate-700">
              {isPlaying 
                ? (playingVideo === "before" ? "Playing Before..." : "Playing After...") 
                : (playbackMode === "sequential" ? "Click to play sequence" : "Click to play after video")}
            </p>
            <p className="text-xs text-slate-500">
              {modeConfig[selectedMode].description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
            {playbackMode === "sequential" ? "Sequential" : "After Only"}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {modeConfig[selectedMode].label}
          </span>
        </div>
      </div>

      {/* Animated Transcript Section */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-slate-800">Live Transcript Analysis</h4>
            <p className="text-sm text-slate-500">Watch corrections happen in real-time</p>
          </div>
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700"
          >
            {showTranscript ? "Hide" : "Show"} Transcript
          </button>
        </div>

        {showTranscript && (
          <div className="rounded-xl bg-white/50 p-6 backdrop-blur-sm border border-slate-200">
            <AnimatedTranscript
              transcript={currentScenario.transcript}
              edits={currentScenario.edits}
              speed={2}
              autoPlay={isPlaying}
              showControls={true}
            />
          </div>
        )}

        {/* Detection Summary */}
        {showTranscript && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-red-50 p-3 text-center">
              <div className="text-2xl font-bold text-red-600">
                {currentScenario.edits.filter(e => e.type === "stutter").length}
              </div>
              <div className="text-xs text-red-700">Stutters</div>
            </div>
            <div className="rounded-lg bg-blue-50 p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {currentScenario.edits.filter(e => e.type === "filler").length}
              </div>
              <div className="text-xs text-blue-700">Context Fills</div>
            </div>
            <div className="rounded-lg bg-green-50 p-3 text-center">
              <div className="text-2xl font-bold text-green-600">
                {currentScenario.edits.filter(e => e.type === "translation").length}
              </div>
              <div className="text-xs text-green-700">Translations</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
