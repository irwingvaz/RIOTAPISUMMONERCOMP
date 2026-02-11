// all the regions Riot supports — value maps to their platform/shard code
export const REGION_OPTIONS = [
  { label: "NA", value: "na1" },
  { label: "EUW", value: "euw1" },
  { label: "EUNE", value: "eun1" },
  { label: "KR", value: "kr" },
  { label: "LAN", value: "la1" },
  { label: "LAS", value: "la2" },
  { label: "OCE", value: "oc1" },
  { label: "BR", value: "br1" },
  { label: "JP", value: "jp1" },
  { label: "TR", value: "tr1" },
  { label: "RU", value: "ru" },
  { label: "PH", value: "ph2" },
  { label: "SG", value: "sg2" },
  { label: "TH", value: "th2" },
  { label: "TW", value: "tw2" },
  { label: "VN", value: "vn2" }
];

// platform = the shard for summoner/league endpoints (e.g. na1.api.riotgames.com)
const platformMap: Record<string, string> = {
  na1: "na1",
  euw1: "euw1",
  eun1: "eun1",
  kr: "kr",
  la1: "la1",
  la2: "la2",
  oc1: "oc1",
  br1: "br1",
  jp1: "jp1",
  tr1: "tr1",
  ru: "ru",
  ph2: "ph2",
  sg2: "sg2",
  th2: "th2",
  tw2: "tw2",
  vn2: "vn2"
};

// routing = the regional cluster for account/match endpoints (americas, europe, asia, sea)
const routingMap: Record<string, string> = {
  na1: "americas",
  la1: "americas",
  la2: "americas",
  br1: "americas",
  euw1: "europe",
  eun1: "europe",
  tr1: "europe",
  ru: "europe",
  kr: "asia",
  jp1: "asia",
  oc1: "sea",
  ph2: "sea",
  sg2: "sea",
  th2: "sea",
  tw2: "sea",
  vn2: "sea"
};

export function getPlatformForRegion(region: string) {
  return platformMap[region] ?? "na1";
}

export function getRoutingForRegion(region: string) {
  return routingMap[region] ?? "americas";
}
