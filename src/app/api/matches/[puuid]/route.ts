import { NextResponse } from "next/server";
import { getMatchHistory, getMatchDetails } from "@/lib/riotApi";

export async function GET(
  request: Request,
  { params }: { params: { puuid: string } }
) {
  const apiKey = process.env.RIOT_API_KEY ?? "";
  if (!apiKey) {
    return NextResponse.json({ message: "RIOT_API_KEY not set." }, { status: 501 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get("region") ?? "na1";
    const matches = await getMatchHistory(region, params.puuid, 20);
    const details = await Promise.all(matches.map((matchId) => getMatchDetails(region, matchId)));
    return NextResponse.json({ matches: details });
  } catch (error: unknown) {
    return NextResponse.json({ message: "Failed to fetch matches" }, { status: 500 });
  }
}
