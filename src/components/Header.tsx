"use client";

import { Calendar, Download, RefreshCw } from "lucide-react";
import type { CampaignSummary } from "@/types";

interface HeaderProps {
  summary: CampaignSummary | null;
  dateRange: { start: string | null; end: string | null };
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
    <header className="flex items-center justify-between px-6 py-4 bg-zinc-900 border-b border-zinc-800">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600">
          <span className="text-xl font-bold text-white">M</span>
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">
            Meta Ads Performance Intelligence
          </h1>
          <p className="text-sm text-zinc-500">
            {summary?.campaign_count ?? 0} campaigns · {formatDateRange()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <Download size={16} />
          Export CSV
        </button>
        <div className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 bg-zinc-800 rounded-lg">
          <Calendar size={16} />
          <span>{formatDateRange()}</span>
        </div>
      </div>
    </header>
  );
}
