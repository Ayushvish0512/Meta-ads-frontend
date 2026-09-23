"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatNumber } from "@/lib/utils";
import type { ActionAggregation } from "@/types";

interface ActionBreakdownProps {
  actions: ActionAggregation[];
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
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl">
        <p className="text-xs font-medium text-zinc-400 mb-1">
          {String(payload[0]?.payload?.action_type ?? "")}
        </p>
        <p className="text-sm font-bold text-white">
          {formatNumber(payload[0]?.value as number)}
        </p>
      </div>
    );
  }
  return null;
};

export default function ActionBreakdown({ actions }: ActionBreakdownProps) {
  if (!actions || actions.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-zinc-500">
        No action data available
      </div>
    );
  }

  const data = actions.map((a) => ({
    action_type: a.action_type,
    value: Math.round(a.value),
  }));

  return (
    <ResponsiveContainer
      width="100%"
      height={Math.min(actions.length * 34 + 40, 520)}
    >
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 20, left: 180, bottom: 5 }}
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
          tick={{ fontSize: 10, fill: "var(--tw-color-zinc-500)" }}
        />
        <YAxis
          type="category"
          dataKey="action_type"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 9, fill: "var(--tw-color-zinc-400)" }}
          width={180}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fillOpacity: 0.05 }} />
        <Bar
          dataKey="value"
          barSize={8}
          fill="#8b5cf6"
          name="Value"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
