import type { PlayerStats } from "@/lib/types";

interface ChampionPoolProps {
  title: string;
  champions: PlayerStats["championPool"];
}

export default function ChampionPool({ title, champions }: ChampionPoolProps) {
  return (
    <div className="glass rounded-3xl p-6">
      <h2 className="text-sm uppercase tracking-[0.3em] text-glacier-200">{title}</h2>
      <div className="mt-6 space-y-4">
        {champions.length === 0 && <p className="text-sm text-glacier-200">No champions yet.</p>}
        {champions.map((champion) => (
          <div key={champion.championName} className="flex items-center justify-between rounded-2xl bg-night-800 px-4 py-3">
            <div>
              <p className="text-lg text-glacier-50">{champion.championName}</p>
              <p className="text-xs uppercase tracking-[0.25em] text-glacier-200">{champion.games} games</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gold-400">{champion.winRate}% WR</p>
              <p className="text-xs text-glacier-200">{champion.avgKDA.toFixed(2)} KDA</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
