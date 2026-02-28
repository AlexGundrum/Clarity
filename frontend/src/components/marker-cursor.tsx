"use client";

import { useEffect, useRef, useCallback, useState } from "react";

interface TrailPoint {
    x: number;
    y: number;
    t: number; // timestamp
}

/**
 * MarkerCursor
 * – Hides the default cursor.
 * – Renders a small SVG marker-nib at the mouse position (via a DOM div).
 * – Draws a continuous connected stroke trail on a canvas that fades out
 *   over ~1.5 s, exactly like dragging a real whiteboard marker.
 */
export function MarkerCursor() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cursorRef = useRef<HTMLDivElement>(null);
    const pointsRef = useRef<TrailPoint[]>([]);
    const requestRef = useRef<number>(0);
    const [mounted, setMounted] = useState(false);

    // ── Trail rendering ──────────────────────────────────────────────────
    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) { requestRef.current = requestAnimationFrame(render); return; }
        const ctx = canvas.getContext("2d");
        if (!ctx) { requestRef.current = requestAnimationFrame(render); return; }

        // Resize
        if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const now = Date.now();
        const ttl = 1500; // ms before a segment fully disappears
        const pts = pointsRef.current;

        // Drop expired points from the front
        while (pts.length > 0 && now - pts[0].t > ttl) pts.shift();

        if (pts.length < 2) {
            requestRef.current = requestAnimationFrame(render);
            return;
        }

        // Draw one continuous path, but split it into small segments so we can
        // shade each segment by its age.
        for (let i = 1; i < pts.length; i++) {
            const p0 = pts[i - 1];
            const p1 = pts[i];
            // Age of the OLDER end of this segment — that determines its opacity
            const age = now - p0.t;
            if (age >= ttl) continue;

            const progress = age / ttl;
            // Stays opaque long, then drops fast — like real dry-erase ink
            const alpha = Math.max(0, 1 - Math.pow(progress, 2.2)) * 0.55;
            const width = 6 * (1 - progress * 0.35); // shrink slightly as it fades

            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.strokeStyle = `rgba(20, 20, 30, ${alpha})`;
            ctx.lineWidth = width;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.stroke();
        }

        requestRef.current = requestAnimationFrame(render);
    }, []);

    // ── Events ───────────────────────────────────────────────────────────
    useEffect(() => {
        setMounted(true);

        const onMove = (e: MouseEvent) => {
            // Move the nib cursor
            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 22}px)`;
            }

            // Record trail point
            pointsRef.current.push({ x: e.clientX, y: e.clientY, t: Date.now() });

            // Cap at 600 points (plenty for a smooth trail)
            if (pointsRef.current.length > 600) pointsRef.current.shift();
        };

        window.addEventListener("mousemove", onMove);
        requestRef.current = requestAnimationFrame(render);

        return () => {
            window.removeEventListener("mousemove", onMove);
            cancelAnimationFrame(requestRef.current);
        };
    }, [render]);

    if (!mounted) return null;

    return (
        <>
            {/* Hide default cursor everywhere */}
            <style>{`*, *::before, *::after { cursor: none !important; }`}</style>

            {/* Canvas trail */}
            <canvas
                ref={canvasRef}
                className="pointer-events-none fixed inset-0 z-[9998]"
                style={{ width: "100vw", height: "100vh" }}
            />

            {/* Marker nib cursor — a chisel-tip SVG */}
            <div
                ref={cursorRef}
                className="pointer-events-none fixed top-0 left-0 z-[9999]"
                style={{ willChange: "transform" }}
            >
                <svg
                    width="18"
                    height="36"
                    viewBox="0 0 18 36"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Marker body */}
                    <rect x="3" y="0" width="12" height="22" rx="3" fill="#1a1a2e" />
                    {/* Label strip */}
                    <rect x="3" y="5" width="12" height="4" fill="#2d2d4e" />
                    {/* Tip taper */}
                    <path d="M5 22 L9 32 L13 22 Z" fill="#111" />
                    {/* Tip dot */}
                    <circle cx="9" cy="32" r="2" fill="#0a0a14" />
                    {/* Highlight */}
                    <rect x="5" y="2" width="3" height="10" rx="1.5" fill="rgba(255,255,255,0.15)" />
                </svg>
            </div>
        </>
    );
}
