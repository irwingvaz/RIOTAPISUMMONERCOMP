import type { PlayerStats } from "@/lib/types";

interface ChampionPoolProps {
  title: string;
  champions: PlayerStats["championPool"];
}

export default function ChampionPool({ title, champions }: ChampionPoolProps) {
  return (
    <div
      className="relic-card"
      style={{ borderRadius: "2px", padding: "clamp(1.25rem, 3vw, 1.75rem)", position: "relative" }}
    >
      {/* top accent */}
      <div style={{
        position: "absolute", top: 0, left: "8%", right: "8%", height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(200,155,60,0.35), transparent)",
      }} />

      <p className="section-label" style={{ marginBottom: "1.25rem" }}>{title}</p>

      {champions.length === 0 && (
        <p style={{ fontFamily: '"Crimson Pro", serif', fontStyle: "italic", color: "rgba(240,230,211,0.4)", fontSize: "0.95rem" }}>
          No ranked games found.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column" }}>
        {champions.map((champ, i) => {
          const wr = parseFloat(String(champ.winRate));
          const wrColor = wr >= 55 ? "#5EE6B8" : wr >= 50 ? "#C89B3C" : "#FF8A7A";

          return (
            <div key={champ.championName} className="champion-row" style={{ animationDelay: `${i * 0.06}s` }}>
              {/* rank number */}
              <span style={{
                fontFamily: '"Cinzel Decorative", serif',
                fontSize: "0.55rem",
                color: "rgba(200,155,60,0.4)",
                letterSpacing: "0.1em",
                marginRight: "14px",
                minWidth: "18px",
              }}>
                {String(i + 1).padStart(2, "0")}
              </span>

              <div style={{ flex: 1 }}>
                <p style={{
                  fontFamily: '"Cinzel Decorative", serif',
                  fontSize: "0.75rem",
                  color: "#F0E6D3",
                  letterSpacing: "0.05em",
                  marginBottom: "3px",
                }}>
                  {champ.championName}
                </p>
                {/* mini WR bar */}
                <div style={{
                  height: "2px",
                  width: "100%",
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: "1px",
                  overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%",
                    width: `${Math.min(wr, 100)}%`,
                    background: `linear-gradient(90deg, ${wrColor}88, ${wrColor})`,
                    borderRadius: "1px",
                  }} />
                </div>
              </div>

              <div style={{ textAlign: "right", marginLeft: "16px", minWidth: "80px" }}>
                <p style={{ fontFamily: '"Cinzel Decorative", serif', fontSize: "0.75rem", color: wrColor }}>
                  {champ.winRate}%
                </p>
                <p style={{
                  fontFamily: '"Crimson Pro", serif',
                  fontSize: "0.7rem",
                  color: "rgba(240,230,211,0.45)",
                  letterSpacing: "0.1em",
                }}>
                  {champ.avgKDA.toFixed(2)} kda · {champ.games}g
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
