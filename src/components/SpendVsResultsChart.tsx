"use client";

import { useState } from "react";
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
import { formatCompactCurrency, shortenLabel } from "@/lib/utils";
import type { CampaignRollup } from "@/types";

interface SpendVsResultsChartProps {
  rollup: CampaignRollup[];
}

type MetricKey = "leads" | "purchases";

interface TooltipEntry {
  color: string;
  dataKey: string;
  value: number;
  name?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="p-3 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl">
      <p className="text-xs font-medium text-zinc-400 mb-2">{label}</p>
      {payload.map((entry) => (
        <div
          key={entry.dataKey}
          className="flex items-center justify-between gap-6 mt-1"
        >
          <span className="text-xs" style={{ color: entry.color }}>
            {entry.name}
          </span>
          <span className="text-xs font-semibold text-white">
            {entry.dataKey === "spend"
              ? formatCompactCurrency(entry.value)
              : Math.round(entry.value).toLocaleString("en-IN")}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function SpendVsResultsChart({ rollup }: SpendVsResultsChartProps) {
  const [metric, setMetric] = useState<MetricKey>("leads");

  if (!rollup || rollup.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-zinc-500 text-sm">
        No campaign data for selected filters
      </div>
    );
  }

  const labels = rollup.map((c) => shortenLabel(c.campaign_name, 22));
  const data = rollup.map((c, i) => ({
    key: c.campaign_id,
    name: labels[i],
    spend: c.spend,
    leads: c.leads,
    purchases: c.purchases,
    cpl: c.cost_per_lead,
  }));

  const activeSeries =
    metric === "leads"
      ? { dataKey: "leads", name: "Leads", color: "#22c55e" }
      : { dataKey: "purchases", name: "Purchases", color: "#06b6d4" };

  return (
    <div>
      <div className="flex gap-1.5 mb-3">
        {(["leads", "purchases"] as MetricKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setMetric(key)}
            className={`px-2.5 py-1 text-xs rounded-md capitalize transition-colors ${
              metric === key
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {key}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={340}>
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#71717a" }}
            angle={-35}
            textAnchor="end"
            height={70}
            interval={0}
          />
          <YAxis
            yAxisId="left"
            orientation="left"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#71717a" }}
            tickFormatter={(v) => formatCompactCurrency(Number(v))}
            width={72}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#71717a" }}
            tickFormatter={(v) => Number(v).toLocaleString("en-IN")}
            width={56}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fillOpacity: 0.05 }}
          />
          <Legend
            verticalAlign="top"
            height={30}
            iconSize={10}
            wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
          />
          <Bar
            yAxisId="left"
            dataKey="spend"
            barSize={22}
            fill="#3b82f6"
            name="Spend"
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey={activeSeries.dataKey}
            stroke={activeSeries.color}
            strokeWidth={2}
            name={activeSeries.name}
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
