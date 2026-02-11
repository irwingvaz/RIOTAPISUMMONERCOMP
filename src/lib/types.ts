// data from the Riot Account V1 API — this replaced the old summoner-by-name flow
export interface RiotAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
}

// summoner profile from Summoner V4 — note: "name" and "id" fields were removed
// by Riot in the migration to Riot ID, so we only get icon/level now
export interface SummonerProfile {
  puuid: string;
  profileIconId: number;
  summonerLevel: number;
}

export interface RankedEntry {
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  queueType: string;
}

export interface MatchParticipant {
  puuid: string;
  kills: number;
  deaths: number;
  assists: number;
  win: boolean;
  champLevel: number;
  championName: string;
  goldEarned: number;
  totalDamageDealtToChampions: number;
  totalMinionsKilled: number;
  visionScore: number;
  firstBloodKill: boolean;
  teamId: number;
  objectives: {
    baron: number;
    dragon: number;
    tower: number;
  };
  multikills?: {
    doubleKills?: number;
    tripleKills?: number;
    quadraKills?: number;
    pentaKills?: number;
  };
  teamPosition: "TOP" | "JUNGLE" | "MIDDLE" | "BOTTOM" | "UTILITY" | string;
}

export interface MatchInfo {
  participants: MatchParticipant[];
  gameDuration: number;
  teams: { teamId: number; objectives: { baron: { kills: number }; dragon: { kills: number }; tower: { kills: number } } }[];
}

export interface Match {
  metadata: { matchId: string };
  info: MatchInfo;
}

// the full stat profile we build for each player in a comparison
export interface PlayerStats {
  summoner: {
    name: string;
    level: number;
    profileIconId: number;
    rank: string;
    lp: number;
    wins: number;
    losses: number;
    winRate: number;
  };
  recentPerformance: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    avgKills: number;
    avgDeaths: number;
    avgAssists: number;
    kda: number;
    avgGold: number;
    avgCS: number;
    avgDamage: number;
    avgVisionScore: number;
    killParticipation: number;
    objectiveParticipation: number;
    firstBloodRate: number;
    multikills: {
      double: number;
      triple: number;
      quadra: number;
      penta: number;
    };
  };
  championPool: {
    championId: number;
    championName: string;
    games: number;
    wins: number;
    winRate: number;
    avgKDA: number;
  }[];
  roleDistribution: Record<string, number>;
}

export interface PlayerComparison {
  player1: PlayerStats;
  player2: PlayerStats;
  message?: string;
}
