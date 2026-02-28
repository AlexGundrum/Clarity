"use client";

import { useState, useRef, useEffect } from "react";
import { MacVideoWindow } from "./mac-video-window";

interface VideoComparisonProps {
  mode: string;
  beforeVideo: string;
  afterVideo: string;
  description: string;
}

export function VideoComparison({ mode, beforeVideo, afterVideo, description }: VideoComparisonProps) {
  const [viewMode, setViewMode] = useState<"side-by-side" | "slider" | "toggle">("side-by-side");
  const [showBefore, setShowBefore] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const beforeRef = useRef<HTMLVideoElement>(null);
  const afterRef = useRef<HTMLVideoElement>(null);

  const handlePlayPause = () => {
    if (beforeRef.current && afterRef.current) {
      if (isPlaying) {
        beforeRef.current.pause();
        afterRef.current.pause();
      } else {
        beforeRef.current.play();
        afterRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const syncVideos = () => {
      if (beforeRef.current && afterRef.current && viewMode === "side-by-side") {
        afterRef.current.currentTime = beforeRef.current.currentTime;
      }
    };

    const beforeVideo = beforeRef.current;
    if (beforeVideo) {
      beforeVideo.addEventListener("timeupdate", syncVideos);
      return () => beforeVideo.removeEventListener("timeupdate", syncVideos);
    }
  }, [viewMode]);

  return (
    <div className="space-y-4">
      {/* Mode Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">{mode}</h3>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        
        {/* View Mode Selector */}
        <div className="flex gap-1 rounded-lg bg-slate-100/60 p-1">
          <button
            onClick={() => setViewMode("side-by-side")}
            className={`rounded px-3 py-1.5 text-xs font-medium transition-all ${
              viewMode === "side-by-side"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Side-by-Side
          </button>
          <button
            onClick={() => setViewMode("toggle")}
            className={`rounded px-3 py-1.5 text-xs font-medium transition-all ${
              viewMode === "toggle"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Toggle
          </button>
        </div>
      </div>

      {/* Video Display */}
      {viewMode === "side-by-side" && (
        <div className="grid gap-4 md:grid-cols-2">
          <MacVideoWindow title="Original — Before Correction">
            <div className="relative aspect-video">
              <video
                ref={beforeRef}
                src={beforeVideo}
                className="h-full w-full object-cover"
                loop
                playsInline
              />
              <div className="absolute bottom-3 left-3 rounded-full bg-slate-900/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                Before
              </div>
            </div>
          </MacVideoWindow>

          <MacVideoWindow title={`Clarity — ${mode} Mode`}>
            <div className="relative aspect-video">
              <video
                ref={afterRef}
                src={afterVideo}
                className="h-full w-full object-cover"
                loop
                playsInline
              />
              <div className="absolute bottom-3 left-3 rounded-full bg-blue-600/90 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                After
              </div>
            </div>
          </MacVideoWindow>
        </div>
      )}

      {viewMode === "toggle" && (
        <MacVideoWindow title={showBefore ? "Original — Before Correction" : `Clarity — ${mode} Mode`}>
          <div className="relative aspect-video">
            <video
              ref={showBefore ? beforeRef : afterRef}
              src={showBefore ? beforeVideo : afterVideo}
              className="h-full w-full object-cover"
              loop
              playsInline
            />
            <div className={`absolute bottom-3 left-3 rounded-full px-3 py-1 text-xs font-medium text-white backdrop-blur-sm ${
              showBefore ? "bg-slate-900/70" : "bg-blue-600/90"
            }`}>
              {showBefore ? "Before" : "After"}
            </div>
          </div>
        </MacVideoWindow>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between rounded-xl bg-slate-100/60 p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePlayPause}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition-all hover:bg-blue-700 hover:scale-105 active:scale-95"
          >
            {isPlaying ? (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {viewMode === "toggle" && (
            <button
              onClick={() => setShowBefore(!showBefore)}
              className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:shadow-md"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
              Switch View
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
            {mode}
          </span>
        </div>
      </div>
    </div>
  );
}
