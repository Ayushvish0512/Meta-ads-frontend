"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  formatCompactCurrency,
  formatPercent,
  shortenLabel,
  dedupeLabels,
} from "@/lib/utils";
import { ChartSkeleton } from "@/components/Skeleton";
import type { CampaignRollup } from "@/types";

interface CampaignShareChartProps {
  rollup: CampaignRollup[];
  loading?: boolean;
}

const COLORS = [
  "#3b82f6",
  "#22c55e",
  "#a855f7",
  "#f59e0b",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
  "#f97316",
];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartSlice }>;
}

interface ChartSlice {
  key: string;
  name: string;
  fullName: string;
  value: number;
  share: number;
  leads: number;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const slice = payload[0].payload;
  return (
    <div className="p-3 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl max-w-[220px]">
      <p className="text-xs font-medium text-white mb-1">{slice.fullName}</p>
      <p className="text-sm font-bold text-white">
        {formatCompactCurrency(slice.value)}
      </p>
      <p className="text-[11px] text-zinc-500">
        {formatPercent(slice.share)} of spend · {slice.leads.toLocaleString("en-IN")} leads
      </p>
    </div>
  );
}

export default function CampaignShareChart({
  rollup,
  loading = false,
}: CampaignShareChartProps) {
  if (loading) {
    return <ChartSkeleton height={280} label="Loading spend split…" />;
  }

  if (!rollup || rollup.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">
        No data
      </div>
    );
  }

  const data: ChartSlice[] = rollup
    .filter((c) => c.spend > 0)
    .map((c) => ({
      key: c.campaign_id,
      name: shortenLabel(c.campaign_name, 24),
      fullName: c.campaign_name,
      value: c.spend,
      share: c.spend_share,
      leads: c.leads,
    }));

  const uniqueNames = dedupeLabels(data.map((d) => d.name));
  data.forEach((d, i) => {
    d.name = uniqueNames[i];
  });

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((entry, i) => (
              <Cell key={entry.key} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-3 space-y-1.5 max-h-[180px] overflow-y-auto">
        {data.map((entry, i) => (
          <div key={entry.key} className="flex items-center gap-2 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="text-zinc-400 truncate flex-1">{entry.name}</span>
            <span className="text-zinc-500 shrink-0">
              {formatPercent(entry.share)}
            </span>
            <span className="text-white font-medium shrink-0 w-16 text-right">
              {formatCompactCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-zinc-500 mt-2 pt-2 border-t border-zinc-800">
        Total {formatCompactCurrency(total)} across {data.length} campaigns
      </p>
    </div>
  );
}
