"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { formatCurrency, formatPercent, shortenLabel, dedupeLabels } from "@/lib/utils";
import type { CampaignRollup } from "@/types";

interface CostEfficiencyMatrixProps {
  rollup: CampaignRollup[];
}

type SortMode = "cpl" | "cpp" | "cpc";

interface Point {
  key: string;
  name: string;
  fullName: string;
  cpc: number;
  cpl: number;
  cpp: number;
  spend: number;
  leads: number;
}

const MODES: { key: SortMode; label: string; x: "cpl" | "cpp" | "cpc"; xLabel: string }[] = [
  { key: "cpl", label: "Best CPL", x: "cpl", xLabel: "Cost per Lead" },
  { key: "cpp", label: "Best CPP", x: "cpp", xLabel: "Cost per Post Click" },
  { key: "cpc", label: "Best CPC", x: "cpc", xLabel: "Cost per Click" },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: Point }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  return (
    <div className="p-3 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl max-w-[220px]">
      <p className="text-xs font-medium text-white mb-2">{point.fullName}</p>
      <div className="space-y-1">
        <Row label="CPC" value={formatCurrency(point.cpc)} />
        <Row label="CPL" value={formatCurrency(point.cpl)} />
        <Row label="Spend" value={formatCurrency(point.spend)} />
        <Row label="Leads" value={point.leads.toLocaleString("en-IN")} />
      </div>
    </div>
  );
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-zinc-400">{label}</span>
      <span className="text-xs font-semibold text-white">{value}</span>
    </div>
  );
}

export default function CostEfficiencyMatrix({ rollup }: CostEfficiencyMatrixProps) {
  const [mode, setMode] = useState<SortMode>("cpl");
  const active = MODES.find((m) => m.key === mode) ?? MODES[0];

  if (!rollup || rollup.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">
        No data
      </div>
    );
  }

  const data: Point[] = rollup
    .map((c) => ({
      key: c.campaign_id,
      name: shortenLabel(c.campaign_name, 20),
      fullName: c.campaign_name,
      cpc: c.cpc,
      cpl: c.cost_per_lead,
      cpp: c.cpp,
      spend: c.spend,
      leads: c.leads,
    }))
    .sort((a, b) => a[active.x] - b[active.x])
    .slice(0, 10);

  const uniqueNames = dedupeLabels(data.map((d) => d.name));
  data.forEach((d, i) => {
    d.name = uniqueNames[i];
  });

  const best = data[0]?.[active.x] ?? 0;

  return (
    <div>
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
              mode === m.key
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 30 + 40)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 60, left: 150, bottom: 5 }}
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
            tickFormatter={(v) => `₹${Number(v).toFixed(0)}`}
          />
          <YAxis
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: "#a1a1aa" }}
            width={150}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fillOpacity: 0.05 }} />
          <Legend
            verticalAlign="top"
            height={26}
            iconSize={10}
            wrapperStyle={{ fontSize: "11px" }}
          />
          <Bar
            dataKey={active.x}
            barSize={12}
            radius={[0, 4, 4, 0]}
            name={active.xLabel}
          >
            {data.map((p) => (
              <Cell
                key={p.key}
                fill={p[active.x] === best ? "#22c55e" : "#3b82f6"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-zinc-500 mt-2">
        Green = best {active.xLabel.toLowerCase()} in range
      </p>
    </div>
  );
}

export function CostEfficiencyTable({ rollup }: { rollup: CampaignRollup[] }) {
  if (!rollup || rollup.length === 0) {
    return <p className="text-sm text-zinc-500">No data</p>;
  }

  const rows = [...rollup]
    .filter((c) => c.leads > 0)
    .sort((a, b) => a.cost_per_lead - b.cost_per_lead);

  if (rows.length === 0) {
    return <p className="text-sm text-zinc-500">No campaigns generated leads</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs whitespace-nowrap">
        <thead>
          <tr className="border-b border-zinc-800 text-zinc-500 uppercase">
            <th className="py-2 text-left font-medium">#</th>
            <th className="py-2 text-left font-medium">Campaign</th>
            <th className="py-2 text-right font-medium">CPL</th>
            <th className="py-2 text-right font-medium">Leads</th>
            <th className="py-2 text-right font-medium">Spend</th>
            <th className="py-2 text-right font-medium">Lead Conv.</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c, i) => (
            <tr key={c.campaign_id} className="border-b border-zinc-800/50">
              <td className="py-2 text-zinc-600">{i + 1}</td>
              <td className="py-2 text-white">{c.campaign_name}</td>
              <td className="py-2 text-right text-green-400 font-semibold">
                {formatCurrency(c.cost_per_lead)}
              </td>
              <td className="py-2 text-right text-zinc-300">
                {c.leads.toLocaleString("en-IN")}
              </td>
              <td className="py-2 text-right text-zinc-300">
                {formatCurrency(c.spend)}
              </td>
              <td className="py-2 text-right text-zinc-400">
                {formatPercent(c.lead_conversion_rate)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
