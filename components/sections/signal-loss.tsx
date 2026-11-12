"use client";

import { useEffect, useRef } from "react";

import { GMK_PATH, LOGO_H, LOGO_W, WORD_PATH } from "@/components/brand/nusignal-logo";
import Hero from "@/components/sections/hero";

/*
 * Scroll-driven "signal loss -> reacquire" sequence on a sticky stage.
 * The hero is the bottom layer: at scroll 0 the canvas is empty and the hero shows as-is.
 * As you scroll, the canvas takes over the hero logo at the same rect and glitches it out,
 * then NO SIGNAL, then the kits lock in. DOM is updated via refs (no React re-renders on scroll).
 */

// a kit without src locks in as a placeholder square until its render exists
// aspect is width / height of the render; the frame takes each kit's shape
const KITS: { name: string; src?: string; aspect: number }[] = [
  { name: "Base kit", src: "/images/kit-base.webp", aspect: 1 },
  { name: "Novelties", src: "/images/kit-novelties.webp", aspect: 1 },
  { name: "Numpad", src: "/images/kit-numpad.webp", aspect: 16 / 9 },
  { name: "Alt mods", src: "/images/kit-alt-mods.webp", aspect: 16 / 9 },
  { name: "Extension", src: "/images/kit-extension.webp", aspect: 16 / 9 },
  { name: "NorDeUK", src: "/images/kit-nordeuk.webp", aspect: 16 / 9 },
];

// section progress (0..1), one segment per kit. Snap anchors sit on clean rest states: the hero, then each kit locked.
// The first move also carries the logo loss and NO SIGNAL, which is not its own stop.
const SEG = 1 / KITS.length;
const ANCHORS = KITS.map((_, i) => i * SEG).concat(1);
const LOGO_END = 0.44 * SEG;   // hero logo loses signal
const STATIC_END = 0.6 * SEG;  // static flash, then NO SIGNAL
const KIT_START = KITS.map((_, i) => (i ? (i + 0.12) * SEG : STATIC_END));
const KIT_LOCKED = KITS.map((_, i) => (i ? (i + 0.8) * SEG : 0.92 * SEG)); // each anchor sits in its kit's locked hold
const KIT_FADE = 0.08 * SEG;   // glitch-out before the next kit
const SCROLL_SVH = 100 * KITS.length; // scroll distance; the section is this plus one stage tall
const K = 6;             // display progress easing rate (1/s)
const MOVE_S = 1.1;      // seconds the glitch takes to play one kit move at full speed
const VMAX = SEG / MOVE_S; // display progress speed cap (1/s), per kit so more kits do not mean faster glitches
const MAX_LEVEL = 8;     // largest mosaic block: 2^8 device px
const VOID = "#050608";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const smooth = (a: number, b: number, v: number) => {
  const x = clamp((v - a) / (b - a));
  return x * x * (3 - 2 * x);
};
// smooth noise in -1..1: incommensurate sines drift instead of jumping per random seed
const sn = (t: number, s = 0) =>
  (Math.sin(t * 1.7 + s) + 0.6 * Math.sin(t * 2.9 + s * 1.3) + 0.3 * Math.sin(t * 5.3 + s * 2.1)) / 1.9;

export default function SignalLoss() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const acquiringRef = useRef<HTMLSpanElement>(null);
  const noSignalRef = useRef<HTMLDivElement>(null);
  const headRefs = useRef<(HTMLHeadingElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current!;
    const stage = stageRef.current!;
    const heroWrap = heroRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = mq.matches;
    const onMotion = () => { reduced = mq.matches; dirty = true; schedule(); };
    mq.addEventListener("change", onMotion);

    // hero parts, found by structure so hero.tsx stays a plain section
    const logoBox = heroWrap.querySelector<HTMLElement>("[data-hero-logo]")!;
    const logoEl = logoBox.querySelector<HTMLElement>("[role=img]") ?? logoBox;
    const column = logoBox.parentElement!;
    // chrome drops out with the signal; the ribbon mesh and its vignette stay as background a little longer
    const chrome = [...(heroWrap.firstElementChild?.children ?? []), ...column.children].filter(
      (el) => el !== column && el !== logoBox && !/^(STYLE|H1)$/.test(el.tagName)
        && !el.querySelector("canvas") && !(el.getAttribute("class") ?? "").includes("gradient"),
    ) as HTMLElement[];

    const buf = document.createElement("canvas"); // full-res source: logo or kit
    const bctx = buf.getContext("2d")!;
    const scratch = document.createElement("canvas");
    const sctx = scratch.getContext("2d")!;
    const gmk = new Path2D(GMK_PATH);
    const word = new Path2D(WORD_PATH);

    // fine grain: a few pre-rendered 1px noise tiles, offset randomly per frame
    const TILE = 128;
    const tiles = [0, 1, 2, 3].map(() => {
      const c = document.createElement("canvas");
      c.width = c.height = TILE;
      const x = c.getContext("2d")!;
      const im = x.createImageData(TILE, TILE);
      for (let i = 0; i < im.data.length; i += 4) {
        if (Math.random() > 0.45) continue;
        const g = Math.random() * 255;
        im.data[i] = g * 0.55; im.data[i + 1] = g * 0.75; im.data[i + 2] = g; im.data[i + 3] = 255;
      }
      x.putImageData(im, 0, 0);
      return ctx.createPattern(c, "repeat")!;
    });
    let lines: CanvasPattern | null = null;
    let lineStep = 3;

    // decoded off the main thread: drawing a freshly loaded <img> decodes it mid-transition and drops frames
    const bmps: (CanvasImageSource | undefined)[] = [];
    const imgs = KITS.map((k, i) => {
      if (!k.src) return null;
      const im = new Image();
      im.decoding = "async";
      im.onload = () => {
        const ready = (b: CanvasImageSource) => { if (im.onload) { bmps[i] = b; dirty = true; schedule(); } };
        createImageBitmap(im).then(ready, () => ready(im));
      };
      im.src = k.src;
      return im;
    });
    const loaded = (i: number) => !imgs[i] || !!bmps[i];

    let W = 0, H = 0, dpr = 1;
    let box = { x: 0, y: 0, w: 0, h: 0 };
    let boxKit = -1;
    let areaW = 0, areaH = 0;
    let logo = { x: 0, y: 0, w: 0 };
    let logoStale = true;
    let dirty = true;
    let raf = 0, visible = false, lastT = 0;
    let dp = -1, drawnP = -1, wasAnimating = false;
    const set = (el: HTMLElement | null, prop: "opacity" | "visibility" | "pointerEvents" | "transform", v: string) => {
      if (el && el.style[prop] !== v) el.style[prop] = v;
    };

    function resize() {
      W = stage.clientWidth;
      H = stage.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = buf.width = scratch.width = Math.round(W * dpr);
      canvas.height = buf.height = scratch.height = Math.round(H * dpr);
      areaW = W - 32;
      areaH = H - (W < 640 ? 200 : 220);
      boxKit = -1;
      lineStep = Math.max(2, Math.round(3 * dpr));
      const lc = document.createElement("canvas");
      lc.width = 1;
      lc.height = lineStep;
      const lx = lc.getContext("2d")!;
      lx.fillStyle = "#000";
      lx.fillRect(0, 0, 1, Math.max(1, Math.round(dpr)));
      lines = ctx.createPattern(lc, "repeat");
      srcKey = "";
      logoStale = true;
      dirty = true;
    }

    function progress() {
      const r = section.getBoundingClientRect();
      return clamp(-r.top / (r.height - stage.offsetHeight));
    }

    // ---- source image + box-filtered pyramid: level k is the source in 2^k px blocks, cached per source
    const lv: HTMLCanvasElement[] = [buf];
    let built = 0, srcKey = "", srcGen = 0;
    function source(key: string, draw: (c: CanvasRenderingContext2D) => void) {
      if (key === srcKey) return;
      bctx.clearRect(0, 0, buf.width, buf.height);
      draw(bctx);
      srcKey = key;
      srcGen++;
      built = 0;
    }
    function level(k: number) {
      for (; built < k; built++) {
        const prev = lv[built];
        const c = (lv[built + 1] ??= document.createElement("canvas"));
        const x = c.getContext("2d")!;
        const w = Math.ceil(prev.width / 2), h = Math.ceil(prev.height / 2);
        if (c.width !== w || c.height !== h) { c.width = w; c.height = h; } else x.clearRect(0, 0, w, h);
        x.imageSmoothingEnabled = true;
        x.drawImage(prev, 0, 0, prev.width / 2, prev.height / 2);
      }
      return lv[k];
    }

    // chromatic aberration ghosts: the source tinted in nuSignal blue and cyan-white, at >= half res
    const tints = ["#2f7bff", "#bfefff"].map((color) => {
      const c = document.createElement("canvas");
      return { c, x: c.getContext("2d")!, color };
    });
    let tintKey = "";
    function ghosts(k: number) {
      const key = `${srcGen}:${k}`;
      if (key === tintKey) return;
      tintKey = key;
      const src = level(k);
      for (const g of tints) {
        if (g.c.width !== src.width || g.c.height !== src.height) { g.c.width = src.width; g.c.height = src.height; }
        g.x.globalCompositeOperation = "copy";
        g.x.drawImage(src, 0, 0);
        g.x.globalCompositeOperation = "multiply"; // keeps black black, so the void never hazes
        g.x.fillStyle = g.color;
        g.x.fillRect(0, 0, src.width, src.height);
        g.x.globalCompositeOperation = "destination-in";
        g.x.drawImage(src, 0, 0);
      }
    }

    function drawLogo(c: CanvasRenderingContext2D) {
      if (logoStale) {
        // relative to the hero wrapper, so its offscreen transform does not matter
        const r = logoEl.getBoundingClientRect(), o = heroWrap.getBoundingClientRect();
        logo = { x: r.left - o.left, y: r.top - o.top + (r.height - (r.width * LOGO_H) / LOGO_W) / 2, w: r.width };
        logoStale = false;
      }
      // same geometry as <NuSignalLogo>, drawn into the DOM logo's rect
      const k = (logo.w / LOGO_W) * dpr;
      sctx.setTransform(1, 0, 0, 1, 0, 0);
      sctx.globalCompositeOperation = "source-over";
      sctx.clearRect(0, 0, scratch.width, scratch.height);
      sctx.setTransform(k, 0, 0, k, logo.x * dpr, logo.y * dpr);
      sctx.fillStyle = "#3b8bff";
      sctx.fill(gmk, "evenodd");
      sctx.fillStyle = "#e8eefb";
      sctx.fill(word, "evenodd");
      sctx.setTransform(1, 0, 0, 1, 0, 0);
      // one shadow for the whole mark, matching the DOM logo's drop-shadow
      c.shadowColor = "rgba(31,111,224,0.35)";
      c.shadowBlur = 24 * dpr;
      c.drawImage(scratch, 0, 0);
      c.shadowColor = "transparent";
      c.shadowBlur = 0;
    }

    // fit kit i's render into the stage, centred, and move the scope frame onto it
    function fitBox(i: number) {
      if (i === boxKit) return;
      boxKit = i;
      const a = KITS[i].aspect;
      const w = Math.min(areaW, areaH * a), h = w / a;
      box = { x: (W - w) / 2, y: (H - h) / 2 + (W < 640 ? 10 : 0), w, h };
      const f = frameRef.current!;
      f.style.left = box.x + "px";
      f.style.top = box.y + "px";
      f.style.width = w + "px";
      f.style.height = h + "px";
    }

    function drawKit(c: CanvasRenderingContext2D, i: number, t: number) {
      const w = buf.width, h = buf.height;
      c.fillStyle = VOID;
      c.fillRect(0, 0, w, h);
      const x = box.x * dpr, y = box.y * dpr, bw = box.w * dpr, s = box.h * dpr;
      const im = imgs[i];
      if (!im) {
        // placeholder: cap-black square with a faint "nu" from the logo paths
        c.fillStyle = "#0d0f13";
        c.fillRect(x, y, bw, s);
        const k = (s * 0.3) / 114; // the "nu" of the wordmark spans x 0..114, y 103..155
        c.save();
        c.translate(x + bw / 2 - 57 * k, y + s / 2 - 129 * k);
        c.scale(k, k);
        c.beginPath();
        c.rect(0, 100, 118, 60);
        c.clip();
        c.fillStyle = "rgba(59,139,255,0.3)";
        c.fill(word, "evenodd");
        c.restore();
        return;
      }
      if (bmps[i]) {
        c.drawImage(bmps[i], x, y, bw, s);
        return;
      }
      // skeleton: dim panel with a scanning band, so the frame is never an empty box
      c.fillStyle = "#0a0f1a";
      c.fillRect(x, y, bw, s);
      const bh = s * 0.18;
      const by = y - bh + ((t * 0.45) % 1) * (s + bh);
      const g = c.createLinearGradient(0, by, 0, by + bh);
      g.addColorStop(0, "rgba(59,139,255,0)");
      g.addColorStop(0.5, "rgba(59,139,255,0.22)");
      g.addColorStop(1, "rgba(59,139,255,0)");
      c.save();
      c.beginPath();
      c.rect(x, y, bw, s);
      c.clip();
      c.fillStyle = g;
      c.fillRect(x, by, bw, bh);
      c.restore();
    }

    // source -> ctx with mosaic (crossfaded between two pyramid levels), aberration and slices
    function present(o: { block: number; ab: number; slices: number; burst: number; alpha: number; t: number }) {
      const w = canvas.width, h = canvas.height;
      const lf = Math.log2(clamp(o.block * dpr, 1, 2 ** MAX_LEVEL));
      const k0 = Math.floor(lf), f = lf - k0;
      const blit = (c: HTMLCanvasElement, k: number, dx = 0, dy = 0) =>
        ctx.drawImage(c, dx, dy, c.width * 2 ** k, c.height * 2 ** k);
      const d = o.ab * dpr;
      // aberration takes its share from the main image, so the frame does not brighten while it is on
      const a = d > 0.4 ? Math.min(0.6, o.ab / 10) : 0;
      ctx.imageSmoothingEnabled = false;
      ctx.globalAlpha = o.alpha * (1 - a);
      blit(level(k0), k0);
      if (f > 0.01) {
        ctx.globalAlpha = o.alpha * (1 - a) * f;
        blit(level(k0 + 1), k0 + 1);
      }
      if (a > 0) {
        const gk = Math.max(1, k0);
        ghosts(gk);
        ctx.imageSmoothingEnabled = gk === 1; // soft fringe while near crisp, blocky once the mosaic is coarse
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = o.alpha * a;
        blit(tints[0].c, gk, -d, d * 0.12);
        blit(tints[1].c, gk, d, -d * 0.12);
        ctx.globalCompositeOperation = "source-over";
      }
      ctx.globalAlpha = 1;

      // thin horizontal bands displaced by smooth noise, copied from a snapshot so the canvas never draws onto itself
      if (o.slices > 0.02 || o.burst > 0.02) {
        sctx.globalCompositeOperation = "copy";
        sctx.drawImage(canvas, 0, 0);
        sctx.globalCompositeOperation = "source-over";
        const n = 2 + Math.round(o.slices * 2 + o.burst * 3);
        for (let k = 0; k < n; k++) {
          const y = (0.5 + 0.5 * sn(o.t * 0.3, k * 7.3)) * h;
          const sh = (2 + (0.5 + 0.5 * sn(o.t * 0.8, k * 3.1)) * (5 + o.burst * 26)) * dpr;
          const dx = sn(o.t * 2.3, k * 5.7) * (o.slices * 22 + o.burst * 90) * dpr;
          ctx.clearRect(0, y, w, sh);
          ctx.drawImage(scratch, 0, y, w, sh, dx, y, w, sh);
        }
      }
    }

    // subtle scanlines with a slow vertical roll and a soft flicker
    function scanlines(s: number, t: number) {
      if (s <= 0.01 || !lines) return;
      ctx.save();
      ctx.globalAlpha = s * (0.2 + 0.04 * sn(t * 11, 4));
      ctx.translate(0, (t * 14 * dpr) % lineStep);
      ctx.fillStyle = lines;
      ctx.fillRect(0, -lineStep, canvas.width, canvas.height + lineStep);
      ctx.restore();
    }

    function grain(a: number) {
      if (a <= 0.005) return;
      const ox = Math.floor(Math.random() * TILE), oy = Math.floor(Math.random() * TILE);
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = Math.min(1, a);
      ctx.fillStyle = tiles[Math.floor(Math.random() * tiles.length)];
      ctx.translate(-ox, -oy);
      ctx.fillRect(0, 0, canvas.width + TILE, canvas.height + TILE);
      ctx.restore();
    }

    // hero layer: chrome glitches out first, the background fades as the signal goes
    function heroState(q: number, t: number) {
      const bg = 1 - smooth(0.55, 1, q);
      set(heroWrap, "opacity", String(bg));
      // opacity alone would leave the ribbon mesh running; out of the clipped stage its IntersectionObserver pauses it
      set(heroWrap, "transform", bg <= 0 ? "translateY(-200%)" : "");
      set(logoEl, "opacity", dp > 0 ? "0" : ""); // the canvas draws it from here on
      const cf = 1 - smooth(0, 0.35, q);
      chrome.forEach((el, i) => {
        const flick = reduced || cf >= 1 ? 1 : 0.55 + 0.45 * (0.5 + 0.5 * sn(t * 9, i * 2.7));
        set(el, "opacity", cf >= 1 ? "" : String(cf * flick));
        set(el, "visibility", cf <= 0 ? "hidden" : "");
        set(el, "pointerEvents", cf < 0.5 ? "none" : "");
      });
    }

    function render(t: number) {
      const p = dp;
      const ns = noSignalRef.current!;
      const f = frameRef.current!;
      let animating = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (p < LOGO_END) {
        // ---- phase 1: the hero logo loses signal over a transparent canvas
        const q = p / LOGO_END;
        heroState(q, t);
        source("logo", drawLogo); // also at rest, so the first scroll frame does not pay for the logo raster
        if (p > 0) {
          const g = reduced ? 0 : smooth(0.08, 1, q);
          // sharper bursts only near the end of the loss
          const burst = reduced ? 0 : smooth(0.7, 1, q) * Math.max(0, sn(t * 3.1, 9)) ** 4;
          present({
            block: 1 + g ** 1.6 * 72,
            ab: g * 15 * (0.65 + 0.35 * sn(t * 1.1, 2)) + burst * 10,
            slices: Math.min(1, g * g * 1.25),
            burst,
            alpha: 1 - (reduced ? q : smooth(0.88, 1, q)),
            t,
          });
          scanlines(g, t);
          grain(g * 0.1);
          animating = !reduced;
        }
        set(ns, "opacity", "0");
        set(f, "opacity", "0");
        headRefs.current.forEach((h) => set(h, "opacity", "0"));
      } else if (p < STATIC_END) {
        // ---- static flash, then NO SIGNAL
        const q = (p - LOGO_END) / (STATIC_END - LOGO_END);
        heroState(1, t);
        ctx.fillStyle = VOID;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (!reduced) {
          const s = 1 - smooth(0, 0.6, q);
          grain(0.5 * s);
          scanlines(s, t);
          animating = s > 0;
        }
        set(ns, "opacity", String(smooth(0.3, 0.6, q)));
        set(f, "opacity", "0");
        headRefs.current.forEach((h) => set(h, "opacity", "0"));
      } else {
        // ---- kits resolve: blocks refine, aberration converges to zero, grain fades
        heroState(1, t);
        let i = 0;
        while (i + 1 < KITS.length && p >= KIT_START[i + 1]) i++;
        const lock = clamp((p - KIT_START[i]) / (KIT_LOCKED[i] - KIT_START[i]));
        const next = KIT_START[i + 1];
        const out = next ? smooth(next - KIT_FADE, next, p) : 0;
        const g = reduced ? 0 : Math.max(1 - ease(lock), out);
        const vis = smooth(0, 0.15, lock) * (1 - out);
        fitBox(i);
        const ready = loaded(i);
        source(ready ? `kit${i}` : `skel${t}`, (c) => drawKit(c, i, t));
        present({
          block: 1 + g ** 1.4 * (Math.min(box.w, box.h) / 8),
          ab: g * 16 * (0.7 + 0.3 * sn(t * 1.3, i)),
          slices: g * g * 0.9,
          burst: 0,
          alpha: vis,
          t,
        });
        scanlines(0.15 + 0.5 * g, t);
        grain(g * 0.14);
        animating = !ready || g > 0;
        set(ns, "opacity", i === 0 ? String(1 - smooth(0, 0.4, lock)) : "0");
        set(f, "opacity", String(vis));
        set(acquiringRef.current, "opacity", ready ? "0" : "1");
        headRefs.current.forEach((h, j) => set(h, "opacity", j === i ? String(vis) : "0"));
      }
      return animating;
    }

    function frame(now: number) {
      raf = 0;
      const target = progress();
      // eased display progress, frame-rate independent, so snaps and free scrolling both animate fluidly
      if (dp < 0 || reduced) dp = target;
      else {
        const dt = Math.min(0.1, (now - lastT) / 1000);
        // a snap moves the scroll a whole screen in ~0.1s; capping the speed lets the glitch play out instead of flashing by
        dp += clamp((target - dp) * (1 - Math.exp(-dt * K)), -VMAX * dt, VMAX * dt);
        if (Math.abs(target - dp) < 1e-4) dp = target;
      }
      lastT = now;
      let animating = false;
      if (dirty || dp !== drawnP || wasAnimating) {
        animating = render(now / 1000);
        drawnP = dp;
        dirty = false;
      }
      wasAnimating = animating;
      // run while easing or glitching; stop when settled
      if (visible && (animating || dp !== target)) raf = requestAnimationFrame(frame);
    }
    function schedule() {
      if (raf || !visible) return;
      lastT = performance.now();
      raf = requestAnimationFrame(frame);
    }

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) { dirty = true; schedule(); }
    });
    io.observe(section);
    // stage resizes rebuild everything; hero layout shifts (e.g. font swap) only move the logo
    const ro = new ResizeObserver(() => { resize(); schedule(); });
    ro.observe(stage);
    const lro = new ResizeObserver(() => { logoStale = true; srcKey = ""; dirty = true; schedule(); });
    lro.observe(column); // the logo is centred in this column, so its size changes move the logo
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      visible = false;
      io.disconnect();
      ro.disconnect();
      lro.disconnect();
      mq.removeEventListener("change", onMotion);
      imgs.forEach((im) => { if (im) im.onload = null; });
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
    };
  }, []);

  const corner = "absolute h-5 w-5 border-signal-bright";
  return (
    <section
      ref={sectionRef}
      id="signal-loss"
      aria-label="Signal loss and kit reveal"
      className="relative bg-void"
      style={{ height: `calc(${SCROLL_SVH}svh + 100svh)` }}
    >
      {/* snap rest points; 1px tall so the snap never allows free scroll between phases */}
      {ANCHORS.map((a) => (
        <div key={a} aria-hidden className="absolute inset-x-0 h-px snap-start snap-always" style={{ top: `${a * SCROLL_SVH}svh` }} />
      ))}

      <div ref={stageRef} className="sticky top-0 h-svh w-full overflow-hidden">
        {/* isolate: the hero's z-10 children must stay under the canvas */}
        <div ref={heroRef} className="absolute inset-0 isolate">
          <Hero />
        </div>

        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />

        {/* no JS: nothing drives the stage, so unpin it and show the hero, then the kit renders, in normal flow */}
        <noscript>
          <style>{`#signal-loss{height:auto!important}#signal-loss>.snap-start,#signal-loss canvas{display:none}#signal-loss>.sticky{position:static;height:auto}#signal-loss .isolate{position:relative;height:100svh}`}</style>
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            {KITS.filter((k) => k.src).map((k) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={k.src} src={k.src} alt={`GMK nuSignal ${k.name.toLowerCase()} render`} width={1600} height={Math.round(1600 / k.aspect)} className="h-auto w-full" />
            ))}
          </div>
        </noscript>

        {/* kit headings, faded in with each kit; kept in the DOM for screen readers */}
        <div className="pointer-events-none absolute inset-x-4 top-12 text-center sm:top-16">
          {KITS.map((k, j) => (
            <h2
              key={k.name}
              ref={(el) => { headRefs.current[j] = el; }}
              className="absolute inset-x-0 font-display text-lg font-bold uppercase tracking-[0.15em] text-signal-bright opacity-0 sm:text-2xl"
            >
              <span className="sr-only">GMK nuSignal </span>{k.name}
              <span className="sr-only">: image of the {k.name.toLowerCase()} keycaps</span>
            </h2>
          ))}
        </div>

        {/* scope frame around the kit render */}
        <div ref={frameRef} className="pointer-events-none absolute opacity-0">
          <div className="absolute inset-0 border border-signal/25" />
          <span className={`${corner} -left-2 -top-2 border-l-2 border-t-2`} />
          <span className={`${corner} -right-2 -top-2 border-r-2 border-t-2`} />
          <span className={`${corner} -bottom-2 -left-2 border-b-2 border-l-2`} />
          <span className={`${corner} -bottom-2 -right-2 border-b-2 border-r-2`} />
          <span ref={acquiringRef} className="absolute inset-x-0 bottom-3 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-signal opacity-0 sm:text-xs">
            Acquiring…
          </span>
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
