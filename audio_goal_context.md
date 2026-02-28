# Clarity – Audio Goal Context

## Core Goal

Clarity is a real-time **“Neural Dubbing”** layer designed to give communication agency to people with speech disfluencies.

- **Mission**: ingest disfluent (“stuttery”) speech audio, infer the intended fluent message, and stream back **identity-preserving healed speech** (plus metadata suitable for lip-sync).
- **2-second broadcast delay rule**: the system operates on a strategic \(\approx 2s\) buffer. From audio ingestion → intent inference → synthesis → (future) lip-sync triggers, the pipeline must target a **time-to-first-byte (TTFB)** and total turnaround that keeps conversational flow natural.

## Dual-Path Logic

Clarity supports **two execution paths** for latency/accuracy trade-offs.

### Path 1 (Native Gemini Multimodal → ElevenLabs)

- **Ingestion**: raw audio frames via WebSocket (`/ws/stream`). Current backend treats each received binary message as an `audio/wav` payload.
- **Brain**: Gemini 2.0 Flash (audio-native multimodal).
- **Logic**: Gemini “hears” the audio and directly predicts the intended **fluent text**.
- **Synthesis**: send the predicted text to ElevenLabs Flash v2.5 (streaming).
- **Output**: streamed “healed” audio bytes + metadata for downstream lip-sync.

### Path 2 (ElevenLabs Scribe → Gemini → ElevenLabs)

- **Ingestion**: raw audio frames via WebSocket (`/ws/stream`). Current backend treats each received binary message as an `audio/wav` payload.
- **Transcription**: ElevenLabs Scribe v2 (real-time mode / chunked requests).
- **Logic**: send the “dirty” transcript to Gemini 2.0 Flash (text) to **heal / translate** into a fluent version.
- **Synthesis**: send the corrected text to ElevenLabs Flash v2.5 (streaming).
- **Output**: streamed “healed” audio bytes + metadata for downstream lip-sync.

### How a client selects Path 1 vs Path 2

Clients choose the pipeline path per WebSocket connection using headers:

- **`X-Clarity-Path: 1`** → Path 1 (`native_multimodal`)
- **`X-Clarity-Path: 2`** → Path 2 (`scribe_first`)

If the header is absent/invalid, the backend defaults to `PIPELINE_MODE` from `.env`.

## Service Map

- **`/backend/audio/`**
  - `transcription.py`: integrates with ElevenLabs Scribe v2 (STT) for Path 2.
  - `synthesis.py`: integrates with ElevenLabs Flash v2.5 (TTS) in **streaming** mode for both paths.
  - (future) normalization/codec utilities for PCM↔WAV framing and timestamp alignment.

- **`/backend/video/`**
  - `processor.py`: lip-sync placeholder (future: MuseTalk / Sync.so integration).
  - Responsibilities include: frame timing reference, mouth-shape mask generation, and alignment with healed audio chunks.

- **`/backend/orchestrator.py`**
  - Central “brain” coordinating:
    - Path selection (header-driven strategy)
    - Gemini inference (audio-native vs transcript-heal)
    - ElevenLabs streaming synthesis
    - Metadata capture for the last few seconds (circular buffer)
    - Fire-and-forget lip-sync triggers per output chunk (placeholder today)

## Technical Constraints

- **Asyncio everywhere**: all I/O must be non-blocking (`asyncio`, async HTTP, async WS). No blocking calls on the event loop.
- **Streaming-first processing**: optimize for **TTFB**; do not wait for full sentences before starting synthesis.
- **Environment-based configuration**: API keys and runtime mode must come from `.env`:
  - `GOOGLE_API_KEY`
  - `ELEVENLABS_API_KEY`
  - (optional) `PIPELINE_MODE`, `ELEVENLABS_VOICE_ID`, etc.

