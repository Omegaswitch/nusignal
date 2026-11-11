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
  className,
  ...props
}: WaveformProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const barRefs = React.useRef<(HTMLDivElement | null)[]>([])
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const range = intensityRange[intensity]
  const barClass = cn("w-1.5 rounded-t-sm", variantColor[variant], playing && variantGlow[variant])

  React.useEffect(() => {
    const audio = audioRef.current
    const root = rootRef.current!
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    let raf = 0, f = 0, onScreen = false

    // write straight to the DOM: a setState per frame re-rendered every bar at 60fps
    const paint = (h: (i: number) => number) => {
      barRefs.current.forEach((el, i) => {
        if (!el) return
        const v = h(i)
        el.style.height = Math.max(2, v) + "px"
        el.style.opacity = String(playing ? 0.5 + (v / CONTAINER_HEIGHT) * 0.5 : 0.2)
      })
    }
    const still = () =>
      paint((i) => (playing ? range.min + (range.max - range.min) * (Math.sin(i * 0.5) * 0.5 + 0.5) : 4))
    const animate = () => {
      // display:none parents still intersect as 0x0, so check offsetParent too
      if (!root.offsetParent) { raf = 0; return }
      f++
      paint((i) => {
        const wave1 = Math.sin(f * 0.06 + i * 0.5) * 0.5 + 0.5
        const wave2 = Math.sin(f * 0.1 + i * 0.3 + 2) * 0.3 + 0.3
        const noise = Math.random() * 0.2
        return range.min + (range.max - range.min) * ((wave1 + wave2 + noise) / 1.5)
      })
      raf = requestAnimationFrame(animate)
    }
    const update = () => {
      cancelAnimationFrame(raf); raf = 0
      if (playing && !mq.matches && onScreen) raf = requestAnimationFrame(animate)
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
  }, [playing, bars, range.min, range.max, audioSrc])

  return (
    <div
      ref={rootRef}
      data-slot="tron-waveform"
      className={cn(
        "relative overflow-hidden rounded border border-primary/30 bg-card/90 p-3",
        className
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.25)_2px,rgba(0,0,0,0.25)_4px)]" />

      {label && (
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-foreground/80">{label}</span>
          <span className={cn("text-[9px] uppercase tracking-widest", playing ? "text-signal-bright animate-pulse" : "text-foreground/40")}>
            {playing ? "LIVE" : "IDLE"}
          </span>
        </div>
      )}

      <div className="flex items-end justify-center gap-[2px]" style={{ height: CONTAINER_HEIGHT }}>
        {Array.from({ length: bars }, (_, i) => (
          <div key={i} ref={(el) => { barRefs.current[i] = el }} className={barClass} style={{ height: 4 }} />
        ))}
      </div>

      {audioSrc && <audio ref={audioRef} src={audioSrc} loop preload="auto" />}

      <div className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-primary/50" />
      <div className="pointer-events-none absolute right-0 top-0 h-3 w-3 border-r-2 border-t-2 border-primary/50" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-primary/50" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-primary/50" />
    </div>
  )
}

export default Waveform
