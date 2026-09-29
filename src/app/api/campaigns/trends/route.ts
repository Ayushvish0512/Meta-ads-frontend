import { NextRequest, NextResponse } from "next/server";
import { getDb, buildDateFilter, toNum, safeDivide } from "@/lib/db";
import type { TrendPoint } from "@/types";

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const { whereClause, params } = buildDateFilter(searchParams);

    const db = getDb();

    const stmt = db.prepare(`
      SELECT
        date_stop                                 AS date,
        COALESCE(SUM(spend), 0)                   AS spend,
        COALESCE(SUM(impressions), 0)             AS impressions,
        COALESCE(SUM(clicks), 0)                  AS clicks,
        COALESCE(SUM(unique_clicks), 0)           AS unique_clicks,
        COALESCE(SUM(leads), 0)                   AS leads,
        COALESCE(SUM(purchases), 0)               AS purchases,
        COALESCE(SUM(landing_page_views), 0)      AS landing_page_views,
        COALESCE(SUM(video_views), 0)             AS video_views,
        COALESCE(SUM(post_engagement_calculated), 0) AS post_engagement,
        COALESCE(SUM(messaging_conversations), 0)     AS messaging_conversations,
        COUNT(DISTINCT campaign_id)               AS active_campaigns
      FROM campaigns
      ${whereClause}
      GROUP BY date_stop
      ORDER BY date_stop ASC
    `);

    const rows = stmt.all(...params) as Record<string, unknown>[];

    let cumulativeSpend = 0;

    const trends: TrendPoint[] = rows.map((row) => {
      const spend = toNum(row.spend);
      const impressions = toNum(row.impressions);
      const clicks = toNum(row.clicks);
      const leads = toNum(row.leads);
      cumulativeSpend += spend;

      return {
        date: (row.date as string) || "",
        spend: round(spend),
        impressions,
        clicks,
        unique_clicks: toNum(row.unique_clicks),
        leads,
        purchases: toNum(row.purchases),
        conversions: toNum(row.purchases),
        landing_page_views: toNum(row.landing_page_views),
        video_views: toNum(row.video_views),
        post_engagement: toNum(row.post_engagement),
        messaging_conversations: toNum(row.messaging_conversations),
        ctr: round(safeDivide(clicks, impressions) * 100),
        cpc: round(safeDivide(spend, clicks)),
        cpl: round(safeDivide(spend, leads)),
        active_campaigns: toNum(row.active_campaigns),
        cumulative_spend: round(cumulativeSpend),
      };
    });

    return NextResponse.json({ trends });
  } catch (error) {
    console.error("Trends API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trends" },
      { status: 500 }
    );
  }
}
