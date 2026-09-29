"use client";

import { Download, RefreshCw } from "lucide-react";
import type { CampaignSummary } from "@/types";
import type { DateRange } from "@/components/DateRangePicker";

interface HeaderProps {
  summary: CampaignSummary | null;
  dateRange: DateRange;
  onExport: () => void;
  onRefresh: () => void;
}

export default function Header({
  summary,
  dateRange,
  onExport,
  onRefresh,
}: HeaderProps) {
  const formatDateRange = () => {
    if (!dateRange.start && !dateRange.end) return "All time";
    const s = dateRange.start || "";
    const e = dateRange.end || "";
    return `${s || "start"} → ${e || "end"}`;
  };

  return (
    <header className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-4 bg-zinc-900 border-b border-zinc-800">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600">
          <span className="text-xl font-bold text-white">M</span>
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">
            Meta Ads Intelligence
          </h1>
          <p className="text-sm text-zinc-500">
            {summary?.campaign_count ?? 0} campaigns · {summary?.total_leads?.toLocaleString("en-IN") ?? 0} leads · {formatDateRange()}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
        >
          <RefreshCw size={16} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
        <button
          onClick={onExport}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
        >
          <Download size={16} />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
        <div className="inline-flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 bg-zinc-800 rounded-lg">
          <span className="hidden sm:inline">{formatDateRange()}</span>
          <span className="sm:hidden text-xs">{dateRange.label}</span>
        </div>
      </div>
    </header>
  );
}
