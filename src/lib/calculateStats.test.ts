import { describe, it, expect } from "vitest";
import { buildComparison } from "./calculateStats";
import type { Match, RankedEntry, SummonerProfile, MatchParticipant } from "./types";

// ── Test Helpers ──

const PUUID = "test-puuid-1234";

function makeSummoner(overrides?: Partial<SummonerProfile>): SummonerProfile {
  return {
    puuid: PUUID,
    profileIconId: 1,
    summonerLevel: 100,
    ...overrides
  };
}

function makeRanked(overrides?: Partial<RankedEntry>): RankedEntry {
  return {
    tier: "GOLD",
    rank: "II",
    leaguePoints: 75,
    wins: 60,
    losses: 40,
    queueType: "RANKED_SOLO_5x5",
    ...overrides
  };
}

function makeParticipant(overrides?: Partial<MatchParticipant>): MatchParticipant {
  return {
    puuid: PUUID,
    kills: 5,
    deaths: 3,
    assists: 7,
    win: true,
    champLevel: 16,
    championName: "Ahri",
    goldEarned: 12000,
    totalDamageDealtToChampions: 20000,
    totalMinionsKilled: 180,
    visionScore: 25,
    firstBloodKill: false,
    teamId: 100,
    objectives: { baron: 0, dragon: 0, tower: 0 },
    teamPosition: "MIDDLE",
    ...overrides
  };
}

function makeMatch(participants: MatchParticipant[], teamObjectives?: Match["info"]["teams"]): Match {
  return {
    metadata: { matchId: `MATCH_${Math.random().toString(36).slice(2)}` },
    info: {
      participants,
      gameDuration: 1800,
      teams: teamObjectives ?? [
        { teamId: 100, objectives: { baron: { kills: 1 }, dragon: { kills: 2 }, tower: { kills: 3 } } },
        { teamId: 200, objectives: { baron: { kills: 0 }, dragon: { kills: 1 }, tower: { kills: 2 } } }
      ]
    }
  };
}

// ── Tests ──

describe("buildComparison", () => {
  describe("empty matches", () => {
    it("returns empty performance with ranked data", () => {
      const result = buildComparison(makeSummoner(), makeRanked(), [], PUUID, "Player#TAG");

      expect(result.summoner.name).toBe("Player#TAG");
      expect(result.summoner.rank).toBe("GOLD II");
      expect(result.summoner.lp).toBe(75);
      expect(result.summoner.winRate).toBe(60);
      expect(result.recentPerformance.gamesPlayed).toBe(0);
      expect(result.recentPerformance.kda).toBe(0);
      expect(result.championPool).toEqual([]);
      expect(result.roleDistribution).toEqual({ TOP: 0, JUNGLE: 0, MIDDLE: 0, BOTTOM: 0, SUPPORT: 0 });
    });

    it("returns Unranked when ranked is null", () => {
      const result = buildComparison(makeSummoner(), null, [], PUUID, "Noob#NA1");

      expect(result.summoner.rank).toBe("Unranked");
      expect(result.summoner.lp).toBe(0);
      expect(result.summoner.wins).toBe(0);
      expect(result.summoner.losses).toBe(0);
      expect(result.summoner.winRate).toBe(0);
    });
  });

  describe("single match", () => {
    it("calculates averages from one game", () => {
      const participant = makeParticipant({ kills: 10, deaths: 2, assists: 8, goldEarned: 15000, totalMinionsKilled: 200, visionScore: 30 });
      const teammate = makeParticipant({ puuid: "ally-1", kills: 5, deaths: 4, assists: 3, teamId: 100 });
      const match = makeMatch([participant, teammate]);

      const result = buildComparison(makeSummoner(), makeRanked(), [match], PUUID, "Test#1");

      expect(result.recentPerformance.gamesPlayed).toBe(1);
      expect(result.recentPerformance.avgKills).toBe(10);
      expect(result.recentPerformance.avgDeaths).toBe(2);
      expect(result.recentPerformance.avgAssists).toBe(8);
      expect(result.recentPerformance.kda).toBe(9); // (10+8)/2
      expect(result.recentPerformance.avgGold).toBe(15); // 15000/1000
      expect(result.recentPerformance.avgCS).toBe(200);
      expect(result.recentPerformance.avgVisionScore).toBe(30);
    });

    it("handles zero deaths without dividing by zero", () => {
      const participant = makeParticipant({ kills: 8, deaths: 0, assists: 4 });
      const match = makeMatch([participant]);

      const result = buildComparison(makeSummoner(), makeRanked(), [match], PUUID, "Test#2");

      // KDA with 0 deaths: (8+4)/max(0,1) = 12
      expect(result.recentPerformance.kda).toBe(12);
    });
  });

  describe("multiple matches", () => {
    it("averages stats across games", () => {
      const match1 = makeMatch([makeParticipant({ kills: 10, deaths: 2, assists: 5, win: true, championName: "Ahri" })]);
      const match2 = makeMatch([makeParticipant({ kills: 4, deaths: 6, assists: 3, win: false, championName: "Zed" })]);

      const result = buildComparison(makeSummoner(), makeRanked(), [match1, match2], PUUID, "Multi#Test");

      expect(result.recentPerformance.gamesPlayed).toBe(2);
      expect(result.recentPerformance.avgKills).toBe(7); // (10+4)/2
      expect(result.recentPerformance.avgDeaths).toBe(4); // (2+6)/2
      expect(result.recentPerformance.wins).toBe(1);
      expect(result.recentPerformance.losses).toBe(1);
    });
  });

  describe("champion pool", () => {
    it("aggregates champion stats and sorts by games played", () => {
      const matches = [
        makeMatch([makeParticipant({ championName: "Ahri", kills: 8, deaths: 2, assists: 6, win: true })]),
        makeMatch([makeParticipant({ championName: "Ahri", kills: 4, deaths: 3, assists: 5, win: false })]),
        makeMatch([makeParticipant({ championName: "Zed", kills: 12, deaths: 1, assists: 2, win: true })])
      ];

      const result = buildComparison(makeSummoner(), makeRanked(), matches, PUUID, "Pool#Test");

      expect(result.championPool.length).toBe(2);
      // Ahri should be first (2 games vs 1)
      expect(result.championPool[0].championName).toBe("Ahri");
      expect(result.championPool[0].games).toBe(2);
      expect(result.championPool[0].wins).toBe(1);
      expect(result.championPool[0].winRate).toBe(50);
      // Zed second
      expect(result.championPool[1].championName).toBe("Zed");
      expect(result.championPool[1].games).toBe(1);
      expect(result.championPool[1].winRate).toBe(100);
    });

    it("caps at 5 champions", () => {
      const champs = ["Ahri", "Zed", "Lux", "Yasuo", "Lee Sin", "Jinx", "Thresh"];
      const matches = champs.map((name) => makeMatch([makeParticipant({ championName: name })]));

      const result = buildComparison(makeSummoner(), makeRanked(), matches, PUUID, "Cap#Test");

      expect(result.championPool.length).toBe(5);
    });
  });

  describe("role distribution", () => {
    it("maps UTILITY to SUPPORT", () => {
      const matches = [
        makeMatch([makeParticipant({ teamPosition: "UTILITY" })]),
        makeMatch([makeParticipant({ teamPosition: "UTILITY" })]),
        makeMatch([makeParticipant({ teamPosition: "MIDDLE" })])
      ];

      const result = buildComparison(makeSummoner(), makeRanked(), matches, PUUID, "Role#Test");

      expect(result.roleDistribution.SUPPORT).toBe(2);
      expect(result.roleDistribution.MIDDLE).toBe(1);
      expect(result.roleDistribution.TOP).toBe(0);
    });
  });

  describe("multikills", () => {
    it("sums multikills across matches", () => {
      const matches = [
        makeMatch([makeParticipant({ multikills: { doubleKills: 2, tripleKills: 1, quadraKills: 0, pentaKills: 0 } })]),
        makeMatch([makeParticipant({ multikills: { doubleKills: 1, tripleKills: 0, quadraKills: 1, pentaKills: 0 } })])
      ];

      const result = buildComparison(makeSummoner(), makeRanked(), matches, PUUID, "Multi#Kill");

      expect(result.recentPerformance.multikills.double).toBe(3);
      expect(result.recentPerformance.multikills.triple).toBe(1);
      expect(result.recentPerformance.multikills.quadra).toBe(1);
      expect(result.recentPerformance.multikills.penta).toBe(0);
    });

    it("handles missing multikills gracefully", () => {
      const matches = [makeMatch([makeParticipant({ multikills: undefined })])];

      const result = buildComparison(makeSummoner(), makeRanked(), matches, PUUID, "No#Multi");

      expect(result.recentPerformance.multikills.double).toBe(0);
    });
  });

  describe("first blood rate", () => {
    it("calculates first blood percentage", () => {
      const matches = [
        makeMatch([makeParticipant({ firstBloodKill: true })]),
        makeMatch([makeParticipant({ firstBloodKill: false })]),
        makeMatch([makeParticipant({ firstBloodKill: true })]),
        makeMatch([makeParticipant({ firstBloodKill: false })])
      ];

      const result = buildComparison(makeSummoner(), makeRanked(), matches, PUUID, "FB#Test");

      expect(result.recentPerformance.firstBloodRate).toBe(0.5);
    });
  });

  describe("win rate calculation", () => {
    it("computes ranked win rate from ranked data, not match data", () => {
      // Ranked says 60W 40L, but the matches we pass are all wins
      const ranked = makeRanked({ wins: 60, losses: 40 });
      const matches = [makeMatch([makeParticipant({ win: true })])];

      const result = buildComparison(makeSummoner(), ranked, matches, PUUID, "WR#Test");

      // Summoner card win rate from ranked (60%)
      expect(result.summoner.winRate).toBe(60);
      expect(result.summoner.wins).toBe(60);
      expect(result.summoner.losses).toBe(40);
      // Recent performance from actual matches
      expect(result.recentPerformance.wins).toBe(1);
      expect(result.recentPerformance.losses).toBe(0);
    });
  });

  describe("puuid filtering", () => {
    it("ignores matches where puuid is not found", () => {
      const ownMatch = makeMatch([makeParticipant({ puuid: PUUID, kills: 10 })]);
      const otherMatch = makeMatch([makeParticipant({ puuid: "someone-else", kills: 99 })]);

      const result = buildComparison(makeSummoner(), makeRanked(), [ownMatch, otherMatch], PUUID, "Filter#Test");

      expect(result.recentPerformance.gamesPlayed).toBe(1);
      expect(result.recentPerformance.avgKills).toBe(10);
    });
  });
});
