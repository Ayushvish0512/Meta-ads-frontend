"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import {
  formatCompactCurrency,
  formatCompactNumber,
  formatCurrency,
} from "@/lib/utils";
import type { TrendPoint } from "@/types";

interface DailyTrendsChartProps {
  trends: TrendPoint[];
}

type View = "spend" | "results" | "efficiency" | "cumulative";

const VIEWS: { key: View; label: string }[] = [
  { key: "spend", label: "Spend & Impressions" },
  { key: "results", label: "Results" },
  { key: "efficiency", label: "Efficiency" },
  { key: "cumulative", label: "Cumulative" },
];

interface TooltipEntry {
  color: string;
  dataKey: string;
  value: number;
  name?: string;
  payload?: Record<string, unknown>;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

const CURRENCY_KEYS = new Set(["spend", "cpl", "cpc", "cumulative_spend"]);

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="p-3 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl max-w-[240px]">
      <p className="text-xs font-medium text-zinc-400 mb-2">{label}</p>
      {payload.map((entry) => {
        const raw = entry.payload?.[entry.dataKey] as number | undefined;
        const value = raw ?? entry.value;
        const isCurrency = CURRENCY_KEYS.has(entry.dataKey);
        const isRate = entry.dataKey === "ctr";
        return (
          <div
            key={entry.dataKey}
            className="flex items-center justify-between gap-6 mt-1"
          >
            <span className="text-xs" style={{ color: entry.color }}>
              {entry.name}
            </span>
            <span className="text-xs font-semibold text-white">
              {isCurrency
                ? formatCurrency(value)
                : isRate
                  ? `${value.toFixed(2)}%`
                  : formatCompactNumber(value)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default function DailyTrendsChart({ trends }: DailyTrendsChartProps) {
  const [view, setView] = useState<View>("spend");

  if (!trends || trends.length === 0) {
    return (
      <div className="flex items-center justify-center h-72 text-zinc-500 text-sm">
        No trend data for selected filters
      </div>
    );
  }

  const data = trends.map((t) => ({
    date: t.date.length >= 10 ? t.date.slice(5) : t.date,
    spend: t.spend,
    cumulative_spend: t.cumulative_spend,
    impressions: t.impressions,
    clicks: t.clicks,
    leads: t.leads,
    purchases: t.purchases,
    landing_page_views: t.landing_page_views,
    video_views: t.video_views,
    ctr: t.ctr,
    cpc: t.cpc,
    cpl: t.cpl,
    active_campaigns: t.active_campaigns,
  }));

  const avgSpend =
    trends.reduce((sum, t) => sum + t.spend, 0) / trends.length;

  return (
    <div>
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
              view === v.key
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={340}>
        {view === "spend" ? (
          <ComposedChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: "#71717a" }}
              minTickGap={24}
            />
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: "#71717a" }}
              tickFormatter={(v) => formatCompactCurrency(Number(v))}
              width={64}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: "#71717a" }}
              tickFormatter={(v) => formatCompactNumber(Number(v))}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fillOpacity: 0.05 }} />
            <Legend
              verticalAlign="top"
              height={30}
              iconSize={10}
              wrapperStyle={{ fontSize: "11px" }}
            />
            <ReferenceLine
              yAxisId="left"
              y={avgSpend}
              stroke="#52525b"
              strokeDasharray="4 4"
              label={{
                value: "avg",
                position: "right",
                fill: "#71717a",
                fontSize: 9,
              }}
            />
            <Bar
              yAxisId="left"
              dataKey="spend"
              fill="#3b82f6"
              barSize={10}
              name="Spend"
              radius={[2, 2, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="impressions"
              stroke="#a855f7"
              strokeWidth={2}
              name="Impressions"
              dot={false}
            />
          </ComposedChart>
        ) : view === "results" ? (
          <ComposedChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: "#71717a" }}
              minTickGap={24}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: "#71717a" }}
              tickFormatter={(v) => formatCompactNumber(Number(v))}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fillOpacity: 0.05 }} />
            <Legend
              verticalAlign="top"
              height={30}
              iconSize={10}
              wrapperStyle={{ fontSize: "11px" }}
            />
            <Bar dataKey="leads" stackId="a" fill="#22c55e" name="Leads" barSize={10} />
            <Bar dataKey="purchases" stackId="a" fill="#06b6d4" name="Purchases" barSize={10} radius={[2, 2, 0, 0]} />
            <Line
              type="monotone"
              dataKey="landing_page_views"
              stroke="#6366f1"
              strokeWidth={2}
              name="Landing Page Views"
              dot={false}
            />
          </ComposedChart>
        ) : view === "efficiency" ? (
          <ComposedChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: "#71717a" }}
              minTickGap={24}
            />
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: "#71717a" }}
              tickFormatter={(v) => formatCurrency(Number(v))}
              width={64}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: "#71717a" }}
              tickFormatter={(v) => `${Number(v).toFixed(1)}%`}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fillOpacity: 0.05 }} />
            <Legend
              verticalAlign="top"
              height={30}
              iconSize={10}
              wrapperStyle={{ fontSize: "11px" }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="cpl"
              stroke="#f59e0b"
              strokeWidth={2}
              name="Cost per Lead"
              dot={false}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="cpc"
              stroke="#3b82f6"
              strokeWidth={2}
              name="CPC"
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="ctr"
              stroke="#22c55e"
              strokeWidth={2}
              name="CTR %"
              dot={false}
            />
          </ComposedChart>
        ) : (
          <AreaChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
            <defs>
              <linearGradient id="cumSpend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: "#71717a" }}
              minTickGap={24}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: "#71717a" }}
              tickFormatter={(v) => formatCompactCurrency(Number(v))}
              width={64}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={30}
              iconSize={10}
              wrapperStyle={{ fontSize: "11px" }}
            />
            <Area
              type="monotone"
              dataKey="cumulative_spend"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#cumSpend)"
              name="Cumulative Spend"
            />
            <Line
              type="monotone"
              dataKey="active_campaigns"
              stroke="#a855f7"
              strokeWidth={2}
              name="Active Campaigns"
              dot={false}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
