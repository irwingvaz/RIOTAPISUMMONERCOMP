"use client";

import useSWR from "swr";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import ComparisonCard from "@/components/ComparisonCard";
import KDAChart from "@/components/KDAChart";
import RadarStatChart from "@/components/RadarChart";
import ChampionPool from "@/components/ChampionPool";
import { PlayerComparison } from "@/lib/types";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  });

function LoadingSpinner() {
  return (
    <div
      className="relic-card"
      style={{
        borderRadius: "2px",
        padding: "5rem 2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2rem",
      }}
    >
      {/* spinning ring */}
      <div style={{ position: "relative", width: "64px", height: "64px" }}>
        <div style={{
          position: "absolute", inset: 0,
          borderRadius: "50%",
          border: "2px solid rgba(200,155,60,0.1)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          borderRadius: "50%",
          border: "2px solid transparent",
          borderTopColor: "#C89B3C",
          animation: "spin 1s linear infinite",
        }} />
        <div style={{
          position: "absolute", inset: "8px",
          borderRadius: "50%",
          border: "1px solid transparent",
          borderTopColor: "rgba(11,196,227,0.5)",
          animation: "spin 1.8s linear infinite reverse",
        }} />
      </div>

      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontFamily: '"Cinzel Decorative", serif',
            fontSize: "0.85rem",
            letterSpacing: "0.2em",
            color: "#F0E6D3",
            marginBottom: "8px",
          }}
        >
          Consulting the Rift
        </p>
        <p style={{
          fontFamily: '"Crimson Pro", serif',
          fontStyle: "italic",
          color: "rgba(240,230,211,0.45)",
          fontSize: "0.95rem",
        }}>
          Fetching match data from the Riot API — this may take a moment.
        </p>
      </div>

      {/* dot pulse row */}
      <div style={{ display: "flex", gap: "8px" }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            style={{
              width: "6px", height: "6px",
              borderRadius: "50%",
              background: "#C89B3C",
            }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: '"Cinzel Decorative", serif',
        fontSize: "0.7rem",
        letterSpacing: "0.3em",
        color: "rgba(200,155,60,0.6)",
      }}>
        Loading…
      </div>
    }>
      <CompareContent />
    </Suspense>
  );
}

const reveal = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0 },
};

function StatMiniCard({ label, p1, p2, p1Name, p2Name }: {
  label: string; p1: string; p2: string; p1Name: string; p2Name: string;
}) {
  return (
    <div className="relic-card" style={{ borderRadius: "2px", padding: "1.25rem 1.5rem", position: "relative" }}>
      <div style={{
        position: "absolute", top: 0, left: "10%", right: "10%", height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(200,155,60,0.3), transparent)",
      }} />
      <p className="stat-label" style={{ marginBottom: "1rem" }}>{label}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{
            fontFamily: '"Crimson Pro", serif',
            fontSize: "0.8rem",
            color: "rgba(240,230,211,0.5)",
            letterSpacing: "0.08em",
          }}>{p1Name}</span>
          <span style={{ fontFamily: '"Cinzel Decorative", serif', fontSize: "1rem", color: "#F0E6D3" }}>{p1}</span>
        </div>
        <div style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(200,155,60,0.15), transparent)",
        }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{
            fontFamily: '"Crimson Pro", serif',
            fontSize: "0.8rem",
            color: "rgba(240,230,211,0.5)",
            letterSpacing: "0.08em",
          }}>{p2Name}</span>
          <span style={{ fontFamily: '"Cinzel Decorative", serif', fontSize: "1rem", color: "#F0E6D3" }}>{p2}</span>
        </div>
      </div>
    </div>
  );
}

function CompareContent() {
  const params = useSearchParams();
  const p1 = params.get("p1") ?? "";
  const p2 = params.get("p2") ?? "";
  const r1 = params.get("r1") ?? "na1";
  const r2 = params.get("r2") ?? "na1";

  const query = useMemo(() => {
    const search = new URLSearchParams({ p1, p2, r1, r2 });
    return `/api/compare?${search.toString()}`;
  }, [p1, p2, r1, r2]);

  const { data, error, isLoading } = useSWR<PlayerComparison>(
    p1 && p2 ? query : null, fetcher
  );

  return (
    <main style={{ minHeight: "100vh", padding: "clamp(1.5rem, 4vw, 3rem) clamp(1rem, 4vw, 2rem)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* ── page header ── */}
        <motion.div
          variants={reveal} initial="hidden" animate="show"
          transition={{ duration: 0.8, ease: [0.22,1,0.36,1] }}
          style={{ marginBottom: "3rem", display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          {/* breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link href="/" className="btn-secondary-relic" style={{ display: "inline-block" }}>
              ← Home
            </Link>
            <span className="badge-relic">Live Matchup</span>
          </div>

          {/* heading */}
          <div>
            <p className="section-label" style={{ marginBottom: "0.75rem" }}>Performance Comparison</p>
            <h1
              className="heading-relic"
              style={{
                fontSize: "clamp(2rem, 6vw, 4.5rem)",
                lineHeight: 1,
              }}
            >
              <span className="shimmer-text">{p1}</span>
              <span style={{
                fontFamily: '"Cinzel Decorative", serif',
                fontSize: "0.4em",
                margin: "0 0.5em",
                verticalAlign: "middle",
                WebkitTextStroke: "1px rgba(200,155,60,0.4)",
                color: "transparent",
              } as React.CSSProperties}>VS</span>
              <span style={{ color: "rgba(240,230,211,0.6)" }}>{p2}</span>
            </h1>
          </div>

          {/* diagonal rule */}
          <div style={{
            height: "1px",
            background: "linear-gradient(90deg, rgba(200,155,60,0.5), transparent)",
            width: "clamp(200px, 50vw, 600px)",
            transform: "rotate(-0.2deg)",
          }} />
        </motion.div>

        {/* loading */}
        {isLoading && <LoadingSpinner />}

        {/* error */}
        {error && (
          <div className="relic-card" style={{
            borderRadius: "2px", padding: "3rem 2rem", textAlign: "center",
            borderColor: "rgba(255,138,122,0.3)",
          }}>
            <p style={{ fontFamily: '"Cinzel Decorative", serif', fontSize: "0.75rem", letterSpacing: "0.2em", color: "#FF8A7A" }}>
              Failed to load comparison data
            </p>
          </div>
        )}

        {/* API message */}
        {data?.message && (
          <div className="relic-card" style={{ borderRadius: "2px", padding: "3rem 2rem", textAlign: "center" }}>
            <p style={{ fontFamily: '"Crimson Pro", serif', fontStyle: "italic", color: "rgba(200,155,60,0.8)", fontSize: "1.1rem" }}>
              {data.message}
            </p>
          </div>
        )}

        {data?.player1 && data?.player2 && (
          <>
            {/* ── player cards + VS ── */}
            <motion.div
              variants={reveal} initial="hidden" animate="show"
              transition={{ duration: 0.8, delay: 0.08, ease: [0.22,1,0.36,1] }}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                gap: "1.5rem",
                alignItems: "stretch",
                marginBottom: "2.5rem",
              }}
            >
              <ComparisonCard title={data.player1.summoner.name} data={data.player1} />

              {/* VS center panel */}
              <div
                className="relic-card"
                style={{
                  borderRadius: "2px",
                  padding: "2rem 1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1rem",
                  minWidth: "120px",
                  position: "relative",
                }}
              >
                <p className="section-label">Head to Head</p>
                <div className="vs-glyph">VS</div>
                {/* vertical gold rule */}
                <div style={{
                  position: "absolute",
                  top: "15%", bottom: "15%",
                  left: "50%",
                  width: "1px",
                  background: "linear-gradient(180deg, transparent, rgba(200,155,60,0.3), transparent)",
                  transform: "translateX(-50%)",
                }} />
              </div>

              <ComparisonCard title={data.player2.summoner.name} data={data.player2} />
            </motion.div>

            {/* ── charts ── */}
            <motion.div
              variants={reveal} initial="hidden" animate="show"
              transition={{ duration: 0.8, delay: 0.16, ease: [0.22,1,0.36,1] }}
              style={{
                display: "grid",
                gap: "1.5rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                marginBottom: "2.5rem",
              }}
            >
              <div className="relic-card" style={{ borderRadius: "2px", padding: "1.5rem" }}>
                <p className="section-label" style={{ marginBottom: "1.25rem" }}>KDA Comparison</p>
                <KDAChart
                  left={data.player1.recentPerformance}
                  right={data.player2.recentPerformance}
                  leftLabel={data.player1.summoner.name}
                  rightLabel={data.player2.summoner.name}
                />
              </div>
              <div className="relic-card" style={{ borderRadius: "2px", padding: "1.5rem" }}>
                <p className="section-label" style={{ marginBottom: "1.25rem" }}>Performance Radar</p>
                <RadarStatChart
                  left={data.player1.recentPerformance}
                  right={data.player2.recentPerformance}
                  leftLabel={data.player1.summoner.name}
                  rightLabel={data.player2.summoner.name}
                />
              </div>
            </motion.div>

            {/* ── champion pools — staggered diagonal ── */}
            <motion.div
              variants={reveal} initial="hidden" animate="show"
              transition={{ duration: 0.8, delay: 0.24, ease: [0.22,1,0.36,1] }}
              style={{
                display: "grid",
                gap: "1.5rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                marginBottom: "2.5rem",
              }}
            >
              <div style={{ marginTop: "0" }}>
                <ChampionPool title={`${data.player1.summoner.name} — Champion Pool`} champions={data.player1.championPool} />
              </div>
              <div style={{ marginTop: "clamp(0px, 2vw, 24px)" }}>
                <ChampionPool title={`${data.player2.summoner.name} — Champion Pool`} champions={data.player2.championPool} />
              </div>
            </motion.div>

            {/* ── quick stats row ── */}
            <motion.div
              variants={reveal} initial="hidden" animate="show"
              transition={{ duration: 0.8, delay: 0.32, ease: [0.22,1,0.36,1] }}
              style={{
                display: "grid",
                gap: "1.5rem",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                marginBottom: "4rem",
              }}
            >
              <StatMiniCard
                label="Avg Gold"
                p1={`${data.player1.recentPerformance.avgGold.toFixed(1)}k`}
                p2={`${data.player2.recentPerformance.avgGold.toFixed(1)}k`}
                p1Name={data.player1.summoner.name}
                p2Name={data.player2.summoner.name}
              />
              <StatMiniCard
                label="Avg Damage"
                p1={`${data.player1.recentPerformance.avgDamage.toFixed(1)}k`}
                p2={`${data.player2.recentPerformance.avgDamage.toFixed(1)}k`}
                p1Name={data.player1.summoner.name}
                p2Name={data.player2.summoner.name}
              />
              <StatMiniCard
                label="Avg CS"
                p1={data.player1.recentPerformance.avgCS.toFixed(0)}
                p2={data.player2.recentPerformance.avgCS.toFixed(0)}
                p1Name={data.player1.summoner.name}
                p2Name={data.player2.summoner.name}
              />
            </motion.div>
          </>
        )}
      </div>
    </main>
  );
}
