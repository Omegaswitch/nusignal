"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface WaveformProps extends React.HTMLAttributes<HTMLDivElement> {
  bars?: number
  playing?: boolean
  variant?: "default" | "bright" | "deep" | "danger"
  label?: string
  intensity?: "low" | "medium" | "high"
  audioSrc?: string
  /** bars only: no box, label, scanlines or corners; bars stretch to fill the width */
  bare?: boolean
}

// nuSignal blues instead of the stock green/amber
const variantColor: Record<string, string> = {
  default: "bg-primary",
  bright: "bg-signal-bright",
  deep: "bg-signal-deep",
  danger: "bg-red-500",
}

const variantGlow: Record<string, string> = {
  default: "shadow-[0_0_6px_var(--primary)]",
  bright: "shadow-[0_0_8px_rgba(59,139,255,0.6)]",
  deep: "shadow-[0_0_6px_rgba(11,62,168,0.6)]",
  danger: "shadow-[0_0_6px_rgba(239,68,68,0.5)]",
}

const intensityRange = {
  low: { min: 8, max: 28 },
  medium: { min: 10, max: 40 },
  high: { min: 14, max: 48 },
}

const CONTAINER_HEIGHT = 52

export function Waveform({
  bars = 24,
  playing = true,
  variant = "default",
  label,
  intensity = "medium",
  audioSrc,
  bare = false,
  className,
  ...props
}: WaveformProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const barRefs = React.useRef<(HTMLDivElement | null)[]>([])
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const range = intensityRange[intensity]
  const barClass = cn(bare ? "flex-1 rounded-[1px]" : "w-1.5 rounded-t-sm", variantColor[variant], playing && !bare && variantGlow[variant])
  // keep the wave shape the same however many bars there are
  const k = 24 / bars

  React.useEffect(() => {
    const audio = audioRef.current
    const root = rootRef.current!
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    let raf = 0, onScreen = false, last = 0, t = 0
    // per bar: shown level, and a spike level with its own falling speed (0..1 of the free headroom)
    const level = new Float32Array(bars), spike = new Float32Array(bars), fall = new Float32Array(bars)
    const wave = (i: number, time: number) => {
      // slow drifting carrier: incommensurate sines, so it never visibly repeats and never jitters frame to frame
      const x = i * k
      const v = 0.55 * Math.sin(time * 0.55 + x * 0.42) + 0.3 * Math.sin(time * 0.83 - x * 0.21 + 1.7) + 0.15 * Math.sin(time * 1.9 + x * 0.9)
      return range.min + (range.max - range.min) * (v * 0.5 + 0.5)
    }

    // write straight to the DOM: a setState per frame re-rendered every bar at 60fps
    const paint = (h: (i: number) => number) => {
      barRefs.current.forEach((el, i) => {
        if (!el) return
        const v = h(i)
        el.style.height = Math.max(2, v) + "px"
        el.style.opacity = String(playing ? 0.5 + (v / CONTAINER_HEIGHT) * 0.5 : 0.2)
      })
    }
    const still = () => paint((i) => (playing ? wave(i, 0) : 4))
    const animate = (now: number) => {
      // display:none parents still intersect as 0x0, so check offsetParent too
      if (!root.offsetParent) { raf = 0; return }
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016)
      last = now
      t += dt
      // spikes: a burst kicks a small cluster of bars toward the top, then gravity pulls them back down
      if (Math.random() < dt * 1.6) {
        const c = Math.floor(Math.random() * bars), w = Math.floor(Math.random() * 3), amp = 0.55 + Math.random() * 0.45
        for (let d = -w; d <= w; d++) {
          const j = c + d
          if (j < 0 || j >= bars) continue
          spike[j] = Math.max(spike[j], amp * (1 - Math.abs(d) / (w + 1.5)))
          fall[j] = 0
        }
      }
      paint((i) => {
        fall[i] += 2.2 * dt                     // gravity: the fall accelerates, so a spike snaps up and drops off
        spike[i] = Math.max(0, spike[i] - fall[i] * dt)
        const base = wave(i, t)
        const target = base + (CONTAINER_HEIGHT - base) * spike[i]
        // asymmetric smoothing: fast attack, slow release
        const rate = target > level[i] ? 1 - Math.exp(-dt * 30) : 1 - Math.exp(-dt * 6)
        level[i] += (target - level[i]) * rate
        return level[i]
      })
      raf = requestAnimationFrame(animate)
    }
    const update = () => {
      cancelAnimationFrame(raf); raf = 0
      if (playing && !mq.matches && onScreen) { last = 0; raf = requestAnimationFrame(animate) }
      else still()
    }

    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; update() })
    io.observe(root)
    mq.addEventListener("change", update)
    still()
    if (playing && audioSrc && audio) audio.play().catch(() => {})
    else audio?.pause()
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      mq.removeEventListener("change", update)
      audio?.pause()
    }
  }, [playing, bars, k, range.min, range.max, audioSrc])

  return (
    <div
      ref={rootRef}
      data-slot="tron-waveform"
      className={cn(
        bare ? "relative" : "relative overflow-hidden rounded border border-primary/30 bg-card/90 p-3",
        className
      )}
      {...props}
    >
      {!bare && <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.25)_2px,rgba(0,0,0,0.25)_4px)]" />}

      {label && !bare && (
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-foreground/80">{label}</span>
          <span className={cn("text-[9px] uppercase tracking-widest", playing ? "text-signal-bright animate-pulse" : "text-foreground/40")}>
            {playing ? "LIVE" : "IDLE"}
          </span>
        </div>
      )}

      <div className={cn("flex gap-[2px]", bare ? "items-center justify-between" : "items-end justify-center")} style={{ height: CONTAINER_HEIGHT }}>
        {Array.from({ length: bars }, (_, i) => (
          <div key={i} ref={(el) => { barRefs.current[i] = el }} className={barClass} style={{ height: 4 }} />
        ))}
      </div>

      {audioSrc && <audio ref={audioRef} src={audioSrc} loop preload="auto" />}

      {!bare && <>
      <div className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-primary/50" />
      <div className="pointer-events-none absolute right-0 top-0 h-3 w-3 border-r-2 border-t-2 border-primary/50" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-primary/50" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-primary/50" />
      </>}
    </div>
  )
}

export default Waveform
