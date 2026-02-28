"use client";

import { useEffect, useRef, useState } from "react";
import { RaindropPhysics } from "./raindrop-physics";
import { PerformanceMonitor } from "./performance-monitor";
import { RainConfig } from "./types";

const DEFAULT_CONFIG: RainConfig = {
  maxDrops: 20,
  gravity: 0.3,
  windStrength: 0.5,
  mergeThreshold: 25,
  minSize: 4,
  maxSize: 10,
  refractionStrength: 0.15,
};

export function RainEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const physicsRef = useRef<RaindropPhysics | undefined>(undefined);
  const perfMonitorRef = useRef<PerformanceMonitor | undefined>(undefined);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Initialize physics and performance monitor
    physicsRef.current = new RaindropPhysics(DEFAULT_CONFIG);
    perfMonitorRef.current = new PerformanceMonitor();

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let lastTime = performance.now();

    const render = (currentTime: number) => {
      if (!isEnabled || !physicsRef.current || !perfMonitorRef.current) return;

      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Update performance monitor
      perfMonitorRef.current.update();

      // Auto-adjust quality based on FPS
      if (perfMonitorRef.current.shouldDisable()) {
        setIsEnabled(false);
        return;
      }

      if (perfMonitorRef.current.shouldReduceQuality()) {
        physicsRef.current.setMaxDrops(Math.max(15, DEFAULT_CONFIG.maxDrops * 0.5));
      }

      // Update physics
      physicsRef.current.update(deltaTime);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render raindrops with refraction effect
      const drops = physicsRef.current.getDrops();

      drops.forEach((drop) => {
        // Draw trail (simplified)
        if (drop.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(drop.trail[0].x, drop.trail[0].y);
          
          for (let i = 1; i < drop.trail.length; i++) {
            const point = drop.trail[i];
            ctx.lineTo(point.x, point.y);
          }
          
          ctx.strokeStyle = `rgba(255, 255, 255, ${drop.trail[0].opacity * 0.2})`;
          ctx.lineWidth = drop.size * 0.25;
          ctx.lineCap = "round";
          ctx.stroke();
        }

        // Draw raindrop with simplified glass effect
        const gradient = ctx.createRadialGradient(
          drop.x,
          drop.y,
          0,
          drop.x,
          drop.y,
          drop.size
        );

        // Simplified glass gradient
        gradient.addColorStop(0, `rgba(255, 255, 255, ${drop.opacity * 0.8})`);
        gradient.addColorStop(0.6, `rgba(220, 235, 255, ${drop.opacity * 0.4})`);
        gradient.addColorStop(1, `rgba(200, 220, 255, ${drop.opacity * 0.05})`);

        ctx.beginPath();
        ctx.arc(drop.x, drop.y, drop.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Simple highlight
        ctx.beginPath();
        ctx.arc(drop.x - drop.size * 0.25, drop.y - drop.size * 0.25, drop.size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${drop.opacity * 0.5})`;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <>
      {/* Glassmorphism base layer */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Rain canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          mixBlendMode: "normal",
        }}
      />
    </>
  );
}
