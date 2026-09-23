"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatCurrency, truncate } from "@/lib/utils";
import type { Campaign } from "@/types";

interface PerformanceChartProps {
  campaigns: Campaign[];
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

const CustomTooltip = ({
  active,
  payload,
  label,
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl">
        <p className="text-xs font-medium text-zinc-400">{label}</p>
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4 mt-1">
            <span
              className="text-xs"
              style={{ color: entry.color }}
            >
              {entry.name}:
            </span>
            <span className="font-medium text-white">
              {entry.dataKey === "spend"
                ? formatCurrency(entry.value)
                : Math.round(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function PerformanceChart({ campaigns }: PerformanceChartProps) {
  const data = campaigns.map((c) => ({
    name: truncate(c.campaign_name, 25),
    spend: c.spend ?? 0,
    leads: c.leads ?? 0,
    purchases: c.purchases ?? 0,
  }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-zinc-500">
        No data available for selected filters
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: "var(--tw-color-zinc-500)" }}
          angle={-45}
          textAnchor="end"
          height={70}
        />
        <YAxis
          yAxisId="left"
          orientation="left"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: "var(--tw-color-zinc-500)" }}
          tickFormatter={(value) => formatCurrency(value as number)}
          width={70}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: "var(--tw-color-zinc-500)" }}
          tickFormatter={(value) => Math.round(value as number).toString()}
          width={50}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fillOpacity: 0.05 }} />
        <Legend
          verticalAlign="top"
          height={30}
          iconSize={10}
          wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
        />
        <Bar yAxisId="left" dataKey="spend" barSize={16} fill="#3b82f6" name="Spend ($)" radius={[4, 4, 0, 0]} />
        <Line yAxisId="right" type="monotone" dataKey="leads" stroke="#22c55e" strokeWidth={2} name="Leads" dot={{ r: 3 }} />
        <Line yAxisId="right" type="monotone" dataKey="purchases" stroke="#06b6d4" strokeWidth={2} name="Purchases" dot={{ r: 3 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
