"use client";

import { Info } from "lucide-react";
import type { FunnelData } from "@/types";
import { formatCompactNumber, formatPercent } from "@/lib/utils";

interface FunnelChartProps {
  funnel: FunnelData | null;
  rates?: Record<string, number> | null;
}

const STAGE_COLORS: Record<string, string> = {
  Impressions: "from-blue-600 to-blue-500",
  Reach: "from-sky-600 to-sky-500",
  "Link Clicks": "from-indigo-600 to-indigo-500",
  "Landing Page Views": "from-purple-600 to-purple-500",
  Leads: "from-green-600 to-green-500",
  Purchases: "from-cyan-600 to-cyan-500",
};

export default function FunnelChart({ funnel, rates }: FunnelChartProps) {
  if (!funnel) {
    return (
      <div className="space-y-2 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-11 bg-zinc-800 rounded-lg" />
        ))}
      </div>
    );
  }

  const stages = [
    { label: "Impressions", value: funnel.impressions, rateKey: "impression_to_click" },
    { label: "Reach", value: funnel.reach, rateKey: null },
    { label: "Link Clicks", value: funnel.link_clicks, rateKey: "click_to_lpv" },
    { label: "Landing Page Views", value: funnel.landing_page_views, rateKey: "lpv_to_lead" },
    { label: "Leads", value: funnel.leads, rateKey: "lead_to_purchase" },
    { label: "Purchases", value: funnel.purchases, rateKey: null },
  ];

  const maxValue = stages[0].value || 1;

  return (
    <div>
      <div className="space-y-2.5">
        {stages.map((stage) => {
          const widthPercent = Math.max(12, (stage.value / maxValue) * 100);
          const rate = stage.rateKey && rates ? rates[stage.rateKey] : null;
          const toLabel = stage.rateKey
            ? stages[stages.findIndex((s) => s.label === stage.label) + 1]?.label
            : null;

          return (
            <div key={stage.label}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-zinc-400">{stage.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">
                    {formatCompactNumber(stage.value)}
                  </span>
                  {rate !== null && rate !== undefined && (
                    <>
                      <span className="text-zinc-600">|</span>
                      <span className="text-zinc-500">
                        {formatPercent(rate)} → {toLabel}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div
                className={`h-8 rounded-md bg-gradient-to-r ${
                  STAGE_COLORS[stage.label] ?? "from-zinc-700 to-zinc-600"
                } transition-all duration-500`}
                style={{ width: `${widthPercent}%` }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-800 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <div className="flex items-center gap-1 text-[10px] text-zinc-500 uppercase">
            <Info size={10} />
            Click → Lead
          </div>
          <div className="text-sm font-semibold text-white">
            {formatPercent(rates?.click_to_lead ?? 0)}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-zinc-500 uppercase">Click → Purchase</div>
          <div className="text-sm font-semibold text-white">
            {formatPercent(rates?.click_to_purchase ?? 0)}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-zinc-500 uppercase">Lead → Purchase</div>
          <div className="text-sm font-semibold text-white">
            {formatPercent(rates?.lead_to_purchase ?? 0)}
          </div>
        </div>
      </div>
    </div>
  );
}
