"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import PlayerSearch from "@/components/PlayerSearch";

interface RecentComparison {
  p1: string;
  r1: string;
  p2: string;
  r2: string;
  starred: boolean;
  timestamp: number;
}

const STORAGE_KEY = "lol-versus-recent";

// load saved comparisons from localStorage (safe for SSR — returns [] if unavailable)
function loadRecent(): RecentComparison[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecent(items: RecentComparison[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export default function HomePage() {
  const router = useRouter();
  const [player1, setPlayer1] = useState({ region: "na1", name: "" });
  const [player2, setPlayer2] = useState({ region: "na1", name: "" });
  const [recent, setRecent] = useState<RecentComparison[]>([]);

  // hydrate recent list after mount (can't access localStorage during SSR)
  useEffect(() => {
    setRecent(loadRecent());
  }, []);

  const onCompare = () => {
    if (!player1.name || !player2.name) return;

    const entry: RecentComparison = {
      p1: player1.name,
      r1: player1.region,
      p2: player2.name,
      r2: player2.region,
      starred: false,
      timestamp: Date.now()
    };

    // deduplicate: if this exact matchup exists, remove the old one and keep star status
    const existing = loadRecent();
    const filtered = existing.filter(
      (r) => !(r.p1 === entry.p1 && r.p2 === entry.p2 && r.r1 === entry.r1 && r.r2 === entry.r2)
    );
    const starred = filtered.find(
      (r) => r.p1 === entry.p1 && r.p2 === entry.p2 && r.r1 === entry.r1 && r.r2 === entry.r2
    );
    if (starred) entry.starred = starred.starred;

    // keep latest 20 comparisons
    const updated = [entry, ...filtered].slice(0, 20);
    saveRecent(updated);
    setRecent(updated);

    const params = new URLSearchParams({
      p1: player1.name,
      r1: player1.region,
      p2: player2.name,
      r2: player2.region
    });
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
    const params = new URLSearchParams({
      p1: item.p1,
      r1: item.r1,
      p2: item.p2,
      r2: item.r2
    });
    router.push(`/compare?${params.toString()}`);
  };

  // starred items float to the top, then sort by most recent
  const sorted = [...recent].sort((a, b) => {
    if (a.starred !== b.starred) return a.starred ? -1 : 1;
    return b.timestamp - a.timestamp;
  });

  return (
    <main className="min-h-screen">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <p className="text-sm uppercase tracking-[0.4em] text-glacier-200">LoL Versus</p>
          <h1 className="mt-4 font-display text-5xl leading-tight text-glacier-50 md:text-6xl">
            Compare League Players Head-to-Head
          </h1>
          <p className="mt-4 text-lg text-glacier-200">
            A pro-grade comparison dashboard with performance analytics, champion pools, and matchup insights.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="card-ring w-full max-w-4xl rounded-3xl p-[1px]"
        >
          <div className="glass rounded-3xl p-6 shadow-glass md:p-8">
            <div className="grid gap-6 md:grid-cols-2">
              <PlayerSearch label="Player 1" value={player1} onChange={setPlayer1} />
              <PlayerSearch label="Player 2" value={player2} onChange={setPlayer2} />
            </div>
            <button
              type="button"
              onClick={onCompare}
              className="button-primary mt-8 w-full rounded-2xl px-6 py-4 text-base uppercase tracking-[0.25em]"
            >
              Compare Players
            </button>
          </div>
        </motion.div>

        {sorted.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 w-full max-w-4xl"
          >
            <p className="text-sm uppercase tracking-[0.3em] text-glacier-200">Recent Comparisons</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {sorted.map((item, i) => {
                const originalIndex = recent.indexOf(item);
                return (
                  <div
                    key={`${item.p1}-${item.p2}-${item.r1}-${item.r2}`}
                    className="glass flex items-center justify-between rounded-2xl px-5 py-4"
                  >
                    <button
                      type="button"
                      onClick={() => rerunComparison(item)}
                      className="flex-1 text-left text-glacier-50 hover:text-gold-400 transition-colors"
                    >
                      {item.p1} vs {item.p2}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleStar(originalIndex)}
                      className="ml-3 text-xl transition-transform hover:scale-110"
                      title={item.starred ? "Unstar" : "Star"}
                    >
                      {item.starred ? "\u2605" : "\u2606"}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </section>
    </main>
  );
}
