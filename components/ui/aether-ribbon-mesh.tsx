"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const BG = "#050608";
const COLORS = ["#1f6fe0", "#3b8bff", "#0b3ea8"];

/**
 * AetherRibbonMesh — ambient sine ribbon mesh (no pointer interaction).
 * Fills its (positioned) parent; sizes from the parent via ResizeObserver.
 */
export function AetherRibbonMesh({
  className,
  ribbons = 14,
}: { className?: string; ribbons?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !parent || !ctx) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = mq.matches;
    let w = 0, h = 0, raf = 0, visible = true, t = 0, last = 0;

    const draw = () => {
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, w, h);
      const step = Math.max(8, w / 120);
      for (let i = 0; i < ribbons; i++) {
        const p = i / (ribbons - 1);
        const baseY = h * (0.2 + p * 0.6);
        const amp = h * (0.05 + 0.04 * Math.sin(i * 1.7));
        const freq = 0.004 + 0.0015 * Math.cos(i);
        ctx.beginPath();
        for (let x = -step; x <= w + step; x += step) {
          const y = baseY + Math.sin(x * freq + t * (0.6 + p * 0.5) + i) * amp
            + Math.sin(x * freq * 2.3 - t * 0.4 + i * 0.5) * amp * 0.35;
          if (x === -step) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = COLORS[i % COLORS.length];
        ctx.globalAlpha = 0.18 + 0.4 * Math.sin(Math.PI * p);
        // thin 1px lines nearly vanish on a phone, so thicken them as the canvas narrows
        ctx.lineWidth = (1 + (i % 3 === 1 ? 0.6 : 0)) * Math.max(1, 700 / w);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      // ~40fps is plenty for slow ribbons and halves the cost on 120Hz screens
      if (now - last < 24) return;
      last = now;
      t += 0.012;
      draw();
    };
    const start = () => { if (!reduced && visible && !raf) raf = requestAnimationFrame(tick); };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };

    const resize = () => {
      const pr = parent.getBoundingClientRect();
      w = pr.width; h = pr.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start(); else stop();
    });
    io.observe(canvas);
    const onMotion = () => { reduced = mq.matches; if (reduced) stop(); else start(); };
    mq.addEventListener("change", onMotion);
    resize();
    start();

    return () => {
      stop(); ro.disconnect(); io.disconnect();
      mq.removeEventListener("change", onMotion);
    };
  }, [ribbons]);

  return (
    <canvas ref={canvasRef} aria-hidden className={cn("pointer-events-none absolute inset-0 h-full w-full", className)} />
  );
}

export default AetherRibbonMesh;
