"use client";

import { REGION_OPTIONS } from "@/utils/constants";

interface PlayerSearchProps {
  label: string;
  value: { region: string; name: string };
  onChange: (value: { region: string; name: string }) => void;
}

export default function PlayerSearch({ label, value, onChange }: PlayerSearchProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <p
        style={{
          fontFamily: '"Cinzel Decorative", serif',
          fontSize: "0.6rem",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "rgba(200,155,60,0.7)",
          marginBottom: "4px",
        }}
      >
        {label}
      </p>

      <div style={{ position: "relative" }}>
        {/* left accent bar */}
        <div style={{
          position: "absolute",
          left: 0, top: "20%", bottom: "20%",
          width: "2px",
          background: "linear-gradient(180deg, transparent, #C89B3C, transparent)",
        }} />
        <input
          className="input-relic"
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="Name#Tag  e.g. Faker#KR1"
          style={{ paddingLeft: "20px" }}
        />
      </div>

      <select
        className="select-relic"
        value={value.region}
        onChange={(e) => onChange({ ...value, region: e.target.value })}
      >
        {REGION_OPTIONS.map((r) => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>
    </div>
  );
}
