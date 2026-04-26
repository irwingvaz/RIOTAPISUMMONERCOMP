import axios from "axios";
import { LRUCache } from "lru-cache";
import { getRoutingForRegion, getPlatformForRegion } from "@/utils/constants";
import type { Match, RankedEntry, RiotAccount, SummonerProfile } from "@/lib/types";

function getRiotApi() {
  return axios.create({
    headers: { "X-Riot-Token": process.env.RIOT_API_KEY ?? "" },
  });
}

// completed matches don't change, so an hour TTL is totally fine
const matchCache   = new LRUCache<string, Match>({ max: 500, ttl: 1000 * 60 * 60 });

// player data can change — 5 min is a reasonable balance
const accountCache  = new LRUCache<string, RiotAccount>({ max: 200, ttl: 1000 * 60 * 5 });
const summonerCache = new LRUCache<string, SummonerProfile>({ max: 200, ttl: 1000 * 60 * 5 });
// stored as { value } because LRUCache can't store raw null
const rankedCache   = new LRUCache<string, { value: RankedEntry | null }>({ max: 200, ttl: 1000 * 60 * 5 });

// lastIndexOf handles edge case where the game name itself has a # in it
export function parseRiotId(input: string): { gameName: string; tagLine: string } {
  const idx = input.lastIndexOf("#");
  if (idx === -1) return { gameName: input.trim(), tagLine: "" };
  return {
    gameName: input.slice(0, idx).trim(),
    tagLine:  input.slice(idx + 1).trim(),
  };
}

export async function getAccountByRiotId(
  region: string,
  gameName: string,
  tagLine: string
): Promise<RiotAccount> {
  const key    = `${region}:${gameName.toLowerCase()}#${tagLine.toLowerCase()}`;
  const cached = accountCache.get(key);
  if (cached) return cached;

  const routing = getRoutingForRegion(region);
  const url = `https://${routing}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  const { data } = await getRiotApi().get<RiotAccount>(url);
  accountCache.set(key, data);
  return data;
}

// by-puuid is the current way — by-name was deprecated a while back
export async function getSummonerByPuuid(region: string, puuid: string): Promise<SummonerProfile> {
  const key    = `${region}:${puuid}`;
  const cached = summonerCache.get(key);
  if (cached) return cached;

  const platform = getPlatformForRegion(region);
  const url = `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
  const { data } = await getRiotApi().get<SummonerProfile>(url);
  summonerCache.set(key, data);
  return data;
}

// returns null when the player hasn't played ranked this split
export async function getRankedStats(region: string, puuid: string): Promise<RankedEntry | null> {
  const key    = `${region}:${puuid}`;
  const cached = rankedCache.get(key);
  if (cached !== undefined) return cached.value;

  const platform = getPlatformForRegion(region);
  const url = `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`;
  const { data } = await getRiotApi().get<RankedEntry[]>(url);
  const solo = data.find((e) => e.queueType === "RANKED_SOLO_5x5") ?? null;
  rankedCache.set(key, { value: solo });
  return solo;
}

export async function getMatchHistory(region: string, puuid: string, count: number): Promise<string[]> {
  const routing = getRoutingForRegion(region);
  const url = `https://${routing}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?type=ranked&count=${count}`;
  const { data } = await getRiotApi().get<string[]>(url);
  return data;
}

export async function getMatchDetails(region: string, matchId: string): Promise<Match> {
  const cached = matchCache.get(matchId);
  if (cached) return cached;

  const routing = getRoutingForRegion(region);
  const url = `https://${routing}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
  const { data } = await getRiotApi().get<Match>(url);
  matchCache.set(matchId, data);
  return data;
}
