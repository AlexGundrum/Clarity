"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * MediaRecorder mime types in order of preference.
 * 16kHz Mono PCM is ideal for our backend; browsers typically support webm/opus.
 */
const PREFERRED_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/mp4",
];

function getSupportedMimeType(): string {
  for (const mime of PREFERRED_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return "";
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function Recorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async () => {
    setError(null);
    setAudioBlob(null);
    setDuration(0);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const options: MediaRecorderOptions = mimeType ? { mimeType } : {};

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, {
            type: recorder.mimeType || "audio/webm",
          });
          setAudioBlob(blob);
        }
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      recorder.start(100);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to access microphone");
    }
  }, []);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      setIsRecording(false);
    }
  }, []);

  const reRecord = useCallback(() => {
    setAudioBlob(null);
    setDuration(0);
    setError(null);
  }, []);

  // Create and revoke blob URL when audioBlob changes
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!audioBlob) {
      setAudioUrl(null);
      return;
    }
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [audioBlob]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Timer */}
      <div className="font-mono text-3xl tabular-nums text-slate-600">
        {formatDuration(duration)}
      </div>

      {/* Recording indicator */}
      {isRecording && (
        <div className="flex items-center gap-2 text-red-600">
          <span
            className="h-3 w-3 rounded-full bg-red-500 animate-pulse"
            aria-hidden
          />
          <span className="text-sm font-medium">Recording...</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4">
        {!isRecording ? (
          <>
            <button
              onClick={startRecording}
              type="button"
              className="rounded-full bg-red-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:bg-red-600 hover:shadow-red-500/30 active:scale-95"
            >
              Record
            </button>
            {audioBlob && (
              <button
                onClick={reRecord}
                type="button"
                className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50"
              >
                Re-record
              </button>
            )}
          </>
        ) : (
          <button
            onClick={stopRecording}
            type="button"
            className="rounded-full bg-slate-700 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-slate-800 active:scale-95"
          >
            Stop
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* Playback */}
      {audioBlob && !isRecording && (
        <div className="w-full max-w-md space-y-2">
          <p className="text-center text-sm text-slate-500">Playback</p>
          <audio controls src={audioUrl ?? undefined} className="w-full" />
        </div>
      )}
    </div>
  );
}
