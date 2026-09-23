"use client";

import { useEffect, useState, useCallback } from "react";
import Header from "@/components/Header";
import KPIGrid from "@/components/KPIGrid";
import PerformanceChart from "@/components/PerformanceChart";
import CostEfficiencyScatter from "@/components/CostEfficiencyScatter";
import FunnelChart from "@/components/FunnelChart";
import ActionBreakdown from "@/components/ActionBreakdown";
import CampaignTable from "@/components/CampaignTable";
import DateRangePicker, { DateRange } from "@/components/DateRangePicker";
import TimeTrendsChart from "@/components/TimeTrendsChart";
import { Section } from "@/components/Section";
import { fetchAndExportCSV } from "@/lib/csv-export";
import type {
  CampaignSummary,
  Campaign,
  CampaignsResponse,
  TrendPoint,
  FunnelData,
  ActionAggregation,
} from "@/types";

const DEFAULT_DATE_RANGE: DateRange = {
  start: null,
  end: null,
  label: "All Time",
};

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>(DEFAULT_DATE_RANGE);

  const [summary, setSummary] = useState<CampaignSummary | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [total, setTotal] = useState(0);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [funnel, setFunnel] = useState<FunnelData | null>(null);
  const [actions, setActions] = useState<ActionAggregation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildParams = useCallback(() => {
    const params = new URLSearchParams();
    if (dateRange.start) params.set("date_start", dateRange.start);
    if (dateRange.end) params.set("date_stop", dateRange.end);
    return params.toString();
  }, [dateRange]);

  const fetchData = useCallback(async () => {
    const params = buildParams();
    setLoading(true);
    setError(null);
    try {
      const [
        summaryRes,
        campaignsRes,
        trendsRes,
        funnelRes,
        actionsRes,
      ] = await Promise.all([
        fetch(`/api/campaigns/summary?${params}`).then((r) => r.json()),
        fetch(`/api/campaigns?${params}&page=1&page_size=1000`).then((r) => r.json()),
        fetch(`/api/campaigns/trends?${params}`).then((r) => r.json()),
        fetch(`/api/campaigns/funnel?${params}`).then((r) => r.json()),
        fetch(`/api/campaigns/actions?${params}&top_n=15`).then((r) => r.json()),
      ]);

      setSummary(summaryRes);
      setCampaigns(campaignsRes.campaigns || []);
      setTotal(campaignsRes.total || 0);
      setTrends(trendsRes.trends || []);
      setFunnel(funnelRes.funnel || null);
      setActions(actionsRes.actions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleExportCSV = () => {
    void fetchAndExportCSV(dateRange.start, dateRange.end);
  };

  const handleRefresh = () => {
    void fetchData();
  };

  if (loading && !summary && campaigns.length === 0) {
    return (
      <div className="min-h-screen bg-black">
        <Header
          summary={null}
          dateRange={dateRange}
          onExport={handleExportCSV}
          onRefresh={handleRefresh}
        />
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="p-5 bg-zinc-900 rounded-xl border border-zinc-800 animate-pulse"
              >
                <div className="h-3 bg-zinc-800 rounded mb-2 w-2/3"></div>
                <div className="h-6 bg-zinc-800 rounded w-3/4"></div>
              </div>
            ))}
          </div>
          <div className="h-96 bg-zinc-900 rounded-xl border border-zinc-800 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <Header
        summary={summary}
        dateRange={dateRange}
        onExport={handleExportCSV}
        onRefresh={handleRefresh}
      />

      <main className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Dashboard Overview</h2>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>

        <KPIGrid summary={summary} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <Section title="Spend vs Results by Campaign">
              <PerformanceChart campaigns={campaigns} />
            </Section>
          </div>

          <div className="lg:col-span-2">
            <Section title="Conversion Funnel">
              <FunnelChart funnel={funnel} />
            </Section>
          </div>

          <div className="lg:col-span-1">
            <Section title="Cost Efficiency">
              <CostEfficiencyScatter campaigns={campaigns} />
            </Section>
          </div>

          <div className="lg:col-span-2">
            <Section title="Action Breakdown">
              <ActionBreakdown actions={actions} />
            </Section>
          </div>

          <div className="lg:col-span-1 h-[300px]">
            <Section title="Spend Over Time" className="h-full">
              <div className="h-[200px]">
                <TimeTrendsChart trends={trends} />
              </div>
            </Section>
          </div>
        </div>

        <Section title="Campaign Data Table">
          <CampaignTable campaigns={campaigns} total={total} />
        </Section>
      </main>
    </div>
  );
}
