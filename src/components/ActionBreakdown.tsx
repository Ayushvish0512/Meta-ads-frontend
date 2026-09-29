"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { formatCompactNumber } from "@/lib/utils";
import type { ActionAggregation } from "@/types";

interface ActionBreakdownProps {
  actions: ActionAggregation[];
}

const NOISE = /^(post$|post_engagement$|page_engagement$|post_interaction_net$)/;

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ color: string; payload: Record<string, unknown> }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0].payload as {
    action_type: string;
    value: number;
    share: number;
  };
  return (
    <div className="p-3 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl">
      <p className="text-xs font-medium text-white mb-1 break-all max-w-[220px]">
        {row.action_type}
      </p>
      <p className="text-sm font-bold text-white">
        {formatCompactNumber(row.value)}
      </p>
      <p className="text-[11px] text-zinc-500">{row.share.toFixed(2)}% of total</p>
    </div>
  );
};

export default function ActionBreakdown({ actions }: ActionBreakdownProps) {
  const [hideNoise, setHideNoise] = useState(true);

  if (!actions || actions.length === 0) {
    return (
      <div className="flex items-center justify-center h-72 text-zinc-500 text-sm">
        No action data available
      </div>
    );
  }

  const grandTotal = actions.reduce((sum, a) => sum + a.value, 0) || 1;

  const filtered = actions
    .filter((a) => (hideNoise ? !NOISE.test(a.action_type) : true))
    .slice(0, 14)
    .map((a, i) => ({
      key: `${a.action_type}-${i}`,
      action_type: a.action_type.length > 26 ? a.action_type.slice(0, 26) + "…" : a.action_type,
      full_name: a.action_type,
      value: Math.round(a.value),
      share: (a.value / grandTotal) * 100,
    }));

  if (filtered.length === 0) {
    return (
      <div className="flex items-center justify-center h-72 text-zinc-500 text-sm">
        No meaningful action types in range
      </div>
    );
  }

  return (
    <div>
      <label className="inline-flex items-center gap-2 mb-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={hideNoise}
          onChange={(e) => setHideNoise(e.target.checked)}
          className="w-3.5 h-3.5 accent-blue-600"
        />
        <span className="text-xs text-zinc-400">
          Hide post/page engagement noise
        </span>
      </label>

      <ResponsiveContainer width="100%" height={Math.max(220, filtered.length * 30 + 30)}>
        <BarChart
          data={filtered}
          layout="vertical"
          margin={{ top: 5, right: 60, left: 165, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            strokeOpacity={0.1}
            horizontal={false}
          />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: "#71717a" }}
            tickFormatter={(v) => formatCompactNumber(Number(v))}
          />
          <YAxis
            type="category"
            dataKey="action_type"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: "#a1a1aa" }}
            width={165}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fillOpacity: 0.05 }} />
          <Bar dataKey="value" barSize={10} radius={[0, 4, 4, 0]}>
            {filtered.map((entry) => (
              <Cell
                key={entry.key}
                fill={
                  /purchase|revenue|value|roas/.test(entry.full_name)
                    ? "#22c55e"
                    : /lead|conversion|onsite_web|offsite_lead/.test(entry.full_name)
                      ? "#06b6d4"
                      : /click/.test(entry.full_name)
                        ? "#3b82f6"
                        : "#8b5cf6"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
