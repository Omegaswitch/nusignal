"use client";

import { useEffect, useRef } from "react";

import { GMK_PATHS, WORD_PATHS } from "@/components/brand/nusignal-logo";

/*
 * Scroll-driven "signal loss -> reacquire" sequence.
 * Everything visual is drawn on one canvas; HUD text is DOM updated via refs
 * (no React re-renders on scroll). The wordmark reuses the logo's SVG paths via Path2D.
 */

const KITS = [
  { src: "/images/kit-base.webp", name: "BASE KIT", code: "CH-01", keys: "000 KEYS" },
  { src: "/images/kit-novelties.webp", name: "NOVELTIES", code: "CH-02", keys: "00 KEYS" },
];

// phase boundaries in section progress (0..1)
const LOGO_END = 0.3;
const STATIC_END = 0.38;
const KIT_SPAN = (1 - STATIC_END) / KITS.length;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

function rand(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export default function SignalLoss() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const hudTop = useRef<HTMLSpanElement>(null);
  const hudCode = useRef<HTMLSpanElement>(null);
  const hudStatus = useRef<HTMLSpanElement>(null);
  const hudKeys = useRef<HTMLSpanElement>(null);
  const barsRef = useRef<HTMLDivElement>(null);
  const noSignalRef = useRef<HTMLDivElement>(null);
  const headRefs = useRef<(HTMLHeadingElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = mq.matches;
    const onMotion = () => { reduced = mq.matches; dirty = true; schedule(); };
    mq.addEventListener("change", onMotion);

    const buf = document.createElement("canvas"); // full-res composed source
    const bctx = buf.getContext("2d")!;
    const tiny = document.createElement("canvas"); // downsample target
    const tctx = tiny.getContext("2d")!;
    const scratch = document.createElement("canvas"); // slice source, so the canvas never draws onto itself
    const sctx = scratch.getContext("2d")!;
    const gmk = GMK_PATHS.map((d) => new Path2D(d));
    const word = WORD_PATHS.map((d) => new Path2D(d));

    // a few pre-rendered noise tiles; per-cell fills over the whole canvas cost too much per frame
    const TILE = 128;
    const tiles = [0, 1, 2, 3].map((v) => {
      const c = document.createElement("canvas");
      c.width = c.height = TILE;
      const x = c.getContext("2d")!;
      for (let y = 0; y < TILE; y += 3) {
        for (let xx = 0; xx < TILE; xx += 3) {
          const r = rand(v * 977 + xx * 0.37 + y * 13.13);
          if (r > 0.6) continue;
          const g = Math.floor(rand(r * 91 + v) * 200);
          x.fillStyle = `rgb(${g * 0.5},${g * 0.7},${g})`;
          x.fillRect(xx, y, 3, 3);
        }
      }
      return ctx.createPattern(c, "repeat")!;
    });

    // kit images load only once the section is about a viewport away
    let imgs: HTMLImageElement[] = [];
    const near = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      near.disconnect();
      imgs = KITS.map((k) => {
        const im = new Image();
        im.decoding = "async";
        im.onload = () => { dirty = true; schedule(); };
        im.src = k.src;
        return im;
      });
    }, { rootMargin: "100% 0px" });
    near.observe(section);

    let W = 0, H = 0, dpr = 1;
    let box = { x: 0, y: 0, s: 0 };
    let dirty = true;
    let raf = 0;
    let visible = false;
    let lastKey = "";
    let lastT = 0, lastP = -1;
    const setText = (el: HTMLElement | null, v: string) => { if (el && el.textContent !== v) el.textContent = v; };
    const setOp = (el: HTMLElement | null, v: string) => { if (el && el.style.opacity !== v) el.style.opacity = v; };

    function resize() {
      // mobile URL bar show/hide only nudges the height; re-laying out would flash the canvas
      if (W && window.innerWidth === W && Math.abs(window.innerHeight - H) < 80) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      buf.width = canvas.width;
      buf.height = canvas.height;
      scratch.width = canvas.width;
      scratch.height = canvas.height;
      const s = Math.min(W - 32, H - (W < 640 ? 200 : 220));
      box = { x: (W - s) / 2, y: (H - s) / 2 + (W < 640 ? 10 : 0), s };
      const f = frameRef.current!;
      f.style.left = box.x + "px";
      f.style.top = box.y + "px";
      f.style.width = s + "px";
      f.style.height = s + "px";
      dirty = true;
    }

    function progress() {
      const r = section.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      return clamp(-r.top / total);
    }

    // draw source (logo or kit) at full res into buf
    function drawLogo(c: CanvasRenderingContext2D) {
      const w = buf.width, h = buf.height;
      c.fillStyle = "#050608";
      c.fillRect(0, 0, w, h);
      // same geometry as <NuSignalLogo> (viewBox 456x156), centred at ~70vw like the hero
      const k = Math.min((w * (W < 640 ? 0.92 : 0.7)) / 456, (h * 0.5) / 156);
      c.save();
      c.translate((w - 456 * k) / 2, (h - 156 * k) / 2);
      c.scale(k, k);
      c.lineCap = "round";
      c.lineJoin = "round";
      const stroke = (paths: Path2D[], color: string, lw: number) => {
        c.strokeStyle = color;
        c.lineWidth = lw;
        paths.forEach((d) => c.stroke(d));
      };
      c.save();
      c.translate(108, 14);
      c.scale(0.85, 0.85);
      stroke(gmk, "#3b8bff", 3.6);
      c.restore();
      c.translate(6, 52);
      stroke(word, "#e8eefb", 9);
      c.restore();
    }

    const loaded = (i: number) => !!imgs[i]?.complete && !!imgs[i].naturalWidth;

    // returns false while the image is still loading (skeleton drawn instead)
    function drawKit(c: CanvasRenderingContext2D, i: number, t: number) {
      const w = buf.width, h = buf.height;
      c.fillStyle = "#050608";
      c.fillRect(0, 0, w, h);
      const x = box.x * dpr, y = box.y * dpr, s = box.s * dpr;
      if (loaded(i)) {
        c.drawImage(imgs[i], x, y, s, s);
        return true;
      }
      // skeleton: dim panel with a scanning band, so the frame is never an empty box
      c.fillStyle = "#0a0f1a";
      c.fillRect(x, y, s, s);
      const bh = s * 0.18;
      const by = y - bh + ((t * 0.45) % 1) * (s + bh);
      const g = c.createLinearGradient(0, by, 0, by + bh);
      g.addColorStop(0, "rgba(59,139,255,0)");
      g.addColorStop(0.5, "rgba(59,139,255,0.22)");
      g.addColorStop(1, "rgba(59,139,255,0)");
      c.save();
      c.beginPath();
      c.rect(x, y, s, s);
      c.clip();
      c.fillStyle = g;
      c.fillRect(x, by, s, bh);
      c.restore();
      return false;
    }

    // pixelate buf -> ctx, with optional rgb split + slice glitch
    function present(block: number, split: number, slices: number, t: number, alpha: number) {
      const w = canvas.width, h = canvas.height;
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#050608";
      ctx.fillRect(0, 0, w, h);
      let src: HTMLCanvasElement = buf;
      const b = Math.max(1, block * dpr);
      if (b > 1.5) {
        const tw = Math.max(1, Math.round(w / b)), th = Math.max(1, Math.round(h / b));
        // assigning width clears and reallocates the canvas even when unchanged
        if (tiny.width !== tw) tiny.width = tw;
        if (tiny.height !== th) tiny.height = th;
        tctx.imageSmoothingEnabled = true;
        tctx.drawImage(buf, 0, 0, tiny.width, tiny.height);
        src = tiny;
      }
      ctx.imageSmoothingEnabled = src === buf;
      ctx.globalAlpha = alpha;
      const draw = (dx: number) => ctx.drawImage(src, 0, 0, src.width, src.height, dx, 0, w, h);

      if (split > 0.5) {
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = alpha * 0.3; // three additive passes sum to ~1 so whites do not blow out
        draw(-split * dpr);
        draw(split * dpr);
        ctx.globalAlpha = alpha * 0.4;
        draw(0);
        ctx.globalCompositeOperation = "source-over";
      } else {
        draw(0);
      }
      ctx.globalAlpha = 1;

      // horizontal slice displacement: shift bands copied from a snapshot of the canvas
      if (slices > 0.01) {
        sctx.globalCompositeOperation = "copy";
        sctx.drawImage(canvas, 0, 0);
        const n = Math.round(3 + slices * 9);
        const seed = Math.floor(t * 12);
        for (let k = 0; k < n; k++) {
          const y = rand(seed + k * 3.1) * h;
          const sh = (4 + rand(seed + k * 7.7) * 40) * dpr * (0.4 + slices);
          const dx = (rand(seed + k * 1.9) - 0.5) * 120 * dpr * slices;
          ctx.drawImage(scratch, 0, y, w, sh, dx, y, w, sh);
        }
      }
    }

    function scanlines(strength: number) {
      if (strength <= 0) return;
      const w = canvas.width, h = canvas.height;
      ctx.fillStyle = `rgba(0,0,0,${0.35 * strength})`;
      const step = Math.max(2, Math.round(3 * dpr));
      for (let y = 0; y < h; y += step) ctx.fillRect(0, y, w, Math.max(1, dpr));
    }

    function noise(amount: number, t: number) {
      if (amount <= 0) return;
      const seed = Math.floor(t * 30);
      const ox = Math.floor(rand(seed) * TILE), oy = Math.floor(rand(seed + 0.5) * TILE);
      ctx.save();
      ctx.globalAlpha = Math.min(1, amount * 2.5);
      ctx.fillStyle = tiles[seed % tiles.length];
      ctx.translate(-ox, -oy);
      ctx.fillRect(0, 0, canvas.width + TILE, canvas.height + TILE);
      ctx.restore();
    }

    function setBars(level: number) {
      const bars = barsRef.current!.children;
      for (let i = 0; i < bars.length; i++) {
        setOp(bars[i] as HTMLElement, i < level ? "1" : "0.15");
      }
    }

    function render(now: number) {
      const t = now / 1000;
      const p = progress();
      const f = frameRef.current!;
      const ns = noSignalRef.current!;
      let animating = false;

      if (p < LOGO_END) {
        // ---- phase 1: signal loss
        const q = clamp(p / LOGO_END);
        const g = reduced ? 0 : ease(clamp((q - 0.1) / 0.9));
        const key = `L${q.toFixed(3)}`;
        if (dirty || key !== lastKey || (g > 0.05 && !reduced)) {
          drawLogo(bctx);
          const block = reduced ? 1 : 1 + Math.pow(g, 1.6) * 60;
          const jitter = g > 0.05 ? rand(Math.floor(t * 10)) : 0;
          present(block, g * 14 * (0.6 + jitter), g, t, reduced ? 1 - q : 1);
          scanlines(g);
          if (g > 0.85) noise((g - 0.85) * 0.25, t); // light: the big flash comes next
          animating = g > 0.05 && !reduced;
        }
        setOp(f, "0");
        setOp(ns, "0");
        headRefs.current.forEach((h) => setOp(h, "0"));
        setBars(Math.max(0, 5 - Math.floor(q * 6)));
        setText(hudTop.current, "CH-00 // CARRIER");
        setText(hudStatus.current, q < 0.15 ? "SIGNAL OK" : q < 0.85 ? "SIGNAL DEGRADED" : "SIGNAL LOST");
        setText(hudCode.current, `${Math.round((1 - q) * 100)
          .toString()
          .padStart(3, "0")}%`);
        setText(hudKeys.current, "");
        lastKey = key;
      } else if (p < STATIC_END) {
        // ---- static flash then black + NO SIGNAL
        const q = (p - LOGO_END) / (STATIC_END - LOGO_END);
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "#050608";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (!reduced && q < 0.4) {
          noise(0.6 - q * 1.4, t);
          scanlines(1);
          animating = true;
        }
        setOp(f, "0");
        headRefs.current.forEach((h) => setOp(h, "0"));
        setOp(ns, q > 0.25 ? "1" : "0");
        setBars(0);
        setText(hudTop.current, "CH-00 // CARRIER");
        setText(hudStatus.current, "NO CARRIER");
        setText(hudCode.current, "000%");
        setText(hudKeys.current, "");
        lastKey = "S";
      } else {
        // ---- phase 2: reacquire kits
        const kp = (p - STATIC_END) / KIT_SPAN;
        const i = Math.min(KITS.length - 1, Math.floor(kp));
        const local = clamp(kp - i); // 0..1 within this kit
        const lock = clamp(local / 0.6); // lock during first 60%, then hold
        const g = reduced ? 0 : 1 - ease(lock);
        const fadeIn = clamp(local / 0.08);
        const fadeOut = i < KITS.length - 1 ? 1 - clamp((local - 0.9) / 0.1) : 1;
        const alpha = reduced ? Math.min(fadeIn, fadeOut) : 1;
        const ready = loaded(i);
        const key = `K${i}${ready}${local.toFixed(3)}`;
        if (dirty || key !== lastKey || !ready || (g > 0.02 && !reduced)) {
          drawKit(bctx, i, t);
          const block = 1 + Math.pow(g, 1.4) * (box.s / 10);
          present(block, g * 10, g * 0.8, t, alpha);
          scanlines(0.25 + g * 0.6);
          if (!reduced && fadeOut < 1) noise((1 - fadeOut) * 0.5, t);
          animating = !ready || (g > 0.02 && !reduced);
        }
        const pct = Math.round(lock * 100);
        setOp(f, String(Math.min(fadeIn, fadeOut)));
        setOp(ns, "0");
        setBars(Math.round(lock * 5));
        setText(hudTop.current, `${KITS[i].code} // ${KITS[i].name}`);
        setText(hudStatus.current, !ready ? "ACQUIRING…" : pct >= 100 ? "LOCKED" : `LOCKING… ${pct}%`);
        setText(hudCode.current, `${pct.toString().padStart(3, "0")}%`);
        setText(hudKeys.current, KITS[i].keys);
        headRefs.current.forEach((h, j) => setOp(h, j === i ? String(Math.min(fadeIn, fadeOut)) : "0"));
        lastKey = key;
      }
      dirty = false;
      return animating;
    }

    function frame(now: number) {
      raf = 0;
      // ~30fps cap for the time-driven glitch; scroll changes still draw immediately
      const p = progress();
      if (!dirty && p === lastP && now - lastT < 33) {
        if (visible) raf = requestAnimationFrame(frame);
        return;
      }
      lastP = p;
      lastT = now;
      const animating = render(now);
      // keep looping only while glitch is live and the section is on screen
      if (animating && visible) raf = requestAnimationFrame(frame);
    }
    function schedule() {
      if (!raf && visible) raf = requestAnimationFrame(frame);
    }

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) { dirty = true; schedule(); }
    });
    io.observe(section);

    const onResize = () => { resize(); schedule(); };
    resize();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      visible = false;
      io.disconnect();
      near.disconnect();
      mq.removeEventListener("change", onMotion);
      imgs.forEach((im) => { im.onload = null; });
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const corner = "absolute h-5 w-5 border-signal-bright";
  return (
    <section
      ref={sectionRef}
      id="signal-loss"
      aria-label="Signal loss and kit reveal"
      className="relative h-[380vh] bg-void"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />

        {/* no-JS fallback; JS users get the canvas and never download these eagerly */}
        <noscript>
          <div className="absolute inset-4 flex items-center justify-center gap-4">
            {KITS.map((k) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={k.src} src={k.src} alt={`GMK nuSignal ${k.name.toLowerCase()} render`} className="max-h-full w-1/2 object-contain" />
            ))}
          </div>
        </noscript>

        {/* kit headings, faded in with each kit; kept in the DOM for screen readers */}
        <div className="pointer-events-none absolute inset-x-4 top-12 text-center sm:top-16">
          {KITS.map((k, j) => (
            <h2
              key={k.src}
              ref={(el) => { headRefs.current[j] = el; }}
              className="absolute inset-x-0 font-display text-lg font-bold uppercase tracking-[0.15em] text-signal-bright opacity-0 sm:text-2xl"
            >
              <span className="sr-only">GMK nuSignal </span>{k.name}
              <span className="sr-only">: image of the {k.name.toLowerCase()} keycaps</span>
            </h2>
          ))}
        </div>

        {/* scope frame around the kit render */}
        <div ref={frameRef} className="pointer-events-none absolute opacity-0 transition-opacity duration-300">
          <div className="absolute inset-0 border border-signal/25" />
          <span className={`${corner} -left-2 -top-2 border-l-2 border-t-2`} />
          <span className={`${corner} -right-2 -top-2 border-r-2 border-t-2`} />
          <span className={`${corner} -bottom-2 -left-2 border-b-2 border-l-2`} />
          <span className={`${corner} -bottom-2 -right-2 border-b-2 border-r-2`} />
          <span className="absolute left-1/2 top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-signal-bright/60" />
          <span className="absolute left-1/2 top-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2 bg-signal-bright/60" />
        </div>

        {/* HUD */}
        <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-signal sm:inset-x-8 sm:top-8 sm:text-xs">
          <div className="flex flex-col gap-1">
            <span ref={hudTop}>CH-00 // CARRIER</span>
            <span ref={hudKeys} className="text-mute" />
          </div>
          <div className="flex items-end gap-3">
            <span ref={hudCode} className="text-mute">100%</span>
            <div ref={barsRef} className="flex h-4 items-end gap-[3px]" aria-hidden>
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className="w-[3px] bg-signal-bright transition-opacity duration-150" style={{ height: `${n * 20}%` }} />
              ))}
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-4 bottom-4 flex justify-between font-mono text-[10px] uppercase tracking-[0.2em] sm:inset-x-8 sm:bottom-8 sm:text-xs">
          <span ref={hudStatus} className="text-signal-bright" aria-live="polite">SIGNAL OK</span>
          <span className="text-mute">GMK nuSIGNAL</span>
        </div>

        <div
          ref={noSignalRef}
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0"
        >
          <span className="border border-signal/40 px-4 py-2 font-mono text-sm tracking-[0.4em] text-signal-bright sm:text-base">
            NO SIGNAL
          </span>
        </div>
      </div>
    </section>
  );
}
