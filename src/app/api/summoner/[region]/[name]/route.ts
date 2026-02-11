import { NextResponse } from "next/server";
import { getAccountByRiotId, getSummonerByPuuid, getRankedStats, parseRiotId } from "@/lib/riotApi";
import { summonerInputSchema, formatZodError, classifyApiError } from "@/lib/validation";

// single-player lookup — used for quick profile previews
export async function GET(
  request: Request,
  { params }: { params: { region: string; name: string } }
) {
  if (!process.env.RIOT_API_KEY) {
    return NextResponse.json({ message: "RIOT_API_KEY not configured." }, { status: 501 });
  }

  const parsed = summonerInputSchema.safeParse({
    name: decodeURIComponent(params.name),
    region: params.region
  });

  if (!parsed.success) {
    return NextResponse.json({ message: formatZodError(parsed.error) }, { status: 400 });
  }

  const { gameName, tagLine } = parseRiotId(parsed.data.name);

  try {
    const account = await getAccountByRiotId(parsed.data.region, gameName, tagLine);
    const summoner = await getSummonerByPuuid(parsed.data.region, account.puuid);
    const ranked = await getRankedStats(parsed.data.region, account.puuid);
    return NextResponse.json({ account, summoner, ranked });
  } catch (error: unknown) {
    const { message, status } = classifyApiError(error);
    return NextResponse.json({ message }, { status });
  }
}
