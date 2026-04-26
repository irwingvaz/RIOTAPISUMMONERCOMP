import { NextResponse } from "next/server";
import {
  getAccountByRiotId,
  getSummonerByPuuid,
  getRankedStats,
  getMatchHistory,
  getMatchDetails,
  parseRiotId
} from "@/lib/riotApi";
import { buildComparison } from "@/lib/calculateStats";
import { compareInputSchema, formatZodError, classifyApiError } from "@/lib/validation";
import type { Match } from "@/lib/types";

// free tier rate limits are tight (20 req/s, 100/2min) — batch + delay keeps us out of 429 jail
async function fetchMatchesBatched(
  region: string,
  matchIds: string[],
  batchSize: number,
  delayMs: number
): Promise<Match[]> {
  const results: Match[] = [];
  for (let i = 0; i < matchIds.length; i += batchSize) {
    const batch = matchIds.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((id) => getMatchDetails(region, id)));
    results.push(...batchResults);
    if (i + batchSize < matchIds.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return results;
}

export async function GET(request: Request) {
  if (!process.env.RIOT_API_KEY) {
    return NextResponse.json({ message: "RIOT_API_KEY not configured." }, { status: 501 });
  }

  const { searchParams } = new URL(request.url);

  // trim here too — belt and suspenders with the schema transform
  const input = {
    p1: (searchParams.get("p1") ?? "").trim(),
    r1: (searchParams.get("r1") ?? "").trim(),
    p2: (searchParams.get("p2") ?? "").trim(),
    r2: (searchParams.get("r2") ?? "").trim(),
  };

  const parsed = compareInputSchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json({ message: formatZodError(parsed.error) }, { status: 400 });
  }

  const { p1, p2, r1, r2 } = parsed.data;
  const id1 = parseRiotId(p1);
  const id2 = parseRiotId(p2);

  try {
    const [a1, a2] = await Promise.all([
      getAccountByRiotId(r1, id1.gameName, id1.tagLine),
      getAccountByRiotId(r2, id2.gameName, id2.tagLine),
    ]);

    const [s1, s2, ranked1, ranked2, m1, m2] = await Promise.all([
      getSummonerByPuuid(r1, a1.puuid),
      getSummonerByPuuid(r2, a2.puuid),
      getRankedStats(r1, a1.puuid),
      getRankedStats(r2, a2.puuid),
      getMatchHistory(r1, a1.puuid, 10),
      getMatchHistory(r2, a2.puuid, 10),
    ]);

    const [d1, d2] = await Promise.all([
      fetchMatchesBatched(r1, m1, 5, 1500),
      fetchMatchesBatched(r2, m2, 5, 1500),
    ]);

    const name1 = `${a1.gameName}#${a1.tagLine}`;
    const name2 = `${a2.gameName}#${a2.tagLine}`;
    const player1 = buildComparison(s1, ranked1, d1, a1.puuid, name1);
    const player2 = buildComparison(s2, ranked2, d2, a2.puuid, name2);

    return NextResponse.json({ player1, player2 });
  } catch (error: unknown) {
    const { message, status } = classifyApiError(error);
    return NextResponse.json({ message }, { status });
  }
}
