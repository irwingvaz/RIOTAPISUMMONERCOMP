import type { PlayerStats } from "@/lib/types";

interface ComparisonCardProps {
  title: string;
  data: PlayerStats;
}

export default function ComparisonCard({ title, data }: ComparisonCardProps) {
  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-glacier-200">Summoner</p>
          <h2 className="mt-2 text-2xl text-glacier-50">{title}</h2>
        </div>
        <div className="badge-rank rounded-full px-4 py-2 text-xs uppercase tracking-[0.25em] text-gold-400">
          {data.summoner.rank}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-glacier-200">LP</p>
          <p className="mt-2 text-xl text-glacier-50">{data.summoner.lp}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-glacier-200">Win Rate</p>
          <p className="mt-2 text-xl text-glacier-50">{data.summoner.winRate}%</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-glacier-200">Wins</p>
          <p className="mt-2 text-xl text-glacier-50">{data.summoner.wins}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-glacier-200">Losses</p>
          <p className="mt-2 text-xl text-glacier-50">{data.summoner.losses}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-glacier-200">K/D/A</p>
          <p className="mt-2 text-lg text-glacier-50">
            {data.recentPerformance.avgKills.toFixed(1)}/{data.recentPerformance.avgDeaths.toFixed(1)}/{data.recentPerformance.avgAssists.toFixed(1)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-glacier-200">KDA</p>
          <p className="mt-2 text-lg text-glacier-50">{data.recentPerformance.kda.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-glacier-200">Vision</p>
          <p className="mt-2 text-lg text-glacier-50">{data.recentPerformance.avgVisionScore.toFixed(1)}</p>
        </div>
      </div>
    </div>
  );
}
