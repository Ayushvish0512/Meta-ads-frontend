"use client";

import {
  Database,
  CalendarRange,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import {
  formatDate,
  formatDateTime,
  formatNumber,
  relativeTime,
} from "@/lib/utils";
import type { DataHealthResponse } from "@/types";

interface DataHealthProps {
  health: DataHealthResponse | null;
  loading?: boolean;
}

function StatusIcon({ status }: { status: string }) {
  if (status === "success") {
    return <CheckCircle2 size={12} className="text-green-400" />;
  }
  if (status === "error") return <XCircle size={12} className="text-red-400" />;
  return <Clock size={12} className="text-zinc-500" />;
}

export default function DataHealth({ health, loading = false }: DataHealthProps) {
  if (loading || !health) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 bg-zinc-800 rounded-lg" />
        ))}
      </div>
    );
  }

  const stale =
    health.data_freshness_hours !== null && health.data_freshness_hours > 48;
  const coveragePct =
    health.distinct_dates > 0
      ? Math.round(
          (health.distinct_dates /
            Math.max(
              1,
              daysBetween(health.first_date, health.last_date) + 1
            )) *
            100
        )
      : 0;

  return (
    <div className="space-y-4">
      {stale && (
        <div className="flex items-center gap-2 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <AlertTriangle size={14} className="text-amber-400" />
          <p className="text-xs text-amber-200/90">
            Data is {relativeTime(health.data_freshness_hours)} old — last sync{" "}
            {formatDateTime(health.last_sync?.started_at)}.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat
          icon={<Database size={13} className="text-blue-400" />}
          label="Rows"
          value={formatNumber(health.total_rows)}
        />
        <Stat
          icon={<Database size={13} className="text-purple-400" />}
          label="Campaigns"
          value={formatNumber(health.campaign_count)}
        />
        <Stat
          icon={<CalendarRange size={13} className="text-green-400" />}
          label="Date Span"
          value={`${health.distinct_dates}d`}
          sub={`${coveragePct}% coverage`}
        />
        <Stat
          icon={<RefreshCw size={13} className="text-cyan-400" />}
          label="Last Sync"
          value={relativeTime(health.data_freshness_hours)}
          sub={health.last_sync?.mode ?? "—"}
        />
      </div>

      <div className="text-xs text-zinc-500 flex flex-wrap gap-x-4 gap-y-1">
        <span>
          Range: {formatDate(health.first_date)} → {formatDate(health.last_date)}
        </span>
        <span>Raw insights: {formatNumber(health.raw_insights_rows)}</span>
        <span>
          Distinct dates: {health.distinct_dates} of{" "}
          {daysBetween(health.first_date, health.last_date) + 1} calendar days
        </span>
      </div>

      {health.recent_syncs.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs whitespace-nowrap">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 uppercase">
                <th className="py-2 text-left font-medium">Status</th>
                <th className="py-2 text-left font-medium">Started</th>
                <th className="py-2 text-left font-medium">Mode</th>
                <th className="py-2 text-left font-medium">Window</th>
                <th className="py-2 text-right font-medium">Received</th>
                <th className="py-2 text-right font-medium">Saved</th>
              </tr>
            </thead>
            <tbody>
              {health.recent_syncs.map((sync) => (
                <tr key={sync.id} className="border-b border-zinc-800/50">
                  <td className="py-2">
                    <span className="flex items-center gap-1.5">
                      <StatusIcon status={sync.status} />
                      <span
                        className={
                          sync.status === "success"
                            ? "text-green-400"
                            : sync.status === "error"
                              ? "text-red-400"
                              : "text-zinc-400"
                        }
                      >
                        {sync.status}
                      </span>
                    </span>
                  </td>
                  <td className="py-2 text-zinc-300">
                    {formatDateTime(sync.started_at)}
                  </td>
                  <td className="py-2 text-zinc-400">{sync.mode}</td>
                  <td className="py-2 text-zinc-500">
                    {sync.since ?? "—"} → {sync.until ?? "—"}
                  </td>
                  <td className="py-2 text-right text-zinc-400">
                    {formatNumber(sync.records_received)}
                  </td>
                  <td className="py-2 text-right text-zinc-300">
                    {formatNumber(sync.records_saved)}
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

function daysBetween(a: string | null, b: string | null): number {
  if (!a || !b) return 0;
  const start = new Date(`${a}T00:00:00`).getTime();
  const end = new Date(`${b}T00:00:00`).getTime();
  if (isNaN(start) || isNaN(end)) return 0;
  return Math.max(0, Math.round((end - start) / 86400000));
}

function Stat({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-800">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[10px] uppercase text-zinc-500">{label}</span>
      </div>
      <div className="text-base font-bold text-white break-words">{value}</div>
      {sub && <div className="text-[11px] text-zinc-500 mt-0.5">{sub}</div>}
    </div>
  );
}
