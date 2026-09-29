"use client";

import { useEffect, useState, useCallback } from "react";
import Header from "@/components/Header";
import KPIGrid from "@/components/KPIGrid";
import SpendVsResultsChart from "@/components/SpendVsResultsChart";
import CostEfficiencyMatrix, {
  CostEfficiencyTable,
} from "@/components/CostEfficiencyMatrix";
import FunnelChart from "@/components/FunnelChart";
import ActionBreakdown from "@/components/ActionBreakdown";
import CampaignTable from "@/components/CampaignTable";
import DateRangePicker, { DateRange } from "@/components/DateRangePicker";
import DailyTrendsChart from "@/components/DailyTrendsChart";
import EngagementAnalytics from "@/components/EngagementAnalytics";
import RevenueAnalytics from "@/components/RevenueAnalytics";
import DataHealth from "@/components/DataHealth";
import CampaignShareChart from "@/components/CampaignShareChart";
import { Section } from "@/components/Section";
import { fetchAndExportCSV } from "@/lib/csv-export";
import type {
  CampaignSummary,
  Campaign,
  CampaignRollup,
  TrendPoint,
  FunnelData,
  ActionAggregation,
  EngagementResponse,
  RevenueSummary,
  DataHealthResponse,
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
  const [rollup, setRollup] = useState<CampaignRollup[]>([]);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [funnel, setFunnel] = useState<FunnelData | null>(null);
  const [funnelRates, setFunnelRates] = useState<Record<string, number> | null>(null);
  const [actions, setActions] = useState<ActionAggregation[]>([]);
  const [engagement, setEngagement] = useState<EngagementResponse | null>(null);
  const [revenue, setRevenue] = useState<RevenueSummary | null>(null);
  const [health, setHealth] = useState<DataHealthResponse | null>(null);
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
      const get = (url: string) =>
        fetch(url).then((r) => {
          if (!r.ok) throw new Error(`${url} failed (${r.status})`);
          return r.json();
        });

      const [
        summaryRes,
        campaignsRes,
        rollupRes,
        trendsRes,
        funnelRes,
        actionsRes,
        engagementRes,
        revenueRes,
        healthRes,
      ] = await Promise.all([
        get(`/api/campaigns/summary?${params}`),
        get(`/api/campaigns?${params}&page=1&page_size=1000`),
        get(`/api/campaigns/rollup?${params}`),
        get(`/api/campaigns/trends?${params}`),
        get(`/api/campaigns/funnel?${params}`),
        get(`/api/campaigns/actions?${params}&top_n=20`),
        get(`/api/campaigns/engagement?${params}`),
        get(`/api/campaigns/revenue?${params}`),
        get(`/api/data/health?${params}`),
      ]);

      setSummary(summaryRes);
      setCampaigns(campaignsRes.campaigns ?? []);
      setTotal(campaignsRes.total ?? 0);
      setRollup(rollupRes.rollup ?? []);
      setTrends(trendsRes.trends ?? []);
      setFunnel(funnelRes.funnel ?? null);
      setFunnelRates(funnelRes.rates ?? null);
      setActions(actionsRes.actions ?? []);
      setEngagement(engagementRes);
      setRevenue(revenueRes);
      setHealth(healthRes);
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
        <div className="p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 animate-pulse"
              >
                <div className="h-3 bg-zinc-800 rounded mb-2 w-2/3" />
                <div className="h-6 bg-zinc-800 rounded w-3/4" />
              </div>
            ))}
          </div>
          <div className="h-80 bg-zinc-900 rounded-xl border border-zinc-800 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
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

      <main className="p-4 sm:p-6 space-y-6 max-w-[1800px] mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Performance Overview
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {summary
                ? `${summary.row_count} daily records · ${summary.campaign_count} campaigns · ${summary.date_range_start} to ${summary.date_range_end}`
                : ""}
            </p>
          </div>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>

        <KPIGrid summary={summary} />

        <Section
          title="Daily Performance Trends"
          subtitle="Switch views to compare spend, results, efficiency, and cumulative burn"
        >
          <DailyTrendsChart trends={trends} />
        </Section>

        <Section
          title="Spend vs Results by Campaign"
          subtitle={`Aggregated across ${rollup.length} campaigns in range`}
        >
          <SpendVsResultsChart rollup={rollup} />
        </Section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <Section
              title="Conversion Funnel"
              subtitle="Stage-to-stage drop-off with blended rates"
            >
              <FunnelChart funnel={funnel} rates={funnelRates} />
            </Section>
          </div>
          <div className="xl:col-span-1">
            <Section
              title="Spend Concentration"
              subtitle="Where the budget is going"
            >
              <CampaignShareChart rollup={rollup} />
            </Section>
          </div>
        </div>

        <Section
          title="Engagement Analytics"
          subtitle="Video, post engagement, landing pages, and messaging efficiency"
        >
          <EngagementAnalytics engagement={engagement} />
        </Section>

        <Section
          title="Revenue & ROAS"
          subtitle="Attributed conversion value from Meta action values"
        >
          <RevenueAnalytics revenue={revenue} />
        </Section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Section
            title="Cost Efficiency Matrix"
            subtitle="Ranked campaigns by cost efficiency (green = best)"
          >
            <CostEfficiencyMatrix rollup={rollup} />
          </Section>
          <Section
            title="Lead Generation Leaderboard"
            subtitle="Best cost per lead, lowest first"
          >
            <CostEfficiencyTable rollup={rollup} />
          </Section>
        </div>

        <Section
          title="Action Type Breakdown"
          subtitle="Aggregated Meta action counts across all campaigns in range"
        >
          <ActionBreakdown actions={actions} />
        </Section>

        <Section
          title="Data Pipeline Health"
          subtitle="Row coverage, date span, and recent Meta API syncs"
        >
          <DataHealth health={health} />
        </Section>

        <Section
          title="Daily Campaign Records"
          subtitle={`${total} rows in range`}
        >
          <CampaignTable campaigns={campaigns} total={total} />
        </Section>
      </main>
    </div>
  );
}
