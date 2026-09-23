"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ZAxis,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatCurrency, truncate } from "@/lib/utils";
import type { Campaign } from "@/types";

interface CostEfficiencyScatterProps {
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
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const p = payload[0]?.payload as {
      name: string;
      spend: number;
      cpc: number;
      cpl: number;
    };
    if (!p) return null;
    return (
      <div className="p-3 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl">
        <p className="text-xs font-medium text-zinc-400 mb-1">
          {truncate(p.name, 25) ?? "—"}
        </p>
        <div className="flex justify-between gap-4 mt-1">
          <span className="text-xs text-zinc-400">Spend:</span>
          <span className="font-medium text-white">
            {formatCurrency(p.spend)}
          </span>
        </div>
        <div className="flex justify-between gap-4 mt-1">
          <span className="text-xs text-zinc-400">CPC:</span>
          <span className="font-medium text-white">{formatCurrency(p.cpc)}</span>
        </div>
        <div className="flex justify-between gap-4 mt-1">
          <span className="text-xs text-zinc-400">CPL:</span>
          <span className="font-medium text-green-400">
            {formatCurrency(p.cpl)}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function CostEfficiencyScatter({
  campaigns,
}: CostEfficiencyScatterProps) {
  const data = campaigns
    .filter((c) => (c.cpc ?? 0) > 0 && (c.cost_per_lead ?? 0) > 0)
    .map((c) => ({
      name: c.campaign_name ?? "",
      cpc: c.cpc ?? 0,
      cpl: c.cost_per_lead ?? 0,
      spend: c.spend ?? 0,
    }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-zinc-500">
        No qualifying campaigns (need CPC and CPL data)
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart margin={{ top: 20, right: 20, left: 60, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
        <XAxis
          type="number"
          dataKey="cpc"
          name="CPC ($)"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: "var(--tw-color-zinc-500)" }}
          tickFormatter={(value) => formatCurrency(value as number)}
          width={70}
        />
        <YAxis
          type="number"
          dataKey="cpl"
          name="CPL ($)"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: "var(--tw-color-zinc-500)" }}
          tickFormatter={(value) => formatCurrency(value as number)}
          width={70}
        />
        <ZAxis type="number" dataKey="spend" range={[40, 200]} name="Spend ($)" />
        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />
        <Scatter name="Campaigns" data={data} fill="#3b82f6" shape="circle" />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
