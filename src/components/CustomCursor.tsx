"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const orbRef   = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const orb   = orbRef.current;
    const trail = trailRef.current;
    if (!orb || !trail) return;

    let tx = -100, ty = -100;   // trail target
    let cx = -100, cy = -100;   // current trail pos (lerped)
    let raf: number;

    function onMove(e: MouseEvent) {
      const x = e.clientX, y = e.clientY;
      orb!.style.left = `${x}px`;
      orb!.style.top  = `${y}px`;
      tx = x; ty = y;
    }

    function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

    function tick() {
      cx = lerp(cx, tx, 0.12);
      cy = lerp(cy, ty, 0.12);
      trail!.style.left = `${cx}px`;
      trail!.style.top  = `${cy}px`;
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div id="cursor-orb"   ref={orbRef}   aria-hidden="true" />
      <div id="cursor-trail" ref={trailRef} aria-hidden="true" />
    </>
  );
}
