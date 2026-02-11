"use client";

import { REGION_OPTIONS } from "@/utils/constants";

interface PlayerSearchProps {
  label: string;
  value: { region: string; name: string };
  onChange: (value: { region: string; name: string }) => void;
}

export default function PlayerSearch({ label, value, onChange }: PlayerSearchProps) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-xs uppercase tracking-[0.35em] text-glacier-200">{label}</p>
      <input
        value={value.name}
        onChange={(event) => onChange({ ...value, name: event.target.value })}
        placeholder="Name#Tag (e.g. Faker#KR1)"
        className="mt-4 w-full rounded-xl bg-night-800 px-4 py-3 text-glacier-50 outline-none ring-1 ring-transparent focus:ring-glacier-400"
      />
      <select
        value={value.region}
        onChange={(event) => onChange({ ...value, region: event.target.value })}
        className="mt-4 w-full rounded-xl bg-night-800 px-4 py-3 text-glacier-50 outline-none ring-1 ring-transparent focus:ring-glacier-400"
      >
        {REGION_OPTIONS.map((region) => (
          <option key={region.value} value={region.value}>
            {region.label}
          </option>
        ))}
      </select>
    </div>
  );
}
