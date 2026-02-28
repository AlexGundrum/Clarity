"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface PipelineResult {
  dirty_transcript: string;
  healed_transcript: string;
  final_audio_path: string;
  durations_s: Record<string, number>;
  /** When pace=slow, the text sent to TTS after punctuation injection */
  injected_transcript?: string;
}

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

/** Extract filename from server path (handles both / and \\) */
function getAudioFilename(path: string): string {
  return path.split(/[/\\]/).pop() ?? path;
}

/** Map language code to full language name for target_language (Gemini output) */
const LANGUAGE_CODE_TO_TARGET: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  ja: "Japanese",
};

interface RecorderProps {
  compareMode: boolean;
}

export function Recorder({ compareMode }: RecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultNormal, setResultNormal] = useState<PipelineResult | null>(null);
  const [resultSlow, setResultSlow] = useState<PipelineResult | null>(null);
  const [useMultimodal, setUseMultimodal] = useState(false);
  const [languageCode, setLanguageCode] = useState("en");

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
    setResultNormal(null);
    setResultSlow(null);
  }, []);

  const processAudio = useCallback(async () => {
    if (!audioBlob || isProcessing) return;
    setIsProcessing(true);
    setError(null);
    setResultNormal(null);
    setResultSlow(null);

    const ext = audioBlob.type.includes("webm") ? "webm" : "ogg";
    const targetLanguage =
      LANGUAGE_CODE_TO_TARGET[languageCode] ?? "English";
    const baseParams = new URLSearchParams({
      use_multimodal: String(useMultimodal),
      language_code: languageCode,
      target_language: targetLanguage,
    });

    const doRequest = async (pace: "normal" | "slow"): Promise<PipelineResult> => {
      const params = new URLSearchParams(baseParams);
      params.set("pace", pace);
      const formData = new FormData();
      formData.append("audio", audioBlob, `recording.${ext}`);
      const res = await fetch(
        `${API_BASE}/api/run-full-pipeline?${params}`,
        { method: "POST", body: formData }
      );
      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(errBody || `HTTP ${res.status}`);
      }
      return res.json() as Promise<PipelineResult>;
    };

    try {
      if (compareMode) {
        const [normal, slow] = await Promise.all([
          doRequest("normal"),
          doRequest("slow"),
        ]);
        setResultNormal(normal);
        setResultSlow(slow);
      } else {
        const data = await doRequest("normal");
        setResultNormal(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pipeline request failed");
    } finally {
      setIsProcessing(false);
    }
  }, [audioBlob, isProcessing, useMultimodal, languageCode, compareMode]);

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

  const healedAudioUrl = resultNormal
    ? `${API_BASE}/files/pipeline-output/${getAudioFilename(resultNormal.final_audio_path)}`
    : null;
  const slowAudioUrl = resultSlow
    ? `${API_BASE}/files/pipeline-output/${getAudioFilename(resultSlow.final_audio_path)}`
    : null;

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

      {/* Pipeline options & Process button */}
      {audioBlob && !isRecording && (
        <div className="w-full max-w-md space-y-4 border-t border-slate-200 pt-6">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <label className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Path:</span>
              <select
                value={useMultimodal ? "multimodal" : "sequential"}
                onChange={(e) =>
                  setUseMultimodal(e.target.value === "multimodal")
                }
                className="rounded border border-slate-300 bg-white px-2 py-1 text-sm"
              >
                <option value="sequential">Sequential (Scribe → Gemini)</option>
                <option value="multimodal">Multimodal (Gemini audio-native)</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Language:</span>
              <select
                value={languageCode}
                onChange={(e) => setLanguageCode(e.target.value)}
                className="rounded border border-slate-300 bg-white px-2 py-1 text-sm"
              >
                <option value="en">en</option>
                <option value="es">es</option>
                <option value="fr">fr</option>
                <option value="de">de</option>
                <option value="ja">ja</option>
              </select>
            </label>
          </div>
          <div className="flex justify-center">
            <button
              onClick={processAudio}
              disabled={isProcessing}
              type="button"
              className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                    aria-hidden
                  />
                  Processing...
                </>
              ) : compareMode ? (
                "Compare (Normal vs Slow)"
              ) : (
                "Process with AI"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {(resultNormal || resultSlow) && (
        <div className="w-full max-w-4xl space-y-4 border-t border-slate-200 pt-6">
          <h3 className="text-center font-mono text-sm font-semibold text-slate-700">
            Results
          </h3>

          {compareMode && resultNormal && resultSlow ? (
            /* A/B Comparison: two cards side-by-side */
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Left: Standard Pace */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/30 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Standard Pace
                </p>
                <p className="mb-2 text-xs text-slate-500">Healed Transcript</p>
                <p className="mb-4 text-sm text-slate-800">
                  {resultNormal.healed_transcript || "(empty)"}
                </p>
                {healedAudioUrl && (
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">Audio</p>
                    <audio controls src={healedAudioUrl} className="w-full" />
                  </div>
                )}
                {resultNormal.durations_s.tts != null && (
                  <p className="mt-2 font-mono text-xs text-slate-500">
                    TTS: {resultNormal.durations_s.tts.toFixed(2)}s
                  </p>
                )}
              </div>

              {/* Right: Deliberate Pace */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/30 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-indigo-700">
                  Deliberate Pace
                </p>
                <p className="mb-2 text-xs text-slate-500">Healed Transcript</p>
                <p className="mb-4 text-sm text-slate-800">
                  {resultSlow.healed_transcript || "(empty)"}
                </p>
                {resultSlow.injected_transcript && (
                  <div className="mb-4 rounded border border-amber-200 bg-amber-50/50 p-3">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wider text-amber-700">
                      Injected Text (sent to TTS)
                    </p>
                    <p className="font-mono text-xs text-slate-700">
                      {resultSlow.injected_transcript}
                    </p>
                  </div>
                )}
                {slowAudioUrl && (
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">Audio</p>
                    <audio controls src={slowAudioUrl} className="w-full" />
                  </div>
                )}
                {resultSlow.durations_s.tts != null && (
                  <p className="mt-2 font-mono text-xs text-slate-500">
                    TTS: {resultSlow.durations_s.tts.toFixed(2)}s
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Single result (non-compare mode) */
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                    Dirty Transcript
                  </p>
                  <p className="text-sm text-slate-800">
                    {resultNormal?.dirty_transcript || "(empty)"}
                  </p>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-emerald-600">
                    Healed Transcript
                  </p>
                  <p className="text-sm text-slate-800">
                    {resultNormal?.healed_transcript || "(empty)"}
                  </p>
                </div>
              </div>

              {healedAudioUrl && (
                <div className="space-y-2">
                  <p className="text-center text-sm text-slate-500">
                    Healed Audio
                  </p>
                  <audio controls src={healedAudioUrl} className="w-full" />
                </div>
              )}

              {resultNormal && Object.keys(resultNormal.durations_s).length > 0 && (
                <div className="rounded-lg border border-slate-200 bg-slate-50/30 px-4 py-3">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                    Durations
                  </p>
                  <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
                    {Object.entries(resultNormal.durations_s).map(([key, val]) => (
                      <li key={key}>
                        <span className="font-mono">{key}:</span>{" "}
                        {val.toFixed(2)}s
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
