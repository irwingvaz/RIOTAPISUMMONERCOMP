"use client";

import { useEffect, useRef } from "react";

export default function BackgroundCanvas() {
  const runesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = runesRef.current;
    if (!el) return;

    let raf: number;
    let offset = 0;

    function tick() {
      offset += 0.15;
      if (el) {
        el.style.transform = `translateY(${Math.sin(offset * 0.02) * 12}px) translateX(${Math.cos(offset * 0.015) * 8}px)`;
      }
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="rift-bg" aria-hidden="true">
      {/* SVG noise filter */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id="noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" mode="multiply" />
          </filter>
        </defs>
      </svg>

      {/* noise texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          filter: "url(#noise)",
          opacity: 0.04,
          background: "#fff",
          pointerEvents: "none",
        }}
      />

      {/* radial fog layers */}
      <div className="rift-fog rift-fog-1" />
      <div className="rift-fog rift-fog-2" />
      <div className="rift-fog rift-fog-3" />

      {/* drifting hex runes */}
      <div ref={runesRef} className="rift-runes" style={{ willChange: "transform" }} />

      {/* secondary subtle rune layer, offset */}
      <div
        className="rift-runes"
        style={{
          backgroundPosition: "60px 52px",
          opacity: 0.04,
          animationDelay: "4s",
          animationDuration: "11s",
        }}
      />
    </div>
  );
}
