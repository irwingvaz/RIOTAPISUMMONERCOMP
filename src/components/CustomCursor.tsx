"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const orbRef   = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // touchscreens don't have a mouse so skip the whole thing
    if (window.matchMedia("(hover: none)").matches) return;

    const orb   = orbRef.current;
    const trail = trailRef.current;
    if (!orb || !trail) return;

    // trail starts off screen so it doesn't flash at 0,0 on load
    let tx = -100, ty = -100;
    let cx = -100, cy = -100;
    let raf: number;

    function onMove(e: MouseEvent) {
      orb!.style.left = `${e.clientX}px`;
      orb!.style.top  = `${e.clientY}px`;
      tx = e.clientX;
      ty = e.clientY;
    }

    // lerp makes the trail feel floaty instead of just snapping to cursor pos
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
