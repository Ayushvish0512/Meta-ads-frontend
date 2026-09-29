"use client";

import Header from "@/components/Header";
import KPIGrid from "@/components/KPIGrid";
import SpendVsResultsChart from "@/components/SpendVsResultsChart";
import CostEfficiencyMatrix, {
  CostEfficiencyTable,
} from "@/components/CostEfficiencyMatrix";
import FunnelChart from "@/components/FunnelChart";
import ActionBreakdown from "@/components/ActionBreakdown";
import CampaignTable from "@/components/CampaignTable";
import DateRangePicker from "@/components/DateRangePicker";
import DailyTrendsChart from "@/components/DailyTrendsChart";
import EngagementAnalytics from "@/components/EngagementAnalytics";
import RevenueAnalytics from "@/components/RevenueAnalytics";
import DataHealth from "@/components/DataHealth";
import CampaignShareChart from "@/components/CampaignShareChart";
import { Section } from "@/components/Section";
import { useDashboardData } from "@/hooks/useDashboardData";
import { fetchAndExportCSV } from "@/lib/csv-export";

export default function DashboardPage() {
  const {
    data,
    dateRange,
    loading,
    error,
    fatal,
    setDateRange,
    refresh,
  } = useDashboardData();

  if (fatal) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error: {fatal}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const bootstrapping = dateRange === null;

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <Header
        summary={data.summary}
        dateRange={dateRange ?? { start: null, end: null, label: "Loading…" }}
        onExport={() => {
          if (dateRange) {
            void fetchAndExportCSV(dateRange.start, dateRange.end);
          }
        }}
        onRefresh={refresh}
      />

      <main className="p-4 sm:p-6 space-y-6 max-w-[1800px] mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Performance Overview
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {data.summary
                ? `${data.summary.row_count} daily records · ${data.summary.campaign_count} campaigns · ${data.summary.date_range_start} to ${data.summary.date_range_end}`
                : "Loading headline metrics…"}
            </p>
          </div>
          {bootstrapping ? (
            <div className="h-9 w-32 bg-zinc-800 rounded-lg animate-pulse" />
          ) : (
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              maxDate={data.health?.dataset_last_date ?? null}
              minDate={data.health?.dataset_first_date ?? null}
            />
          )}
        </div>

        {error && (
          <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-300">
            {error}
          </div>
        )}

        <KPIGrid summary={data.summary} />

        <Section
          title="Spend vs Results by Campaign"
          subtitle={
            data.rollup.length > 0
              ? `Aggregated across ${data.rollup.length} campaigns in range`
              : "Aggregated across campaigns in range"
          }
        >
          <SpendVsResultsChart
            rollup={data.rollup}
            loading={loading.has("rollup")}
          />
        </Section>

        <Section
          title="Daily Performance Trends"
          subtitle="Switch views to compare spend, results, efficiency, and cumulative burn"
        >
          <DailyTrendsChart trends={data.trends} loading={loading.has("trends")} />
        </Section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <Section
              title="Conversion Funnel"
              subtitle="Stage-to-stage drop-off with blended rates"
            >
              <FunnelChart
                funnel={data.funnel}
                rates={data.funnelRates}
                loading={loading.has("funnel")}
              />
            </Section>
          </div>
          <div className="xl:col-span-1">
            <Section title="Spend Concentration" subtitle="Where the budget is going">
              <CampaignShareChart
                rollup={data.rollup}
                loading={loading.has("rollup")}
              />
            </Section>
          </div>
        </div>

        <Section
          title="Engagement Analytics"
          subtitle="Video, post engagement, landing pages, and messaging efficiency"
        >
          <EngagementAnalytics
            engagement={data.engagement}
            loading={loading.has("engagement")}
          />
        </Section>

        <Section
          title="Revenue & ROAS"
          subtitle="Attributed conversion value from Meta action values"
        >
          <RevenueAnalytics
            revenue={data.revenue}
            loading={loading.has("revenue")}
          />
        </Section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Section
            title="Cost Efficiency Matrix"
            subtitle="Ranked campaigns by cost efficiency (green = best)"
          >
            <CostEfficiencyMatrix
              rollup={data.rollup}
              loading={loading.has("rollup")}
            />
          </Section>
          <Section
            title="Lead Generation Leaderboard"
            subtitle="Best cost per lead, lowest first"
          >
            <CostEfficiencyTable
              rollup={data.rollup}
              loading={loading.has("rollup")}
            />
          </Section>
        </div>

        <Section
          title="Action Type Breakdown"
          subtitle="Aggregated Meta action counts across all campaigns in range"
        >
          <ActionBreakdown actions={data.actions} loading={loading.has("actions")} />
        </Section>

        <Section
          title="Data Pipeline Health"
          subtitle="Row coverage, date span, and recent Meta API syncs"
        >
          <DataHealth health={data.health} loading={loading.has("health")} />
        </Section>

        <Section
          title="Daily Campaign Records"
          subtitle={
            data.total > 0 ? `${data.total} rows in range` : "Rows in range"
          }
        >
          <CampaignTable
            campaigns={data.campaigns}
            total={data.total}
            loading={loading.has("campaigns")}
          />
        </Section>
      </main>
    </div>
  );
}
