"use client";

import { useRef } from "react";
import type { PlayerStats } from "@/lib/types";

interface ComparisonCardProps {
  title: string;
  data: PlayerStats;
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <p className="stat-label">{label}</p>
      <p className="stat-value" style={{ fontSize: "1.3rem" }}>{value}</p>
    </div>
  );
}

export default function ComparisonCard({ title, data }: ComparisonCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect  = card.getBoundingClientRect();
    const cx    = rect.left + rect.width  / 2;
    const cy    = rect.top  + rect.height / 2;
    const dx    = (e.clientX - cx) / (rect.width  / 2);
    const dy    = (e.clientY - cy) / (rect.height / 2);
    const rotX  = (-dy * 7).toFixed(2);
    const rotY  = ( dx * 7).toFixed(2);
    card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`;
  }

  function handleMouseLeave() {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
  }

  const kda = data.recentPerformance;

  return (
    <div
      className="card-tilt-wrapper"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={cardRef}
        className="relic-card"
        style={{
          borderRadius: "2px",
          padding: "clamp(1.25rem, 3vw, 1.75rem)",
          transition: "transform 0.15s ease, box-shadow 0.3s ease",
          willChange: "transform",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* corner accent — top right */}
        <div style={{
          position: "absolute", top: 0, right: 0,
          width: "60px", height: "60px",
          borderTop: "1px solid rgba(200,155,60,0.35)",
          borderRight: "1px solid rgba(200,155,60,0.35)",
          pointerEvents: "none",
        }} />
        {/* corner accent — bottom left */}
        <div style={{
          position: "absolute", bottom: 0, left: 0,
          width: "40px", height: "40px",
          borderBottom: "1px solid rgba(200,155,60,0.2)",
          borderLeft: "1px solid rgba(200,155,60,0.2)",
          pointerEvents: "none",
        }} />

        {/* watermark initial */}
        <div aria-hidden="true" style={{
          position: "absolute",
          bottom: "-0.2em", right: "-0.05em",
          fontFamily: '"Cinzel Decorative", serif',
          fontSize: "6rem",
          fontWeight: 900,
          color: "rgba(200,155,60,0.04)",
          lineHeight: 1,
          userSelect: "none",
          pointerEvents: "none",
          letterSpacing: "-0.02em",
        }}>
          {title.charAt(0).toUpperCase()}
        </div>

        {/* header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
          <div>
            <p className="stat-label" style={{ marginBottom: "6px" }}>Summoner</p>
            <h2
              style={{
                fontFamily: '"Cinzel Decorative", serif',
                fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
                color: "#F0E6D3",
                fontWeight: 700,
                letterSpacing: "0.04em",
                lineHeight: 1.2,
              }}
            >
              {title}
            </h2>
          </div>
          <span className="badge-relic" style={{ flexShrink: 0, marginTop: "4px" }}>
            {data.summoner.rank}
          </span>
        </div>

        {/* divider */}
        <div style={{
          height: "1px",
          background: "linear-gradient(90deg, rgba(200,155,60,0.3), transparent)",
          margin: "1.25rem 0",
        }} />

        {/* main stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem 1rem" }}>
          <StatBlock label="LP"       value={String(data.summoner.lp)} />
          <StatBlock label="Win Rate" value={`${data.summoner.winRate}%`} />
          <StatBlock label="Wins"     value={String(data.summoner.wins)} />
          <StatBlock label="Losses"   value={String(data.summoner.losses)} />
        </div>

        {/* thin divider */}
        <div style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(200,155,60,0.15), transparent)",
          margin: "1.25rem 0",
        }} />

        {/* performance stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem 0.75rem" }}>
          <StatBlock
            label="K/D/A"
            value={`${kda.avgKills.toFixed(1)}/${kda.avgDeaths.toFixed(1)}/${kda.avgAssists.toFixed(1)}`}
          />
          <StatBlock label="KDA"    value={kda.kda.toFixed(2)} />
          <StatBlock label="Vision" value={kda.avgVisionScore.toFixed(1)} />
        </div>
      </div>
    </div>
  );
}
