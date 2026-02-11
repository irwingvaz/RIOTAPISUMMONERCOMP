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

// default fetcher that throws on non-2xx so SWR picks up errors properly
const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  });

// animated loading state while we wait for the API (can take ~8s with free key)
function LoadingSpinner() {
  return (
    <div className="glass rounded-3xl p-16 flex flex-col items-center justify-center gap-6">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-night-700" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-gold-400" />
      </div>
      <div className="text-center">
        <p className="text-lg text-glacier-50">Analyzing match data...</p>
        <p className="mt-2 text-sm text-glacier-200">Fetching stats from the Riot API. This may take a few seconds.</p>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="h-2 w-2 rounded-full bg-glacier-400"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}

// Suspense boundary needed because useSearchParams requires it in Next.js 14
export default function ComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen px-6 py-12 text-center text-glacier-200">Loading...</div>}>
      <CompareContent />
    </Suspense>
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

  const { data, error, isLoading } = useSWR<PlayerComparison>(p1 && p2 ? query : null, fetcher);

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-glacier-200">Performance Comparison</p>
            <h1 className="mt-3 font-display text-4xl text-glacier-50 md:text-5xl">{p1} vs {p2}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="button-secondary rounded-full px-5 py-2 text-sm uppercase tracking-[0.25em] transition-all hover:brightness-125"
            >
              Home
            </Link>
            <div className="badge-rank rounded-full px-5 py-2 text-sm uppercase tracking-[0.25em] text-gold-400">
              Live Matchup Dashboard
            </div>
          </div>
        </motion.div>

        {isLoading && <LoadingSpinner />}
        {error && (
          <div className="glass rounded-3xl p-10 text-center text-ember-400">
            Failed to load comparison.
          </div>
        )}

        {data?.message && (
          <div className="glass rounded-3xl p-10 text-center text-gold-400">
            {data.message}
          </div>
        )}

        {data?.player1 && data?.player2 && (
          <>
            {/* player cards + VS divider */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="grid gap-6 lg:grid-cols-3"
            >
              <ComparisonCard title={data.player1.summoner.name} data={data.player1} />
              <div className="glass rounded-3xl p-6 text-center">
                <p className="text-xs uppercase tracking-[0.35em] text-glacier-200">Versus</p>
                <div className="mt-6 text-5xl font-display text-gold-400">VS</div>
                <p className="mt-6 text-sm text-glacier-200">Head-to-head analytics</p>
              </div>
              <ComparisonCard title={data.player2.summoner.name} data={data.player2} />
            </motion.div>

            {/* charts row — KDA bar chart + performance radar */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mt-10 grid gap-6 lg:grid-cols-2"
            >
              <div className="glass rounded-3xl p-6">
                <h2 className="text-sm uppercase tracking-[0.3em] text-glacier-200">KDA Comparison</h2>
                <KDAChart
                  left={data.player1.recentPerformance}
                  right={data.player2.recentPerformance}
                  leftLabel={data.player1.summoner.name}
                  rightLabel={data.player2.summoner.name}
                />
              </div>
              <div className="glass rounded-3xl p-6">
                <h2 className="text-sm uppercase tracking-[0.3em] text-glacier-200">Performance Radar</h2>
                <RadarStatChart
                  left={data.player1.recentPerformance}
                  right={data.player2.recentPerformance}
                  leftLabel={data.player1.summoner.name}
                  rightLabel={data.player2.summoner.name}
                />
              </div>
            </motion.div>

            {/* champion pools side by side */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mt-10 grid gap-6 lg:grid-cols-2"
            >
              <ChampionPool title="Champion Pool" champions={data.player1.championPool} />
              <ChampionPool title="Champion Pool" champions={data.player2.championPool} />
            </motion.div>

            {/* quick stat cards — gold, damage, cs */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24 }}
              className="mt-10 grid gap-6 md:grid-cols-3"
            >
              <div className="glass rounded-3xl p-6">
                <p className="text-xs uppercase tracking-[0.35em] text-glacier-200">Avg Gold</p>
                <p className="mt-4 text-xl text-glacier-50">{data.player1.recentPerformance.avgGold.toFixed(1)}k <span className="text-sm text-glacier-200">{data.player1.summoner.name}</span></p>
                <p className="mt-1 text-xl text-glacier-50">{data.player2.recentPerformance.avgGold.toFixed(1)}k <span className="text-sm text-glacier-200">{data.player2.summoner.name}</span></p>
              </div>
              <div className="glass rounded-3xl p-6">
                <p className="text-xs uppercase tracking-[0.35em] text-glacier-200">Avg Damage</p>
                <p className="mt-4 text-xl text-glacier-50">{data.player1.recentPerformance.avgDamage.toFixed(1)}k <span className="text-sm text-glacier-200">{data.player1.summoner.name}</span></p>
                <p className="mt-1 text-xl text-glacier-50">{data.player2.recentPerformance.avgDamage.toFixed(1)}k <span className="text-sm text-glacier-200">{data.player2.summoner.name}</span></p>
              </div>
              <div className="glass rounded-3xl p-6">
                <p className="text-xs uppercase tracking-[0.35em] text-glacier-200">Avg CS</p>
                <p className="mt-4 text-xl text-glacier-50">{data.player1.recentPerformance.avgCS.toFixed(0)} <span className="text-sm text-glacier-200">{data.player1.summoner.name}</span></p>
                <p className="mt-1 text-xl text-glacier-50">{data.player2.recentPerformance.avgCS.toFixed(0)} <span className="text-sm text-glacier-200">{data.player2.summoner.name}</span></p>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </main>
  );
}
