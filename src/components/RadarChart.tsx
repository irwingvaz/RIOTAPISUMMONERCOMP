"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from "recharts";

interface RadarChartProps {
  left: { killParticipation: number; objectiveParticipation: number; avgVisionScore: number };
  right: { killParticipation: number; objectiveParticipation: number; avgVisionScore: number };
  leftLabel: string;
  rightLabel: string;
}

export default function RadarStatChart({ left, right, leftLabel, rightLabel }: RadarChartProps) {
  const data = [
    {
      metric: "KP%",
      [leftLabel]: Math.round(left.killParticipation * 100),
      [rightLabel]: Math.round(right.killParticipation * 100)
    },
    {
      metric: "Obj%",
      [leftLabel]: Math.round(left.objectiveParticipation * 100),
      [rightLabel]: Math.round(right.objectiveParticipation * 100)
    },
    {
      metric: "Vision",
      [leftLabel]: Math.round(left.avgVisionScore),
      [rightLabel]: Math.round(right.avgVisionScore)
    }
  ];

  return (
    <div className="mt-6 h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="#18213A" />
          <PolarAngleAxis dataKey="metric" stroke="#A8C7FF" />
          <PolarRadiusAxis stroke="#A8C7FF" />
          <Tooltip
            contentStyle={{ background: "#11182A", border: "1px solid #2E56D6", color: "#EAF3FF" }}
          />
          <Radar name={leftLabel} dataKey={leftLabel} stroke="#5C8DFF" fill="#5C8DFF" fillOpacity={0.4} />
          <Radar name={rightLabel} dataKey={rightLabel} stroke="#E6C46A" fill="#E6C46A" fillOpacity={0.35} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
