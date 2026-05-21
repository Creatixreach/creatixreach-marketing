"use client";

import { useEffect, useRef } from "react";

// 2D canvas falling-binary effect.
// Pauses when prefers-reduced-motion is reduce.

const COLUMN_WIDTH = 14;
const FONT_PX = 14;
const FALL_SPEED = 0.35; // base step per frame (60fps)
const TRAIL_ALPHA = 0.08; // overlay alpha for fade trail
const GLYPHS = "01";

type Column = {
  y: number;
  speed: number;
  hueIsIndigo: boolean;
  glyphCycle: number;
};

export function CodeRain({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reducedMql = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = reducedMql.matches;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let columns: Column[] = [];

    function rebuildColumns() {
      const colCount = Math.max(1, Math.ceil(width / COLUMN_WIDTH));
      columns = Array.from({ length: colCount }, () => ({
        y: Math.random() * height,
        speed: FALL_SPEED * (0.6 + Math.random() * 1.2),
        hueIsIndigo: Math.random() < 0.55,
        glyphCycle: Math.random() * 1000,
      }));
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.max(1, Math.floor(width * dpr));
      canvas!.height = Math.max(1, Math.floor(height * dpr));
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.scale(dpr, dpr);
      ctx!.font = `${FONT_PX}px ui-monospace, "SF Mono", Menlo, monospace`;
      ctx!.textBaseline = "top";
      rebuildColumns();
      // clear
      ctx!.fillStyle = "rgba(15, 23, 42, 1)";
      ctx!.fillRect(0, 0, width, height);
    }

    function drawStatic() {
      // single static frame for reduced motion (deterministic-ish columns)
      ctx!.fillStyle = "rgba(15, 23, 42, 1)";
      ctx!.fillRect(0, 0, width, height);
      const rows = Math.ceil(height / FONT_PX);
      for (let c = 0; c < columns.length; c++) {
        for (let r = 0; r < rows; r++) {
          const ch = ((c * 7 + r * 3) % 2).toString();
          const fadeIdx = ((c * 17 + r * 11) % 8) / 8;
          const indigo = (c + r) % 2 === 0;
          const alpha = 0.05 + fadeIdx * 0.18;
          ctx!.fillStyle = indigo
            ? `rgba(99, 102, 241, ${alpha})`
            : `rgba(255, 255, 255, ${alpha * 0.7})`;
          ctx!.fillText(ch, c * COLUMN_WIDTH + 1, r * FONT_PX);
        }
      }
    }

    function step() {
      // trail fade
      ctx!.fillStyle = `rgba(15, 23, 42, ${TRAIL_ALPHA})`;
      ctx!.fillRect(0, 0, width, height);

      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        col.y += col.speed * 8; // pixels per frame ~ FALL_SPEED * 8 (~3px)
        col.glyphCycle += 1;

        if (col.y > height + 40) {
          col.y = -Math.random() * 80;
          col.speed = FALL_SPEED * (0.6 + Math.random() * 1.2);
          col.hueIsIndigo = Math.random() < 0.55;
        }

        const x = i * COLUMN_WIDTH + 1;
        const glyph = GLYPHS[Math.floor(col.glyphCycle / 6) % GLYPHS.length];
        // head (bright)
        ctx!.fillStyle = col.hueIsIndigo
          ? "rgba(165, 180, 252, 0.95)"
          : "rgba(255, 255, 255, 0.95)";
        ctx!.fillText(glyph, x, col.y);
        // mid tone behind
        ctx!.fillStyle = col.hueIsIndigo
          ? "rgba(99, 102, 241, 0.55)"
          : "rgba(255, 255, 255, 0.35)";
        ctx!.fillText(
          GLYPHS[(Math.floor(col.glyphCycle / 6) + 1) % GLYPHS.length],
          x,
          col.y - FONT_PX
        );
      }

      rafRef.current = window.requestAnimationFrame(step);
    }

    function start() {
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(step);
    }
    function stop() {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }

    function applyMotionMode() {
      stop();
      if (reduced) {
        drawStatic();
      } else {
        start();
      }
    }

    const ro = new ResizeObserver(() => {
      resize();
      applyMotionMode();
    });
    ro.observe(canvas);

    function onMotion(e: MediaQueryListEvent) {
      reduced = e.matches;
      applyMotionMode();
    }
    if (reducedMql.addEventListener) reducedMql.addEventListener("change", onMotion);
    else reducedMql.addListener(onMotion);

    resize();
    applyMotionMode();

    return () => {
      stop();
      ro.disconnect();
      if (reducedMql.removeEventListener)
        reducedMql.removeEventListener("change", onMotion);
      else reducedMql.removeListener(onMotion);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
}
