"use client";

import { TrendingUp, TrendingDown, DollarSign, MousePointer, Target, BarChart3 } from "lucide-react";
import type { CampaignSummary } from "@/types";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
}

function KPICard({ title, value, icon, subtitle, trend }: KPICardProps) {
  const trendColors = {
    up: "text-green-400",
    down: "text-red-400",
    neutral: "text-zinc-500",
  };

  return (
    <div className="flex flex-col p-5 bg-zinc-900 rounded-xl border border-zinc-800">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-zinc-500">{title}</span>
        <div className={`p-2 rounded-lg ${trend ? `bg-${trend === "up" ? "green" : trend === "down" ? "red" : "zinc"}-900/50` : "bg-zinc-800"}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {subtitle && (
        <span className={`text-xs mt-1 ${trend ? trendColors[trend] : "text-zinc-500"}`}>
          {subtitle}
        </span>
      )}
    </div>
  );
}

interface KPIGridProps {
  summary: CampaignSummary | null;
}

export default function KPIGrid({ summary }: KPIGridProps) {
  if (!summary) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-5 bg-zinc-900 rounded-xl border border-zinc-800 animate-pulse">
            <div className="h-4 bg-zinc-800 rounded mb-3"></div>
            <div className="h-7 bg-zinc-800 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <KPICard
        title="Total Spend"
        value={formatCurrency(summary.total_spend)}
        icon={<DollarSign size={20} className="text-blue-400" />}
        subtitle={`${summary.campaign_count} campaigns`}
        trend="neutral"
      />
      <KPICard
        title="Impressions"
        value={formatNumber(summary.total_impressions)}
        icon={<BarChart3 size={20} className="text-purple-400" />}
        subtitle={formatNumber(summary.total_reach) + " reach"}
      />
      <KPICard
        title="Clicks"
        value={formatNumber(summary.total_clicks)}
        icon={<MousePointer size={20} className="text-orange-400" />}
        subtitle={formatPercent(summary.overall_ctr) + " CTR"}
        trend={summary.overall_ctr > 0.5 ? "up" : "neutral"}
      />
      <KPICard
        title="Avg CPC"
        value={formatCurrency(summary.avg_cpc)}
        icon={<DollarSign size={20} className="text-yellow-400" />}
        subtitle={formatCurrency(summary.avg_cpm) + " CPM"}
      />
      <KPICard
        title="Leads"
        value={formatNumber(summary.total_leads)}
        icon={<Target size={20} className="text-green-400" />}
        subtitle={formatCurrency(summary.avg_cpl) + " CPL"}
      />
      <KPICard
        title="Purchases"
        value={formatNumber(summary.total_purchases)}
        icon={<TrendingUp size={20} className="text-cyan-400" />}
        subtitle={summary.total_purchases > 0 ? "Revenue driver" : "No conversions"}
      />
    </div>
  );
}
