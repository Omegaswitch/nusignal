"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Ripple = { x: number; y: number; r: number; life: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number };

const BG = "#050608";
const COLORS = ["#1f6fe0", "#3b8bff", "#0b3ea8"];

/**
 * AetherRibbonMesh — sine ribbon mesh with mouse deflection and click ripples.
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

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0, visible = true, t = 0;
    const mouse = { x: -9999, y: -9999, active: false };
    const ripples: Ripple[] = [];
    const particles: Particle[] = [];

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
          let y = baseY + Math.sin(x * freq + t * (0.6 + p * 0.5) + i) * amp
            + Math.sin(x * freq * 2.3 - t * 0.4 + i * 0.5) * amp * 0.35;
          if (mouse.active) {
            const dx = x - mouse.x, dy = y - mouse.y;
            const d2 = dx * dx + dy * dy;
            y += (dy >= 0 ? 1 : -1) * 60 * Math.exp(-d2 / 18000);
          }
          for (const r of ripples) {
            const d = Math.hypot(x - r.x, y - r.y);
            y += Math.sin((d - r.r) * 0.05) * 14 * r.life * Math.exp(-Math.abs(d - r.r) / 50);
          }
          if (x === -step) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = COLORS[i % COLORS.length];
        ctx.globalAlpha = 0.18 + 0.4 * Math.sin(Math.PI * p);
        ctx.lineWidth = 1 + (i % 3 === 1 ? 0.6 : 0);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      for (const pt of particles) {
        ctx.fillStyle = `rgba(59,139,255,${pt.life})`;
        ctx.fillRect(pt.x, pt.y, 2, 2);
      }
    };

    const tick = () => {
      t += 0.012;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i]; r.r += 6; r.life -= 0.012;
        if (r.life <= 0) ripples.splice(i, 1);
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]; p.x += p.vx; p.y += p.vy; p.vx *= 0.97; p.vy *= 0.97; p.life -= 0.015;
        if (p.life <= 0) particles.splice(i, 1);
      }
      draw();
      raf = requestAnimationFrame(tick);
    };
    const start = () => { if (!reduced && visible && !raf) raf = requestAnimationFrame(tick); };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      w = rect.width; h = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onMove = (e: PointerEvent) => { Object.assign(mouse, local(e), { active: true }); };
    const onLeave = () => { mouse.active = false; };
    const onDown = (e: PointerEvent) => {
      if (reduced) return;
      const { x, y } = local(e);
      ripples.push({ x, y, r: 0, life: 1 });
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2, s = 1.5 + Math.random() * 3;
        particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1 });
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start(); else stop();
    });
    io.observe(canvas);
    parent.addEventListener("pointermove", onMove);
    parent.addEventListener("pointerleave", onLeave);
    parent.addEventListener("pointerdown", onDown);
    resize();
    start();

    return () => {
      stop(); ro.disconnect(); io.disconnect();
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
      parent.removeEventListener("pointerdown", onDown);
    };
  }, [ribbons]);

  return (
    <canvas ref={canvasRef} aria-hidden className={cn("pointer-events-none absolute inset-0 h-full w-full", className)} />
  );
}

export default AetherRibbonMesh;
