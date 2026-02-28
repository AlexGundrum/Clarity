# Clarity — Frontend Developer Task List
## FlowState Operations Dashboard

---

### Layout & Shell

- [ ] **Root layout**: Full-viewport dark dashboard. Two-column layout on desktop (sidebar nav + main content). Single column on mobile.
- [ ] **Header bar**: App name "Clarity", tagline "AI Speech Smoothing", status pill (green dot = server connected, red = offline). Check `/api/health` on load and every 30s.
- [ ] **Sidebar navigation**: Three route links — `Live Audio`, `Video Processing`, `About`. Highlight active route.
- [ ] **Global toast/notification system**: Non-blocking bottom-right toast for success/error messages from API calls.

---

### Section 1 — Live Audio Mode

**Goal: Record speech → send to `/api/correct-audio` → play corrected audio back immediately.**

- [ ] **Record button**: Large centered microphone button. States:
  - Idle: mic icon, label "Record"
  - Recording: pulsing red ring animation, label "Recording…"
  - Processing: spinner, label "Correcting…"
  - Done: checkmark, label "Play Result"
- [ ] **Audio capture**: Use browser `MediaRecorder` API. Capture as `audio/webm` or `audio/wav`. Stop on second button press (toggle).
- [ ] **Upload**: On stop, POST recorded blob to `POST /api/correct-audio` as `multipart/form-data` with field name `audio`. Include `language_code=en` query param.
- [ ] **Input waveform visualizer**: While recording, render a live waveform using `AnalyserNode` from Web Audio API. Green bars.
- [ ] **Output waveform visualizer**: After correction, render the returned audio waveform. Blue bars.
- [ ] **Transcript display**: Show two stacked text boxes side-by-side:
  - Left: "Original (Dirty)" — read from `X-Dirty-Transcript` response header
  - Right: "Corrected (Healed)" — read from `X-Healed-Transcript` response header
- [ ] **Latency badge**: Display pipeline duration in ms from `X-Pipeline-Duration-Ms` response header. e.g. `⚡ 1240ms`
- [ ] **Auto-play toggle**: Switch to auto-play corrected audio on receipt (default: on).
- [ ] **Download button**: Allow user to download the corrected audio WAV.

---

### Section 2 — Video Processing

**Goal: Upload a video → select processing mode → submit → show output video.**

- [ ] **Video upload dropzone**: Drag-and-drop or click-to-select. Accept `video/*`. Show filename + file size on selection. Preview thumbnail using a `<video>` element.
- [ ] **Processing mode selector**: Radio button group or segmented control. Four options:

  | Label | Value | API/Endpoint |
  |---|---|---|
  | 🧠 AI Lip-Sync (Heavy) | `lipsync` | `POST /api/process-video` |
  | 📡 Simulate Connection Lag | `fake_lag` | `POST /api/camouflage-video?mode=fake_lag` *(see note)* |
  | 📺 Drop Resolution | `pixelate` | `POST /api/camouflage-video?mode=pixelate` |
  | 🎬 Cut to B-Roll | `broll` | `POST /api/camouflage-video?mode=broll` |

- [ ] **Stutter window inputs** (visible for modes `fake_lag`, `pixelate`, `broll`):
  - `Start Time (s)` — number input, step 0.1
  - `Duration (s)` — number input, step 0.1, min 0.1
- [ ] **B-Roll upload** (visible only for mode `broll`): Secondary file input for `broll.mp4`.
- [ ] **Language selector**: Dropdown for `language_code`. Default `en`. Include at minimum: English, Spanish, French, Portuguese.
- [ ] **Submit button**: Label "Process Video". Disabled until video is selected and mode is chosen.

- [ ] **Processing state — full overlay spinner**:
  - Semi-transparent overlay on the video section
  - Animated spinner with label matching current stage:
    - "Extracting audio…"
    - "Transcribing speech…"
    - "Healing transcript…"
    - "Synthesizing voice…"
    - "Applying MuseTalk…" *(lipsync mode only)*
    - "Applying camouflage…" *(camouflage modes)*
  - Show elapsed time counter in seconds

- [ ] **Result panel**:
  - Side-by-side video players: "Original" (left) and "Processed" (right)
  - Synchronized playback: play/pause both together
  - Transcript comparison: dirty vs healed text
  - Download button for processed video
  - "Process Another" reset button

---

### Section 3 — About / Demo Info

- [ ] Static page describing Clarity's mission, pipeline diagram (image or SVG), and team names.
- [ ] Link to GitHub repo.

---

### UI States — Global Requirements

- [ ] **Loading/processing spinners**: Every async action must show a visible loading indicator. No silent waits.
- [ ] **Error states**: If any API call returns non-2xx, show error toast with the `detail` field from the JSON response body. Never show a raw stack trace.
- [ ] **Empty states**: If no video/audio is loaded yet, show a placeholder illustration or icon with instructional copy (e.g. "Drop a video to get started").
- [ ] **Responsive**: Dashboard must be usable on a 13" laptop screen (1280×800 minimum).
- [ ] **Accessibility**: All interactive elements must have `aria-label`. Keyboard navigable.

---

### Tech Stack Suggestions

- [ ] **Framework**: React (Vite) or Next.js
- [ ] **Styling**: Tailwind CSS
- [ ] **Icons**: Lucide React
- [ ] **Audio**: Web Audio API (native browser)
- [ ] **HTTP**: `fetch` or `axios`
- [ ] **Video players**: Native `<video>` elements

---

### API Base URL

Point all requests to `http://127.0.0.1:8000` (dev). Make this configurable via `VITE_API_BASE_URL` env var.

---

### Endpoints Reference

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | Server status check |
| `POST` | `/api/correct-audio` | Live audio correction (returns audio bytes) |
| `POST` | `/api/process-video` | Full MuseTalk lip-sync pipeline |
| `POST` | `/api/camouflage-video` | FFmpeg camouflage (fake_lag / pixelate / broll) |
