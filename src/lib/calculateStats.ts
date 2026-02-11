import type { Match, PlayerStats, RankedEntry, SummonerProfile } from "@/lib/types";

// fallback stats when a player has zero recent matches
const emptyPerformance = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  avgKills: 0,
  avgDeaths: 0,
  avgAssists: 0,
  kda: 0,
  avgGold: 0,
  avgCS: 0,
  avgDamage: 0,
  avgVisionScore: 0,
  killParticipation: 0,
  objectiveParticipation: 0,
  firstBloodRate: 0,
  multikills: { double: 0, triple: 0, quadra: 0, penta: 0 }
};

/**
 * Crunches raw match data into a structured player stat profile.
 * displayName is passed separately since the Summoner V4 endpoint
 * no longer returns a name field — we get it from the Account API instead.
 */
export function buildComparison(
  summoner: SummonerProfile,
  ranked: RankedEntry | null,
  matches: Match[],
  puuid: string,
  displayName: string
): PlayerStats {
  // no recent games — just show ranked info and empty performance
  if (!matches.length) {
    return {
      summoner: {
        name: displayName,
        level: summoner.summonerLevel,
        profileIconId: summoner.profileIconId,
        rank: ranked ? `${ranked.tier} ${ranked.rank}` : "Unranked",
        lp: ranked?.leaguePoints ?? 0,
        wins: ranked?.wins ?? 0,
        losses: ranked?.losses ?? 0,
        winRate: ranked ? Math.round((ranked.wins / Math.max(ranked.wins + ranked.losses, 1)) * 100) : 0
      },
      recentPerformance: emptyPerformance,
      championPool: [],
      roleDistribution: { TOP: 0, JUNGLE: 0, MIDDLE: 0, BOTTOM: 0, SUPPORT: 0 }
    };
  }

  // find our player's participant data in each match
  const entries = matches
    .map((match) => ({
      match,
      participant: match.info.participants.find((p) => p.puuid === puuid)
    }))
    .filter((entry) => Boolean(entry.participant));

  const gamesPlayed = entries.length;

  // aggregate everything in a single pass over all matches
  const totals = entries.reduce(
    (acc, entry) => {
      const p = entry.participant!;
      acc.kills += p.kills;
      acc.deaths += p.deaths;
      acc.assists += p.assists;
      acc.gold += p.goldEarned;
      acc.cs += p.totalMinionsKilled;
      acc.damage += p.totalDamageDealtToChampions;
      acc.vision += p.visionScore;
      acc.firstBloods += p.firstBloodKill ? 1 : 0;
      acc.wins += p.win ? 1 : 0;
      acc.double += p.multikills?.doubleKills ?? 0;
      acc.triple += p.multikills?.tripleKills ?? 0;
      acc.quadra += p.multikills?.quadraKills ?? 0;
      acc.penta += p.multikills?.pentaKills ?? 0;

      // track which roles they play
      acc.role[p.teamPosition] = (acc.role[p.teamPosition] ?? 0) + 1;

      // build per-champion stats (games, wins, avg kda)
      acc.champions[p.championName] = acc.champions[p.championName] || { games: 0, wins: 0, kda: 0 };
      acc.champions[p.championName].games += 1;
      acc.champions[p.championName].wins += p.win ? 1 : 0;
      acc.champions[p.championName].kda += (p.kills + p.assists) / Math.max(p.deaths, 1);

      // kill participation = (kills + assists) / total team kills
      const teamKills = entry.match.info.participants
        .filter((part) => part.teamId === p.teamId)
        .reduce((sum, part) => sum + part.kills, 0);
      acc.killParticipation += teamKills ? (p.kills + p.assists) / teamKills : 0;

      // rough objective participation estimate
      const teamObjectives = entry.match.info.teams.find((team) => team.teamId === p.teamId);
      if (teamObjectives) {
        const totalObjectives =
          teamObjectives.objectives.baron.kills +
          teamObjectives.objectives.dragon.kills +
          teamObjectives.objectives.tower.kills;
        acc.objectiveParticipation += totalObjectives ? (p.kills + p.assists) / (totalObjectives * 5) : 0;
      }
      return acc;
    },
    {
      kills: 0,
      deaths: 0,
      assists: 0,
      gold: 0,
      cs: 0,
      damage: 0,
      vision: 0,
      firstBloods: 0,
      wins: 0,
      killParticipation: 0,
      objectiveParticipation: 0,
      double: 0,
      triple: 0,
      quadra: 0,
      penta: 0,
      role: {} as Record<string, number>,
      champions: {} as Record<string, { games: number; wins: number; kda: number }>
    }
  );

  // ranked win rate comes from the season totals, not the recent games
  const wins = ranked?.wins ?? 0;
  const losses = ranked?.losses ?? 0;
  const winRate = ranked ? Math.round((wins / Math.max(wins + losses, 1)) * 100) : 0;

  // top 5 most-played champions
  const championPool = Object.entries(totals.champions)
    .map(([championName, data], index) => ({
      championId: index,
      championName,
      games: data.games,
      wins: data.wins,
      winRate: data.games ? Math.round((data.wins / data.games) * 100) : 0,
      avgKDA: data.kda / Math.max(data.games, 1)
    }))
    .sort((a, b) => b.games - a.games)
    .slice(0, 5);

  return {
    summoner: {
      name: displayName,
      level: summoner.summonerLevel,
      profileIconId: summoner.profileIconId,
      rank: ranked ? `${ranked.tier} ${ranked.rank}` : "Unranked",
      lp: ranked?.leaguePoints ?? 0,
      wins,
      losses,
      winRate
    },
    recentPerformance: {
      gamesPlayed,
      wins: totals.wins,
      losses: gamesPlayed - totals.wins,
      avgKills: totals.kills / gamesPlayed,
      avgDeaths: totals.deaths / gamesPlayed,
      avgAssists: totals.assists / gamesPlayed,
      kda: (totals.kills + totals.assists) / Math.max(totals.deaths, 1),
      avgGold: totals.gold / gamesPlayed / 1000,
      avgCS: totals.cs / gamesPlayed,
      avgDamage: totals.damage / gamesPlayed / 1000,
      avgVisionScore: totals.vision / gamesPlayed,
      killParticipation: totals.killParticipation / gamesPlayed,
      objectiveParticipation: totals.objectiveParticipation / gamesPlayed,
      firstBloodRate: totals.firstBloods / gamesPlayed,
      multikills: {
        double: totals.double,
        triple: totals.triple,
        quadra: totals.quadra,
        penta: totals.penta
      }
    },
    championPool,
    roleDistribution: {
      TOP: totals.role.TOP ?? 0,
      JUNGLE: totals.role.JUNGLE ?? 0,
      MIDDLE: totals.role.MIDDLE ?? 0,
      BOTTOM: totals.role.BOTTOM ?? 0,
      SUPPORT: totals.role.UTILITY ?? 0 // Riot calls it UTILITY internally
    }
  };
}
