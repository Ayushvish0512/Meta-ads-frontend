"use client";

import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { TrendPoint } from "@/types";

interface TimeTrendsChartProps {
  trends: TrendPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    color: string;
    dataKey: string;
    payload: Record<string, unknown>;
    value: number;
    name?: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-zinc-800 border border-zinc-700 rounded shadow-xl">
        <p className="text-xs text-zinc-400">{label}</p>
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex justify-between gap-4 mt-1">
            <span className="text-xs" style={{ color: entry.color }}>
              {entry.name}:
            </span>
            <span className="font-medium text-white">
              {formatCurrency(entry.value as number)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function TimeTrendsChart({ trends }: TimeTrendsChartProps) {
  const data = trends.map((t) => ({
    date: t.date,
    spend: Number((t.spend || 0).toFixed(2)),
    clicks: t.clicks || 0,
  }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        No trend data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={data}
        margin={{ top: 10, right: 20, left: 40, bottom: 30 }}
      >
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 9, fill: "var(--tw-color-zinc-600)" }}
          angle={-45}
          textAnchor="end"
          height={40}
        />
        <YAxis
          yAxisId="left"
          orientation="left"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 9, fill: "var(--tw-color-zinc-600)" }}
          width={60}
          tickFormatter={(value) => `$${(value as number) / 1000}k`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fillOpacity: 0.05 }} />
        <Bar yAxisId="left" dataKey="spend" fill="#3b82f6" barSize={12} radius={[2, 2, 0, 0]} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
