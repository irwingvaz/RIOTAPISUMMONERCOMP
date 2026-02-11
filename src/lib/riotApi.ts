import axios from "axios";
import { LRUCache } from "lru-cache";
import { getRoutingForRegion, getPlatformForRegion } from "@/utils/constants";
import type { Match, RankedEntry, RiotAccount, SummonerProfile } from "@/lib/types";

// fresh axios instance each call so we always grab the latest env key
function getRiotApi() {
  return axios.create({
    headers: {
      "X-Riot-Token": process.env.RIOT_API_KEY ?? ""
    }
  });
}

// match data never changes once the game ends, so a longer TTL is fine
const matchCache = new LRUCache<string, Match>({ max: 500, ttl: 1000 * 60 * 60 });

// player info updates more often — 5 min TTL keeps things fresh enough
const accountCache = new LRUCache<string, RiotAccount>({ max: 200, ttl: 1000 * 60 * 5 });
const summonerCache = new LRUCache<string, SummonerProfile>({ max: 200, ttl: 1000 * 60 * 5 });
// wrapping in { value } because LRUCache doesn't like storing raw null
const rankedCache = new LRUCache<string, { value: RankedEntry | null }>({ max: 200, ttl: 1000 * 60 * 5 });

// splits "Name#Tag" into its two parts — uses lastIndexOf in case the name itself has a #
export function parseRiotId(input: string): { gameName: string; tagLine: string } {
  const hashIndex = input.lastIndexOf("#");
  if (hashIndex === -1) {
    return { gameName: input.trim(), tagLine: "" };
  }
  return {
    gameName: input.slice(0, hashIndex).trim(),
    tagLine: input.slice(hashIndex + 1).trim()
  };
}

// resolves a Riot ID to the account's puuid via the Account V1 API
export async function getAccountByRiotId(region: string, gameName: string, tagLine: string): Promise<RiotAccount> {
  const key = `${region}:${gameName.toLowerCase()}#${tagLine.toLowerCase()}`;
  const cached = accountCache.get(key);
  if (cached) return cached;

  const routing = getRoutingForRegion(region);
  const url = `https://${routing}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  const { data } = await getRiotApi().get<RiotAccount>(url);
  accountCache.set(key, data);
  return data;
}

// grabs summoner profile (icon, level) — the old by-name endpoint is deprecated
export async function getSummonerByPuuid(region: string, puuid: string): Promise<SummonerProfile> {
  const key = `${region}:${puuid}`;
  const cached = summonerCache.get(key);
  if (cached) return cached;

  const platform = getPlatformForRegion(region);
  const url = `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
  const { data } = await getRiotApi().get<SummonerProfile>(url);
  summonerCache.set(key, data);
  return data;
}

// pulls solo queue ranked stats — returns null if the player has no ranked data
export async function getRankedStats(region: string, puuid: string): Promise<RankedEntry | null> {
  const key = `${region}:${puuid}`;
  const cached = rankedCache.get(key);
  if (cached !== undefined) return cached.value;

  const platform = getPlatformForRegion(region);
  const url = `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`;
  const { data } = await getRiotApi().get<RankedEntry[]>(url);
  const solo = data.find((entry) => entry.queueType === "RANKED_SOLO_5x5") ?? null;
  rankedCache.set(key, { value: solo });
  return solo;
}

// fetches recent ranked match IDs for a player
export async function getMatchHistory(region: string, puuid: string, count: number): Promise<string[]> {
  const routing = getRoutingForRegion(region);
  const url = `https://${routing}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?type=ranked&count=${count}`;
  const { data } = await getRiotApi().get<string[]>(url);
  return data;
}

// fetches full match details — heavily cached since completed games don't change
export async function getMatchDetails(region: string, matchId: string): Promise<Match> {
  const cached = matchCache.get(matchId);
  if (cached) return cached;

  const routing = getRoutingForRegion(region);
  const url = `https://${routing}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
  const { data } = await getRiotApi().get<Match>(url);
  matchCache.set(matchId, data);
  return data;
}
