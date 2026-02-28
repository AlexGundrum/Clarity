# Clarity: Project Context & Architecture

## Overview
Clarity is a real-time "Vocal OS" and digital bridge being built at CUhackit 2026. It acts as an enterprise-grade AI middleware that sits between the user's hardware and their video conferencing software (Zoom/Teams). By utilizing a strategic 2-second "broadcast buffer," Clarity intercepts speech disfluencies, repairs them, and outputs a flawless audio/video stream.

## Targeted Hackathon Tracks
1. **Clemson Computing Capstone (Industry Impact):** Positioned as a B2B enterprise tool to preserve "executive presence" and prevent neurodivergent talent attrition.
2. **AWS (Best Use of AWS):** Utilizing a well-architected cloud backend (S3, DynamoDB, Lambda, Bedrock/EC2) for processing.
3. **Best Use of Gemini API:** Used for intent prediction, context mapping, and translation.
4. **Best Use of ElevenLabs:** Used for ultra-low latency, emotionally matched voice cloning (Flash v2.5).

## The 3 Core Use Cases
1. **Stutter Detection & Correction:** Intercepts blocks, predicts the intended sentence (Gemini), and outputs a fluid voice clone (ElevenLabs).
2. **Vocal Tic Manipulation:** Detects involuntary vocal sounds and instantly mutes the outgoing audio stream for the duration of the tic without disrupting video.
3. **Code-Switching Translation (Multi-Language):** If a non-native English speaker inserts a word from their native language into an English sentence (e.g., Spanglish), the system detects the foreign word, translates it contextually, and synthesizes the fully English sentence in their cloned voice.

## The Technical Division of Labor
* **Backend (Alex):** Handling audio capture, anomaly detection, Gemini 2.0 Flash routing, and returning the synthesized ElevenLabs audio stream.
* **Frontend/Visuals (Kori):** Handling the video pipeline. Takes the live webcam feed and the incoming corrected audio from Alex, seamlessly lip-syncs the user's video to the new audio within the 2-second buffer, and outputs the synced A/V stream to a Virtual Camera. NO "freeze frame" or "network lag" illusions are allowed. Lips must sync.