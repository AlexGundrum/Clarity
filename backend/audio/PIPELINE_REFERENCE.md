## One-Shot Neural Dubbing Pipeline – Reference

This document summarizes the non-streaming, one-shot pipeline implemented in:

- `backend/routers/pipeline_new.py`
- `backend/orchestrator_new.py`
- `backend/audio/transcription_new.py`
- `backend/audio/synthesis_new.py`
- `backend/tests/test_full_pipeline.py`

---

## API: `/api/run-full-pipeline`

### Endpoint

| Method | Path                     | Description                                      |
|--------|--------------------------|--------------------------------------------------|
| POST   | `/api/run-full-pipeline` | Run full audio → healed text → TTS → saved audio |

### Request

- **Content-Type**: `multipart/form-data`
- **Body parameters**:
  - **audio** (`file`, required): The full `.wav` or `.raw` audio file to process.
- **Query parameters**:
  - **language_code** (`str`, optional, default `"en"`): Language hint for ElevenLabs Scribe STT when *not* using multimodal.
  - **use_multimodal** (`bool`, optional, default `false`):
    - `false` → Path 2 (Sequential: Scribe STT → Gemini Text Heal → TTS)
    - `true` → Path 1 (Multimodal: Gemini hears audio directly → TTS)

### Response: `FullPipelineResult` JSON

```json
{
  "dirty_transcript": "[Native Audio Processed] or full STT transcript string",
  "healed_transcript": "Gemini-cleaned / translated transcript string",
  "final_audio_path": "backend/tests/full_pipeline_output/final_audio_2025...wav",
  "durations_s": {
    "stt": 1.234,
    "gemini": 0.789,
    "gemini_multimodal": 0.456,
    "tts": 2.345,
    "total": 4.368
  }
}
```

Notes:

- For **Path 2 (Sequential)** you will typically see `stt`, `gemini`, `tts`, `total`.
- For **Path 1 (Multimodal)** you will see `gemini_multimodal`, `tts`, `total` instead of `stt`/`gemini`.

---

## Internal Logic Guide

### Path 1 – Multimodal (Gemini Audio-Native)

- **Flow**: Raw audio bytes → **Gemini 2.5 Flash** via `gemini_multimodal_process_full` → healed/translated text → **ElevenLabs Flash v2.5 TTS** via `synthesize_and_save` → final audio file.
- **Usage**: Set **`use_multimodal=true`** on the endpoint (or use the `--multimodal` flag in the test script).
- **Dirty transcript**: Set to `"[Native Audio Processed]"` because there is no Scribe STT text.

### Path 2 – Sequential (Scribe STT → Gemini Text → TTS)

- **Flow**: Raw audio bytes → **ElevenLabs Scribe v2 STT** via `transcribe_audio_full` → **Gemini 2.5 Flash (text)** via `gemini_heal_text_full` → **ElevenLabs Flash v2.5 TTS** via `synthesize_and_save` → final audio file.
- **Usage**: Default when **`use_multimodal=false`** (or omitted).
- **Dirty transcript**: Full Scribe transcript from `transcribe_audio_full`.

Both paths share the same final ElevenLabs TTS step (`synthesize_and_save`).

---

## Runbook: How to Run Tests

### 1. Start the FastAPI Server

From the repo root:

```bash
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Path 2 (Sequential: Scribe STT → Gemini Text → TTS)

```bash
python backend/tests/test_full_pipeline.py --audio "C:\Users\alexg\code\hackathons\clem\Clarity\sample.wav"
```

- Hits:
  - `POST http://127.0.0.1:8000/api/run-full-pipeline`
- Uses:
  - `use_multimodal=false` (default)
- Output:
  - Prints **Dirty Transcript**, **Healed Transcript**, **Final Audio Path**, and per-step durations (`stt`, `gemini`, `tts`, `total`).

### 3. Path 1 (Multimodal: Gemini Hears Audio Directly → TTS)

```bash
python backend/tests/test_full_pipeline.py --audio "C:\Users\alexg\code\hackathons\clem\Clarity\sample.wav" --multimodal
```

- Hits:
  - `POST http://127.0.0.1:8000/api/run-full-pipeline?use_multimodal=true`
- Uses:
  - Gemini 2.5 Flash in multimodal mode for direct audio understanding.
- Output:
  - `dirty_transcript` is `"[Native Audio Processed]"`.
  - `healed_transcript` is Gemini’s multimodal output.
  - `durations_s` includes `gemini_multimodal`, `tts`, `total`.

### 4. curl Examples (Manual Testing)

**Path 2 – Sequential (default)**

```bash
curl -X POST "http://127.0.0.1:8000/api/run-full-pipeline?language_code=en" ^
  -H "accept: application/json" ^
  -H "Content-Type: multipart/form-data" ^
  -F "audio=@C:\Users\alexg\code\hackathons\clem\Clarity\sample.wav;type=audio/wav"
```

**Path 1 – Multimodal**

```bash
curl -X POST "http://127.0.0.1:8000/api/run-full-pipeline?use_multimodal=true&language_code=en" ^
  -H "accept: application/json" ^
  -H "Content-Type: multipart/form-data" ^
  -F "audio=@C:\Users\alexg\code\hackathons\clem\Clarity\sample.wav;type=audio/wav"
```

> On macOS/Linux, replace `^` with `\` for line continuation.

---

## Artifacts: Where Outputs Are Saved

- **Final audio files**:
  - Directory: `backend/tests/full_pipeline_output/`
  - Naming pattern: `final_audio_<timestamp>_<uuid>.raw` and/or `.wav` (depending on ElevenLabs output format and save mode).
- **Logs / console output**:
  - The test script writes verbose logs to stdout. To capture to a file:

    ```bash
    python backend/tests/test_full_pipeline.py --audio "C:\path\to\file.wav" > full_pipeline.log
    ```

---

## Useful Internal Functions

### `transcribe_audio_full`

- **Location**: `backend/audio/transcription_new.py`
- **Signature**:

  ```python
  async def transcribe_audio_full(
      *,
      audio_bytes: bytes,
      filename: Optional[str] = None,
      language_code: str = "en",
  ) -> str:
  ```

- **Description**: Sends an entire audio file to ElevenLabs Scribe v2 over REST and returns the full transcript string.

### `gemini_multimodal_process_full`

- **Location**: `backend/orchestrator_new.py`
- **Signature**:

  ```python
  async def gemini_multimodal_process_full(
      audio_bytes: bytes,
      mime_type: str = "audio/wav",
  ) -> str:
  ```

- **Description**: Wraps raw audio bytes as a Gemini `Part`, calls `models.generate_content` with `GEMINI_ACTIVE_PROMPT`, and returns healed/translated text directly from audio.

### `synthesize_and_save`

- **Location**: `backend/audio/synthesis_new.py`
- **Signature**:

  ```python
  async def synthesize_and_save(
      *,
      text: str,
      out_dir: Path,
      stem: str = "final_audio",
      save_mode: Literal["auto", "raw_and_wav", "raw_only", "wav_only"] = "auto",
  ) -> Path:
  ```

- **Description**: Calls ElevenLabs Flash v2.5 TTS in one shot, then saves the resulting audio bytes to uniquely named files on disk (typically `.raw` and `.wav`), returning the final path.

