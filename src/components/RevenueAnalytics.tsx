"use client";

import { AlertTriangle, IndianRupee, Percent, Receipt } from "lucide-react";
import {
  formatCurrency,
  formatCompactCurrency,
  formatNumber,
  formatPercent,
  formatRatio,
} from "@/lib/utils";
import type { RevenueSummary } from "@/types";

interface RevenueAnalyticsProps {
  revenue: RevenueSummary | null;
  loading?: boolean;
}

export default function RevenueAnalytics({
  revenue,
  loading = false,
}: RevenueAnalyticsProps) {
  if (loading || !revenue) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 bg-zinc-800 rounded-lg" />
        ))}
      </div>
    );
  }

  const hasRevenue = revenue.total_revenue > 0;
  const lowCoverage = revenue.revenue_coverage_pct < 50;

  return (
    <div className="space-y-4">
      {lowCoverage && (
        <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-200/90">
            ROAS is only measurable on{" "}
            <strong>{formatPercent(revenue.revenue_coverage_pct)}</strong> of rows (
            {revenue.rows_with_revenue} of {revenue.total_rows}). Meta only returns
            conversion values for some action types, so blended ROAS below is
            partial and understates true return.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Metric
          icon={<IndianRupee size={14} className="text-green-400" />}
          label="Attributed Revenue"
          value={hasRevenue ? formatCompactCurrency(revenue.total_revenue) : "—"}
          sub={hasRevenue ? "from action_values" : "no value data"}
        />
        <Metric
          icon={<Percent size={14} className="text-blue-400" />}
          label="Blended ROAS"
          value={hasRevenue ? formatRatio(revenue.blended_roas) : "—"}
          sub={`on ${formatCompactCurrency(revenue.total_spend)} spend`}
        />
        <Metric
          icon={<Receipt size={14} className="text-cyan-400" />}
          label="Purchases"
          value={formatNumber(revenue.total_purchases)}
          sub={`${formatCurrency(revenue.cost_per_purchase)} per purchase`}
        />
        <Metric
          icon={<IndianRupee size={14} className="text-purple-400" />}
          label="Value Sources"
          value={formatNumber(revenue.by_action_type.length)}
          sub="distinct action types"
        />
      </div>

      {hasRevenue && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs whitespace-nowrap">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 uppercase">
                <th className="py-2 text-left font-medium">Campaign</th>
                <th className="py-2 text-right font-medium">Spend</th>
                <th className="py-2 text-right font-medium">Purchases</th>
                <th className="py-2 text-right font-medium">Revenue</th>
                <th className="py-2 text-right font-medium">ROAS</th>
                <th className="py-2 text-right font-medium">Cost / Purch.</th>
              </tr>
            </thead>
            <tbody>
              {revenue.by_campaign
                .filter((c) => c.revenue > 0)
                .map((c) => (
                  <tr key={c.campaign_id} className="border-b border-zinc-800/50">
                    <td className="py-2 text-white">{c.campaign_name}</td>
                    <td className="py-2 text-right text-zinc-300">
                      {formatCurrency(c.spend)}
                    </td>
                    <td className="py-2 text-right text-zinc-300">
                      {c.purchases}
                    </td>
                    <td className="py-2 text-right text-green-400 font-medium">
                      {formatCurrency(c.revenue)}
                    </td>
                    <td className="py-2 text-right text-white font-semibold">
                      {formatRatio(c.roas)}
                    </td>
                    <td className="py-2 text-right text-zinc-400">
                      {formatCurrency(c.cost_per_purchase)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-800">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[10px] uppercase text-zinc-500">{label}</span>
      </div>
      <div className="text-base font-bold text-white break-words">{value}</div>
      <div className="text-[11px] text-zinc-500 mt-0.5">{sub}</div>
    </div>
  );
}
