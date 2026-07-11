"use client";

/**
 * ProfileArt — inlines /images/profile.svg and runs a blue "snake" that
 * travels the artwork's lines, leaving a slowly-fading afterglow.
 *
 * How it works: the art's lines are filled shapes, so we overlay stroked
 * paths (head dot + halo, slim body, soft glow, long fading tail), point them
 * at each artwork path's `d` in sequence, and advance stroke-dashoffset each
 * animation frame. The passed portion of the line stays lit via a per-line
 * afterglow stroke that fades out once the snake moves on.
 *
 * Driven by rAF, all geometry in SVG user units. Do NOT use WAAPI here
 * (Chromium skips paints on these compound paths) and do NOT add
 * vector-effect:non-scaling-stroke (Chromium computes dash patterns in
 * screen space under it, desyncing dash from getPointAtLength).
 */
import * as React from "react";
import { useReducedMotion } from "framer-motion";

const SVG_URL = "/images/profile.svg";
const SVG_NS = "http://www.w3.org/2000/svg";

/** geometry — in SVG user units (viewBox is ~1907×2170) */
const CORE_LENGTH = 460; // bright body streak
const TAIL_LENGTH = 1050; // faint trailing tail
const SPEED = 2600; // user units per second
const MIN_PATH_LENGTH = 90; // skip tiny dot-paths
const AFTERGLOW_FADE_MS = 3200; // how long the lit trace lingers before erasing

type CometController = {
  pause: () => void;
  resume: () => void;
  destroy: () => void;
};

const NOOP_CONTROLLER: CometController = { pause() {}, resume() {}, destroy() {} };

function startComet(svg: SVGSVGElement): CometController {
  const artPaths = Array.from(svg.querySelectorAll<SVGPathElement>("path")).filter(
    (p) => {
      try {
        return p.getTotalLength() > MIN_PATH_LENGTH;
      } catch {
        return false;
      }
    }
  );
  if (artPaths.length === 0) return NOOP_CONTROLLER;

  // layered strokes sharing one head position = comet with a fading tail
  // (widths in SVG user units — keeps dash + head dot in the same space)
  const mk = (length: number, width: string, opacity: string) => {
    const el = document.createElementNS(SVG_NS, "path");
    el.setAttribute("fill", "none");
    el.setAttribute("stroke", "var(--primary)");
    el.setAttribute("stroke-width", width);
    el.setAttribute("stroke-linecap", "round");
    el.style.opacity = opacity;
    el.style.pointerEvents = "none";
    return { el, length };
  };
  const layers = [
    mk(TAIL_LENGTH, "6", "0.16"), // long faint tail
    mk(CORE_LENGTH, "14", "0.28"), // soft glow
    mk(CORE_LENGTH, "5.5", "0.9"), // slim body
  ];
  svg.append(...layers.map((l) => l.el));

  // afterglow — the line the comet has passed stays lit, then fades back
  const afterglows = new Set<{ el: SVGPathElement; timer?: ReturnType<typeof setTimeout> }>();
  let activeGlow: SVGPathElement | null = null;

  const igniteLine = (d: string, lineLen: number) => {
    const el = document.createElementNS(SVG_NS, "path");
    el.setAttribute("fill", "none");
    el.setAttribute("stroke", "color-mix(in oklch, var(--primary) 45%, var(--foreground))");
    el.setAttribute("stroke-width", "7");
    el.setAttribute("stroke-linecap", "round");
    el.setAttribute("d", d);
    el.style.opacity = "0.5";
    el.style.pointerEvents = "none";
    el.style.strokeDasharray = `${lineLen} ${lineLen}`;
    el.style.strokeDashoffset = String(lineLen); // nothing lit yet
    svg.insertBefore(el, layers[0].el); // under the comet, over the art
    afterglows.add({ el });
    activeGlow = el;
  };

  const retireLine = () => {
    if (!activeGlow) return;
    const el = activeGlow;
    activeGlow = null;
    const entry = [...afterglows].find((a) => a.el === el);
    el.style.transition = `opacity ${AFTERGLOW_FADE_MS}ms ease-out`;
    el.style.opacity = "0"; // the comet's trace slowly erases
    if (entry) {
      entry.timer = setTimeout(() => {
        el.remove();
        afterglows.delete(entry);
      }, AFTERGLOW_FADE_MS + 100);
    }
  };

  let cancelled = false;
  let paused = false;
  let raf = 0;
  let i = 0;
  let len = 0;
  let needLoad = true;
  let head = 0; // arc-length position, accumulated frame by frame
  let lastTime = 0;

  const loadPath = () => {
    const current = artPaths[i];
    i = (i + 1) % artPaths.length;
    len = current.getTotalLength();
    const d = current.getAttribute("d") ?? "";
    for (const { el, length } of layers) {
      el.setAttribute("d", d);
      el.style.strokeDasharray = `${length} ${len + length}`;
      el.style.strokeDashoffset = String(length); // hidden until first tick
    }
    igniteLine(d, len);
    head = 30; // the head enters the line immediately
  };

  const tick = (now: number) => {
    if (cancelled || paused) return;
    if (needLoad) {
      needLoad = false;
      loadPath();
    }
    // accumulate distance with a CLAMPED delta: after a pause or a
    // background-tab gap the snake continues where it was instead of jumping
    if (lastTime) head += (Math.min(now - lastTime, 100) / 1000) * SPEED;
    lastTime = now;

    if (head >= len + TAIL_LENGTH) {
      retireLine(); // start the slow erase of this line's glow
      needLoad = true; // tail fully drained — hop straight to the next line
    } else {
      for (const { el, length } of layers) {
        // dash covers [head - length, head]; clipped naturally at path ends
        el.style.strokeDashoffset = String(length - head);
      }
      // reveal the afterglow up to wherever the head has reached
      if (activeGlow) {
        activeGlow.style.strokeDashoffset = String(Math.max(len - head, 0));
      }
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return {
    /** freeze in place (0 CPU) — resume() continues from the same spot */
    pause() {
      if (cancelled || paused) return;
      paused = true;
      cancelAnimationFrame(raf);
    },
    resume() {
      if (cancelled || !paused) return;
      paused = false;
      lastTime = 0; // don't count the paused time as travel
      raf = requestAnimationFrame(tick);
    },
    destroy() {
      cancelled = true;
      cancelAnimationFrame(raf);
      layers.forEach((l) => l.el.remove());
      afterglows.forEach((a) => {
        if (a.timer) clearTimeout(a.timer);
        a.el.remove();
      });
      afterglows.clear();
    },
  };
}

export function ProfileArt({
  className,
  label,
}: {
  className?: string;
  label: string;
}) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [markup, setMarkup] = React.useState<string | null>(null);

  // fetch + inline the svg once
  React.useEffect(() => {
    let alive = true;
    fetch(SVG_URL)
      .then((r) => r.text())
      .then((text) => {
        if (alive) setMarkup(text);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // create the comet ONCE per mount and drive pause/resume DIRECTLY from an
  // IntersectionObserver — no React state relay in between (a state-driven
  // version could miss the resume when scrolling back to the hero).
  // rAF already stops in background tabs, so those cost nothing either way.
  React.useEffect(() => {
    if (!markup || reduce) return;
    const host = hostRef.current;
    const svg = host?.querySelector("svg");
    if (!host || !svg) return;
    svg.querySelector("title")?.remove(); // no stray tooltip
    const controller = startComet(svg as SVGSVGElement);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) controller.resume();
        else controller.pause();
      },
      { threshold: 0.05 }
    );
    io.observe(host);
    return () => {
      io.disconnect();
      controller.destroy();
    };
  }, [markup, reduce]);

  return (
    <div
      ref={hostRef}
      role="img"
      aria-label={label}
      className={`profile-art ${className ?? ""}`}
      // own static asset, fetched same-origin from /public
      dangerouslySetInnerHTML={markup ? { __html: markup } : undefined}
    />
  );
}
