"use client";

import { MessageCircle, Video, Heart, Gauge, MousePointerClick } from "lucide-react";
import {
  formatCompactNumber,
  formatCurrency,
  formatPercent,
} from "@/lib/utils";
import type { EngagementResponse } from "@/types";

interface EngagementAnalyticsProps {
  engagement: EngagementResponse | null;
  loading?: boolean;
}

const BUCKET_STYLES: Record<string, { bar: string; icon: React.ReactNode }> = {
  "Video Views": {
    bar: "bg-purple-500",
    icon: <Video size={14} className="text-purple-400" />,
  },
  "Post Engagement": {
    bar: "bg-pink-500",
    icon: <Heart size={14} className="text-pink-400" />,
  },
  "Landing Page Views": {
    bar: "bg-indigo-500",
    icon: <MousePointerClick size={14} className="text-indigo-400" />,
  },
  "Messaging Conversations": {
    bar: "bg-amber-500",
    icon: <MessageCircle size={14} className="text-amber-400" />,
  },
};

function StatTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-800">
      <div className="text-[10px] uppercase text-zinc-500 mb-1">{label}</div>
      <div className="text-base font-bold text-white break-words">{value}</div>
      {sub && <div className="text-[11px] text-zinc-500 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function EngagementAnalytics({
  engagement,
  loading = false,
}: EngagementAnalyticsProps) {
  if (loading || !engagement) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 bg-zinc-800 rounded-lg" />
        ))}
      </div>
    );
  }

  const { totals, buckets, by_campaign: byCampaign } = engagement;
  const maxBucket = Math.max(...buckets.map((b) => b.value), 1);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile
          label="Video Views"
          value={formatCompactNumber(totals.video_views)}
          sub={`${formatPercent(totals.video_view_rate)} of impressions`}
        />
        <StatTile
          label="Post Engagement"
          value={formatCompactNumber(totals.post_engagement)}
          sub={`${formatPercent(totals.engagement_rate)} engagement rate`}
        />
        <StatTile
          label="Cost / Engagement"
          value={formatCurrency(totals.cost_per_engagement)}
          sub={`${formatCurrency(totals.cost_per_video_view)} per video view`}
        />
        <StatTile
          label="Messaging"
          value={formatCompactNumber(totals.messaging_conversations)}
          sub={`${totals.messaging_replies} replies`}
        />
      </div>

      <div className="space-y-2.5">
        {buckets.map((bucket) => {
          const style = BUCKET_STYLES[bucket.label] ?? {
            bar: "bg-zinc-500",
            icon: null,
          };
          return (
            <div key={bucket.label}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  {style.icon}
                  {bucket.label}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-zinc-500">
                    {formatCompactNumber(bucket.value)} · {formatPercent(bucket.share)}
                  </span>
                  <span className="text-zinc-400 font-medium">
                    {formatCurrency(bucket.cost)}/ea
                  </span>
                </span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${style.bar} rounded-full transition-all duration-500`}
                  style={{ width: `${(bucket.value / maxBucket) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs whitespace-nowrap">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 uppercase">
              <th className="py-2 text-left font-medium">Campaign</th>
              <th className="py-2 text-right font-medium">Video Views</th>
              <th className="py-2 text-right font-medium">Engagement Rate</th>
              <th className="py-2 text-right font-medium">Eng / ₹1</th>
              <th className="py-2 text-right font-medium">Messaging</th>
            </tr>
          </thead>
          <tbody>
            {byCampaign.slice(0, 8).map((c) => (
              <tr key={c.campaign_id} className="border-b border-zinc-800/50">
                <td className="py-2 text-white">{c.campaign_name}</td>
                <td className="py-2 text-right text-zinc-300">
                  {formatCompactNumber(c.video_views)}
                </td>
                <td className="py-2 text-right text-zinc-300">
                  {formatPercent(c.engagement_rate)}
                </td>
                <td className="py-2 text-right text-zinc-400">
                  {c.engagement_per_rupee}
                </td>
                <td className="py-2 text-right text-zinc-400">
                  {c.messaging_conversations}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function EngagementEfficiencyBadge({
  value,
}: {
  value: number;
}) {
  const tone =
    value >= 10 ? "text-green-400" : value >= 3 ? "text-yellow-400" : "text-red-400";
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${tone}`}>
      <Gauge size={12} />
      {value}
    </span>
  );
}
