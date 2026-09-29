import { NextRequest, NextResponse } from "next/server";
import { getDb, buildDateFilter, toNum, safeDivide } from "@/lib/db";
import type { CampaignSummary } from "@/types";

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function pct(fraction: number): number {
  return round(fraction * 100);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const { whereClause, params } = buildDateFilter(searchParams);

    const db = getDb();

    const stmt = db.prepare(`
      SELECT
        COALESCE(SUM(spend), 0)              AS total_spend,
        COALESCE(SUM(impressions), 0)        AS total_impressions,
        COALESCE(SUM(reach), 0)              AS total_reach,
        COALESCE(SUM(clicks), 0)             AS total_clicks,
        COALESCE(SUM(unique_clicks), 0)      AS total_unique_clicks,
        COALESCE(SUM(inline_link_clicks), 0) AS total_inline_link_clicks,
        COALESCE(SUM(leads), 0)              AS total_leads,
        COALESCE(SUM(purchases), 0)          AS total_purchases,
        COALESCE(SUM(landing_page_views), 0) AS total_landing_page_views,
        COALESCE(SUM(video_views), 0)        AS total_video_views,
        COALESCE(SUM(post_engagement_calculated), 0) AS total_post_engagement,
        COALESCE(SUM(messaging_conversations), 0)     AS total_messaging_conversations
      FROM campaigns
      ${whereClause}
    `);

    const row = stmt.get(...params) as Record<string, unknown>;

    const totalSpend = toNum(row.total_spend);
    const totalImpressions = toNum(row.total_impressions);
    const totalClicks = toNum(row.total_clicks);
    const totalUniqueClicks = toNum(row.total_unique_clicks);
    const totalLeads = toNum(row.total_leads);
    const totalPurchases = toNum(row.total_purchases);
    const totalLpv = toNum(row.total_landing_page_views);

    const metaStmt = db.prepare(`
      SELECT
        COUNT(DISTINCT campaign_id) AS campaign_count,
        COUNT(*)                    AS row_count,
        MIN(date_start)             AS date_range_start,
        MAX(date_stop)              AS date_range_end
      FROM campaigns
      ${whereClause}
    `);
    const meta = metaStmt.get(...params) as Record<string, unknown>;
    const campaignCount = toNum(meta.campaign_count);
    const rowCount = toNum(meta.row_count);

    const summary: CampaignSummary = {
      total_spend: totalSpend,
      total_impressions: totalImpressions,
      total_reach: toNum(row.total_reach),
      total_clicks: totalClicks,
      total_leads: totalLeads,
      total_purchases: totalPurchases,
      overall_ctr: pct(safeDivide(totalClicks, totalImpressions)),
      unique_ctr: pct(safeDivide(totalUniqueClicks, totalImpressions)),
      avg_cpc: round(safeDivide(totalSpend, totalClicks)),
      avg_cpm: round(safeDivide(totalSpend, totalImpressions) * 1000),
      avg_cpl: round(safeDivide(totalSpend, totalLeads)),
      avg_cpp: round(safeDivide(totalSpend, totalUniqueClicks)),
      avg_frequency: 0,
      total_inline_link_clicks: toNum(row.total_inline_link_clicks),
      total_unique_clicks: totalUniqueClicks,
      total_landing_page_views: totalLpv,
      total_video_views: toNum(row.total_video_views),
      total_post_engagement: toNum(row.total_post_engagement),
      total_messaging_conversations: toNum(row.total_messaging_conversations),
      lead_conversion_rate: pct(safeDivide(totalLeads, totalClicks)),
      purchase_conversion_rate: pct(safeDivide(totalPurchases, totalClicks)),
      click_to_landing_page_rate: pct(safeDivide(totalLpv, totalClicks)),
      cost_per_purchase: round(safeDivide(totalSpend, totalPurchases)),
      avg_days_active: round(safeDivide(rowCount, campaignCount), 1),
      campaign_count: campaignCount,
      row_count: rowCount,
      date_range_start: (meta.date_range_start as string) || null,
      date_range_end: (meta.date_range_end as string) || null,
    };

    const freqStmt = db.prepare(`
      SELECT AVG(frequency) AS avg_frequency FROM campaigns ${whereClause}
    `);
    const freqRow = freqStmt.get(...params) as { avg_frequency: number | null };
    summary.avg_frequency = Number(freqRow?.avg_frequency ?? 0);

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Summary API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}
