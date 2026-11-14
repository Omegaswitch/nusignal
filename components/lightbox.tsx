"use client";

import { useEffect } from "react";

/*
 * Ported from GMK Liminal's gallery (src/lightbox.js). Click a picture with a .zoom button over it and the picture itself
 * travels from where it sits on the page to the middle of the screen, and back on close, so the eye follows one object.
 * Web Animations API, transform and opacity only; closing is the opening played backwards, so closing (or clicking again)
 * halfway through stays smooth. Previous / Next, the arrow keys or a swipe step through the pictures of the same section.
 */
const OPEN_MS = 760, CLOSE_RATE = 1.35, EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

export default function Lightbox() {
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const box = document.createElement("div");
    box.className = "lb"; box.hidden = true;
    box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", "Larger picture");
    box.innerHTML = '<div class="lb-back"></div><figure class="lb-fig"><div class="lb-frame"><img class="lb-img" alt=""></div></figure>'
      + '<button type="button" class="lb-close" aria-label="Close">Close</button>'
      + '<button type="button" class="lb-step lb-prev" aria-label="Previous picture">Prev</button>'
      + '<button type="button" class="lb-step lb-next" aria-label="Next picture">Next</button>';
    document.body.append(box);
    const back = box.querySelector<HTMLElement>(".lb-back")!, frame = box.querySelector<HTMLElement>(".lb-frame")!;
    const img = box.querySelector<HTMLImageElement>(".lb-img")!, closeBtn = box.querySelector<HTMLButtonElement>(".lb-close")!;
    const steps = [...box.querySelectorAll<HTMLButtonElement>(".lb-step")];

    let state: "closed" | "open" | "closing" = "closed";
    let anims: Animation[] = [], opener: HTMLElement | null = null, figure: HTMLElement | null = null, group: HTMLElement[] = [];
    const duration = reduced ? 1 : OPEN_MS;

    // shows btn's picture in the frame and builds the travel between its place on the page and the middle of the screen
    function show(btn: HTMLElement): Animation[] {
      opener = btn; figure = btn.parentElement!;
      const thumb = figure.querySelector("img")!, win = figure.getBoundingClientRect(), shown = thumb.getBoundingClientRect();
      const nw = thumb.naturalWidth || 1, nh = thumb.naturalHeight || 1;
      img.src = thumb.currentSrc || thumb.src; img.alt = thumb.alt;
      frame.style.setProperty("--ar", String(nw / nh));
      box.hidden = false;
      const to = frame.getBoundingClientRect();                   // where CSS puts it: centred, as large as fits
      const opts: KeyframeAnimationOptions = { duration, easing: EASE, fill: "both" };
      figure.style.visibility = "hidden";                         // the travelling copy stands in for it

      // stepped to a picture that is off screen: it fades in where it is instead of travelling
      if (win.bottom < 0 || win.top > innerHeight) {
        return [frame.animate([{ opacity: 0, transform: `translate(${to.width * 0.02}px, ${to.height * 0.02}px) scale(0.96)` }, { opacity: 1, transform: "none" }], opts),
          img.animate([{ transform: "none" }, { transform: "none" }], opts)];
      }
      // frame: the window the thumbnail is seen through, grown to the final size. image: the picture as the thumbnail
      // shows it (cropped by object-cover), brought to fill the frame. Both in the frame's final coordinates.
      const k = win.width / to.width;
      const c = Math.max(shown.width / nw, shown.height / nh), cw = nw * c, ch = nh * c;
      const cl = shown.left + (shown.width - cw) / 2, ct = shown.top + (shown.height - ch) / 2;
      const frameFrom = `translate(${win.left - to.left}px, ${win.top - to.top}px) scale(${k})`;
      const imgFrom = `translate(${(cl - win.left) / k}px, ${(ct - win.top) / k}px) scale(${cw / win.width}, ${ch / win.height})`;
      return [
        frame.animate([{ transform: frameFrom }, { transform: "none" }], opts),
        img.animate([{ transform: imgFrom }, { transform: "none" }], opts),
      ];
    }

    function open(btn: HTMLElement) {
      if (state !== "closed") return;
      group = [...btn.closest("section")!.querySelectorAll<HTMLElement>(".zoom")];
      steps.forEach((s) => { s.hidden = group.length < 2; });
      state = "open";
      const fade: KeyframeAnimationOptions = { duration: duration * 0.5, delay: duration * 0.4, easing: "ease-out", fill: "both" };
      anims = [
        ...show(btn),
        back.animate([{ opacity: 0 }, { opacity: 1 }], { duration, easing: "ease-out", fill: "both" }),
        ...[closeBtn, ...steps].map((b) => b.animate([{ opacity: 0 }, { opacity: 1 }], fade)),
      ];
      closeBtn.focus({ preventScroll: true });
    }

    // the next or previous picture: a quick cross-fade in the frame; the close then travels back to that picture's place
    function step(dir: number) {
      if (state !== "open" || group.length < 2) return;
      const next = group[(group.indexOf(opener!) + dir + group.length) % group.length];
      let out: Animation | null = null;
      const swap = () => {
        out?.cancel();
        anims.slice(0, 2).forEach((a) => a.cancel());
        figure!.style.visibility = "";
        const travel = show(next);
        travel.forEach((a) => a.finish());
        anims.splice(0, 2, ...travel);
        if (!reduced) img.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: "ease-out" });
      };
      if (reduced) swap();
      else {
        out = img.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, easing: "ease-in", fill: "forwards" });
        out.finished.then(() => (state === "open" ? swap() : out!.cancel()), () => {});
      }
    }

    function close() {
      if (state !== "open") return;
      state = "closing";
      anims.forEach((a) => { a.updatePlaybackRate(CLOSE_RATE); a.reverse(); });
      anims[0].finished.then(() => {
        if (state !== "closing") return;                          // opened again meanwhile
        anims.forEach((a) => a.cancel());
        box.hidden = true; state = "closed";
        figure!.style.visibility = "";
        opener!.focus({ preventScroll: true }); opener = figure = null;
      }, () => {});
    }

    // clicking again halfway through a close turns it round, smoothly
    function reopen() {
      state = "open";
      anims.forEach((a) => { a.updatePlaybackRate(1); a.reverse(); });
    }

    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const zoom = t.closest?.<HTMLElement>(".zoom");
      if (zoom) { e.preventDefault(); open(zoom); return; }
      const s = t.closest?.(".lb-step");
      if (s) { step(s.classList.contains("lb-prev") ? -1 : 1); return; }
      if (!box.hidden && (t.closest(".lb-close") || !t.closest(".lb-frame"))) { if (state === "open") close(); else reopen(); }
    };
    const onKey = (e: KeyboardEvent) => {
      if (box.hidden) return;
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); if (state === "open") close(); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); step(e.key === "ArrowLeft" ? -1 : 1); }
      else if (e.key === "Tab") {                                 // focus stays on the dialog's own buttons
        e.preventDefault();
        const ctl = [closeBtn, ...steps].filter((b) => !b.hidden), i = ctl.indexOf(document.activeElement as HTMLButtonElement);
        ctl[(i + (e.shiftKey ? -1 : 1) + ctl.length) % ctl.length].focus({ preventScroll: true });
      } else if (["PageDown", "PageUp", "ArrowDown", "ArrowUp", " ", "Home", "End"].includes(e.key)) e.preventDefault(); // the page behind stays put
    };
    let x0: number | null = null;
    const onTouchStart = (e: TouchEvent) => { x0 = e.touches.length === 1 ? e.touches[0].clientX : null; };
    const onTouchEnd = (e: TouchEvent) => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    };
    const hold = (e: Event) => { if (!box.hidden) e.preventDefault(); };

    document.addEventListener("click", onClick);
    addEventListener("keydown", onKey, true);
    box.addEventListener("touchstart", onTouchStart, { passive: true });
    box.addEventListener("touchend", onTouchEnd);
    box.addEventListener("wheel", hold, { passive: false });
    box.addEventListener("touchmove", hold, { passive: false });
    return () => {
      document.removeEventListener("click", onClick);
      removeEventListener("keydown", onKey, true);
      anims.forEach((a) => a.cancel());
      box.remove();
    };
  }, []);
  return null;
}
