"use client";

import { useEffect, useRef } from "react";
import "./home-ambient.css";

/**
 * The home page's ambient light (client request, 25 Nov 2026: the hero's feel throughout the home page): a quiet
 * network of green points on a fixed canvas behind the night sections. It drifts, links near points with faint
 * lines, and streaks with fast scrolling, so the whole page feels alive. 2D canvas, no library; it stops when the
 * tab is hidden and draws one still frame under reduced motion.
 */
export function HomeAmbient() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const css = getComputedStyle(document.documentElement);
    const lime = css.getPropertyValue("--color-lime").trim() || "#78be20";
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    type Dot = { x: number; y: number; vx: number; vy: number; r: number };
    let dots: Dot[] = [];
    const resize = () => {
      w = el.clientWidth;
      h = el.clientHeight;
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(110, (w * h) / 16000));
      dots = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: 0.6 + Math.random() * 1.4,
      }));
    };
    resize();
    let lastY = window.scrollY;
    let speed = 0;
    let raf = 0;
    const draw = () => {
      const y = window.scrollY;
      // Scroll speed eases in and out, so streaks follow the hand, not single wheel ticks.
      speed += (Math.max(-60, Math.min(60, y - lastY)) - speed) * 0.12;
      lastY = y;
      ctx.clearRect(0, 0, w, h);
      const link = 120;
      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy - speed * 0.12 * d.r;
        if (d.x < -20) d.x = w + 20;
        if (d.x > w + 20) d.x = -20;
        if (d.y < -20) d.y = h + 20;
        if (d.y > h + 20) d.y = -20;
      }
      ctx.lineWidth = 0.6;
      for (let i = 0; i < dots.length; i++) {
        const a = dots[i]!; // i < length
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j]!; // j < length
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < link) {
            ctx.globalAlpha = (1 - dist / link) * 0.14;
            ctx.strokeStyle = lime;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      const stretch = Math.min(14, Math.abs(speed) * 0.5);
      for (const d of dots) {
        ctx.globalAlpha = 0.35 + d.r * 0.2;
        ctx.strokeStyle = lime;
        ctx.lineWidth = d.r * 1.4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x, d.y + stretch * Math.sign(speed || 1) * d.r * 0.5 + 0.01);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (!still) raf = requestAnimationFrame(draw);
    };
    draw();
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !still) raf = requestAnimationFrame(draw);
    };
    addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  return <canvas ref={canvas} className="home-ambient" aria-hidden="true" />;
}
