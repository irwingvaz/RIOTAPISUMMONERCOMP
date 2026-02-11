"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface KDAChartProps {
  left: { kda: number };
  right: { kda: number };
  leftLabel: string;
  rightLabel: string;
}

export default function KDAChart({ left, right, leftLabel, rightLabel }: KDAChartProps) {
  const data = [
    { name: leftLabel, value: Number(left.kda.toFixed(2)) },
    { name: rightLabel, value: Number(right.kda.toFixed(2)) }
  ];

  return (
    <div className="mt-6 h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
          <CartesianGrid stroke="#18213A" strokeDasharray="3 3" />
          <XAxis type="number" stroke="#A8C7FF" />
          <YAxis type="category" dataKey="name" stroke="#A8C7FF" width={100} />
          <Tooltip
            contentStyle={{ background: "#11182A", border: "1px solid #2E56D6", color: "#EAF3FF" }}
          />
          <Bar dataKey="value" fill="#E6C46A" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
