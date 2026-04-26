"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import PlayerSearch from "@/components/PlayerSearch";

interface RecentComparison {
  p1: string; r1: string;
  p2: string; r2: string;
  starred: boolean;
  timestamp: number;
}

const STORAGE_KEY = "lol-versus-recent";

function loadRecent(): RecentComparison[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveRecent(items: RecentComparison[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export default function HomePage() {
  const router = useRouter();
  const [player1, setPlayer1] = useState({ region: "na1", name: "" });
  const [player2, setPlayer2] = useState({ region: "na1", name: "" });
  const [recent, setRecent]   = useState<RecentComparison[]>([]);
  const [comparing, setComparing] = useState(false);

  // localStorage isn't available during SSR so we hydrate after mount
  useEffect(() => { setRecent(loadRecent()); }, []);

  const onCompare = () => {
    if (!player1.name || !player2.name) return;
    setComparing(true);

    const entry: RecentComparison = {
      p1: player1.name, r1: player1.region,
      p2: player2.name, r2: player2.region,
      starred: false, timestamp: Date.now(),
    };

    // dedupe by exact p1/p2/r1/r2 combo so the same matchup doesn't pile up
    const existing = loadRecent();
    const filtered = existing.filter(
      (r) => !(r.p1 === entry.p1 && r.p2 === entry.p2 && r.r1 === entry.r1 && r.r2 === entry.r2)
    );
    // if they starred this matchup before, carry that over
    const prev = existing.find((r) => r.p1 === entry.p1 && r.p2 === entry.p2);
    if (prev) entry.starred = prev.starred;

    const updated = [entry, ...filtered].slice(0, 20);
    saveRecent(updated);
    setRecent(updated);

    const params = new URLSearchParams({ p1: player1.name, r1: player1.region, p2: player2.name, r2: player2.region });
    router.push(`/compare?${params.toString()}`);
  };

  const toggleStar = useCallback((index: number) => {
    setRecent((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], starred: !updated[index].starred };
      saveRecent(updated);
      return updated;
    });
  }, []);

  const rerunComparison = (item: RecentComparison) => {
    const params = new URLSearchParams({ p1: item.p1, r1: item.r1, p2: item.p2, r2: item.r2 });
    router.push(`/compare?${params.toString()}`);
  };

  // starred ones bubble to the top, everything else sorts by most recent
  const sorted = [...recent].sort((a, b) => {
    if (a.starred !== b.starred) return a.starred ? -1 : 1;
    return b.timestamp - a.timestamp;
  });

  return (
    <main className="min-h-screen relative overflow-x-hidden">
      {/* big faded "RIFT" text sitting behind everything */}
      <div className="section-watermark select-none" aria-hidden="true">RIFT</div>

      <section
        className="relative min-h-screen flex flex-col justify-center px-6 pt-20 pb-16"
        style={{ maxWidth: "100vw" }}
      >
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6"
        >
          <span className="section-label">Season 2025 · Patch 15.x</span>
        </motion.div>

        {/* hero heading — clamp keeps it readable on any screen size */}
        <div className="relative">
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="heading-relic shimmer-text hero-heading"
            style={{
              fontSize: "clamp(2.8rem, 10vw, 9rem)",
              lineHeight: 0.95,
              marginLeft: "-0.02em",
            }}
          >
            Summoner
          </motion.h1>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.22 }}
            className="heading-relic hero-heading"
            style={{
              fontSize: "clamp(2.8rem, 10vw, 9rem)",
              lineHeight: 0.95,
              color: "transparent",
              WebkitTextStroke: "1px rgba(200,155,60,0.55)",
              marginLeft: "clamp(0.5rem, 6vw, 6rem)",
            }}
          >
            Versus
          </motion.h1>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          style={{
            fontFamily: '"Crimson Pro", Georgia, serif',
            fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
            color: "rgba(240,230,211,0.6)",
            fontStyle: "italic",
            maxWidth: "480px",
            marginTop: "1.5rem",
          }}
        >
          Live head-to-head analytics. Champion pools, KDA trends, and performance radar — powered by the Riot API.
        </motion.p>

        {/* animated gold line under the subtitle */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: "clamp(150px, 40vw, 500px)",
            height: "1px",
            background: "linear-gradient(90deg, rgba(200,155,60,0.6), transparent)",
            marginTop: "1.5rem",
            transformOrigin: "left center",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 w-full"
          style={{ maxWidth: "860px" }}
        >
          <div className="relic-card" style={{ borderRadius: "2px", padding: "clamp(1.25rem, 4vw, 2.5rem)" }}>
            {/* little gold accent line at the top of the card */}
            <div style={{
              position: "absolute", top: 0, left: "10%", right: "10%", height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(200,155,60,0.4), transparent)",
            }} />

            <p className="section-label" style={{ marginBottom: "1.5rem" }}>Enter Summoner Names</p>

            {/* stacks to 1 col on mobile via md:grid-cols-2 */}
            <div className="grid gap-6 md:grid-cols-2">
              <PlayerSearch label="Player One" value={player1} onChange={setPlayer1} />
              <PlayerSearch label="Player Two" value={player2} onChange={setPlayer2} />
            </div>

            <div style={{ marginTop: "2rem" }}>
              <button
                type="button"
                onClick={onCompare}
                disabled={!player1.name || !player2.name || comparing}
                className="btn-relic"
                style={{ width: "100%", opacity: (!player1.name || !player2.name) ? 0.5 : 1 }}
              >
                <span className="pulse-ring" />
                {comparing ? "Loading..." : "Compare Players"}
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {sorted.length > 0 && (
        <section className="relative px-6 pb-24" style={{ maxWidth: "860px" }}>
          <div style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(200,155,60,0.3), transparent)",
            marginBottom: "2.5rem",
            transform: "rotate(-0.3deg)",
          }} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <p className="section-label" style={{ marginBottom: "1.25rem" }}>Recent Battles</p>

            <div className="grid gap-3 md:grid-cols-2">
              {sorted.map((item, i) => {
                const originalIndex = recent.indexOf(item);
                return (
                  <motion.div
                    key={`${item.p1}-${item.p2}-${item.r1}-${item.r2}`}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.55 + i * 0.06 }}
                    className="relic-card recent-card-offset"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 20px",
                      borderRadius: "2px",
                      // only offset on desktop — the CSS class zeroes it on mobile
                      marginLeft: i % 2 === 0 ? 0 : "clamp(0px, 2vw, 24px)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => rerunComparison(item)}
                      style={{
                        flex: 1,
                        textAlign: "left",
                        fontFamily: '"Crimson Pro", serif',
                        fontSize: "1.05rem",
                        color: "rgba(240,230,211,0.85)",
                        background: "none",
                        border: "none",
                        padding: "4px 0",
                        transition: "color 0.2s",
                        minHeight: "44px", // 44px is the recommended min touch target size
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#C89B3C")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,230,211,0.85)")}
                    >
                      <span style={{ color: "rgba(200,155,60,0.7)", fontSize: "0.65rem", letterSpacing: "0.15em", fontFamily: '"Cinzel Decorative", serif', display: "block", marginBottom: "3px" }}>
                        {item.r1.toUpperCase()} · {item.r2.toUpperCase()}
                      </span>
                      {item.p1} <span style={{ color: "rgba(200,155,60,0.5)", margin: "0 6px" }}>vs</span> {item.p2}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleStar(originalIndex)}
                      title={item.starred ? "Unstar" : "Star"}
                      style={{
                        marginLeft: "12px",
                        fontSize: "1.2rem",
                        color: item.starred ? "#C89B3C" : "rgba(200,155,60,0.3)",
                        background: "none",
                        border: "none",
                        padding: "8px",        // bigger tap zone
                        minWidth: "44px",      // same 44px rule for touch
                        transition: "color 0.2s, transform 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    >
                      {item.starred ? "★" : "☆"}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>
      )}
    </main>
  );
}
