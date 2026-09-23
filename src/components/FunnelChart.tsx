"use client";

import { TrendingDown } from "lucide-react";
import type { FunnelData } from "@/types";
import { formatNumber, formatPercent } from "@/lib/utils";

interface FunnelChartProps {
  funnel: FunnelData | null;
}

export default function FunnelChart({ funnel }: FunnelChartProps) {
  if (!funnel) {
    return (
      <div className="space-y-2 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-zinc-800 rounded-lg"></div>
        ))}
      </div>
    );
  }

  const stages = [
    { label: "Impressions", value: funnel.impressions, color: "bg-blue-600" },
    { label: "Link Clicks", value: funnel.link_clicks, color: "bg-indigo-600" },
    { label: "Landing Page Views", value: funnel.landing_page_views, color: "bg-purple-600" },
    { label: "Leads", value: funnel.leads, color: "bg-green-600" },
    { label: "Purchases", value: funnel.purchases, color: "bg-cyan-600" },
  ];

  const maxValue = stages[0].value || 1;

  const getConversionRate = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return (current / previous) * 100;
  };

  return (
    <div className="space-y-3">
      {stages.map((stage, i) => {
        const widthPercent = Math.max(10, (stage.value / maxValue) * 100);
        const prevValue = i > 0 ? stages[i - 1].value : stage.value;
        const convRate = i > 0 ? getConversionRate(stage.value, prevValue) : 100;

        return (
          <div key={stage.label} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-300">{stage.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {formatNumber(stage.value)}
                </span>
                {i > 0 && (
                  <>
                    <div className="w-px h-4 bg-zinc-700"></div>
                    <span className="text-right text-xs text-zinc-500">
                      {formatPercent(convRate)} conv
                    </span>
                  </>
                )}
              </div>
            </div>
            <div
              className={`h-10 rounded-lg ${stage.color} transition-all duration-300 flex items-center justify-end pr-3 relative overflow-hidden`}
              style={{ width: `${widthPercent}%` }}
            >
              {i > 0 && (
                <div className="absolute -right-4 top-1/2 -translate-y-1/2">
                  <TrendingDown size={14} className="text-zinc-300" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
