"use client";

import {
  IndianRupee,
  BarChart3,
  MousePointer,
  Target,
  TrendingUp,
  Video,
  Repeat,
  Users,
} from "lucide-react";
import type { CampaignSummary } from "@/types";
import {
  formatCompactCurrency,
  formatCompactNumber,
  formatCurrency,
  formatNumber,
  formatPercent,
} from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  subtitle?: string;
  accent?: string;
}

function KPICard({ title, value, icon, subtitle, accent }: KPICardProps) {
  return (
    <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-medium text-zinc-500 truncate">
          {title}
        </span>
        <div className="p-1.5 bg-zinc-800 rounded-lg shrink-0">{icon}</div>
      </div>
      <div className="text-xl sm:text-2xl font-bold text-white break-words">
        {value}
      </div>
      {subtitle && (
        <span className="text-[11px] text-zinc-500 mt-1 block break-words">
          {subtitle}
        </span>
      )}
      {accent && (
        <div className={`h-0.5 w-8 rounded-full mt-2 ${accent}`} />
      )}
    </div>
  );
}

interface KPIGridProps {
  summary: CampaignSummary | null;
}

const SKELETON_COUNT = 12;

export default function KPIGrid({ summary }: KPIGridProps) {
  if (!summary) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <div
            key={i}
            className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 animate-pulse"
          >
            <div className="h-3 bg-zinc-800 rounded mb-2 w-2/3" />
            <div className="h-6 bg-zinc-800 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KPICard
          title="Total Spend"
          value={formatCompactCurrency(summary.total_spend)}
          icon={<IndianRupee size={16} className="text-blue-400" />}
          subtitle={`${summary.row_count} days · ${summary.campaign_count} campaigns`}
          accent="bg-blue-500"
        />
        <KPICard
          title="Impressions"
          value={formatCompactNumber(summary.total_impressions)}
          icon={<BarChart3 size={16} className="text-purple-400" />}
          subtitle={`${formatCompactNumber(summary.total_reach)} reach · ${summary.avg_frequency.toFixed(2)} freq`}
          accent="bg-purple-500"
        />
        <KPICard
          title="Clicks"
          value={formatCompactNumber(summary.total_clicks)}
          icon={<MousePointer size={16} className="text-orange-400" />}
          subtitle={`${formatPercent(summary.overall_ctr)} CTR`}
          accent="bg-orange-500"
        />
        <KPICard
          title="Avg CPC / CPM"
          value={formatCurrency(summary.avg_cpc)}
          icon={<IndianRupee size={16} className="text-yellow-400" />}
          subtitle={`CPM ${formatCurrency(summary.avg_cpm)}`}
          accent="bg-yellow-500"
        />
        <KPICard
          title="Total Leads"
          value={formatCompactNumber(summary.total_leads)}
          icon={<Target size={16} className="text-green-400" />}
          subtitle={`CPL ${formatCurrency(summary.avg_cpl)}`}
          accent="bg-green-500"
        />
        <KPICard
          title="Purchases"
          value={formatCompactNumber(summary.total_purchases)}
          icon={<TrendingUp size={16} className="text-cyan-400" />}
          subtitle={`${formatCurrency(summary.cost_per_purchase)} per purchase`}
          accent="bg-cyan-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KPICard
          title="Blended CPL"
          value={formatCurrency(summary.avg_cpl)}
          icon={<IndianRupee size={16} className="text-emerald-400" />}
          subtitle={`${formatPercent(summary.lead_conversion_rate)} lead conv.`}
        />
        <KPICard
          title="Purchase Rate"
          value={formatPercent(summary.purchase_conversion_rate)}
          icon={<TrendingUp size={16} className="text-teal-400" />}
          subtitle={`${formatNumber(summary.total_purchases)} conversions`}
        />
        <KPICard
          title="Cost / Post Click"
          value={formatCurrency(summary.avg_cpp)}
          icon={<Repeat size={16} className="text-pink-400" />}
          subtitle={`${formatPercent(summary.unique_ctr)} unique CTR`}
        />
        <KPICard
          title="Landing Page Views"
          value={formatCompactNumber(summary.total_landing_page_views)}
          icon={<MousePointer size={16} className="text-indigo-400" />}
          subtitle={`${formatPercent(summary.click_to_landing_page_rate)} of clicks`}
        />
        <KPICard
          title="Video Views"
          value={formatCompactNumber(summary.total_video_views)}
          icon={<Video size={16} className="text-purple-400" />}
          subtitle={`${formatPercent(
            (summary.total_video_views / (summary.total_impressions || 1)) * 100
          )} view rate`}
        />
        <KPICard
          title="Post Engagement"
          value={formatCompactNumber(summary.total_post_engagement)}
          icon={<Users size={16} className="text-pink-400" />}
          subtitle={`${formatNumber(summary.total_messaging_conversations)} conversations`}
        />
      </div>
    </div>
  );
}
