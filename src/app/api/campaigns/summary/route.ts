import { NextRequest, NextResponse } from "next/server";
import { getDb, buildDateFilter } from "@/lib/db";
import type { CampaignSummary } from "@/types";

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
        COALESCE(SUM(leads), 0)              AS total_leads,
        COALESCE(SUM(purchases), 0)          AS total_purchases,
        CASE WHEN COALESCE(SUM(impressions),0) > 0
          THEN ROUND((COALESCE(SUM(clicks),0) / SUM(impressions)) * 100, 2)
          ELSE 0 END                         AS overall_ctr,
        CASE WHEN COALESCE(SUM(clicks),0) > 0
          THEN ROUND(SUM(spend) / SUM(clicks), 2)
          ELSE 0 END                         AS avg_cpc,
        CASE WHEN COALESCE(SUM(impressions),0) > 0
          THEN ROUND((SUM(spend) / SUM(impressions)) * 1000, 2)
          ELSE 0 END                         AS avg_cpm,
        CASE WHEN COALESCE(SUM(leads),0) > 0
          THEN ROUND(SUM(spend) / SUM(leads), 2)
          ELSE 0 END                         AS avg_cpl,
        CASE WHEN COUNT(*) > 0
          THEN ROUND(AVG(frequency), 2)
          ELSE 0 END                         AS avg_frequency,
        COUNT(*)                             AS campaign_count,
        MIN(date_start)                      AS date_range_start,
        MAX(date_stop)                       AS date_range_end
      FROM campaigns
      ${whereClause}
    `);

    const row = stmt.get(...params) as Record<string, unknown>;

    const summary: CampaignSummary = {
      total_spend: Number(row.total_spend) || 0,
      total_impressions: Number(row.total_impressions) || 0,
      total_reach: Number(row.total_reach) || 0,
      total_clicks: Number(row.total_clicks) || 0,
      total_leads: Number(row.total_leads) || 0,
      total_purchases: Number(row.total_purchases) || 0,
      overall_ctr: Number(row.overall_ctr) || 0,
      avg_cpc: Number(row.avg_cpc) || 0,
      avg_cpm: Number(row.avg_cpm) || 0,
      avg_cpl: Number(row.avg_cpl) || 0,
      avg_frequency: Number(row.avg_frequency) || 0,
      campaign_count: Number(row.campaign_count) || 0,
      date_range_start: (row.date_range_start as string) || null,
      date_range_end: (row.date_range_end as string) || null,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Summary API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}
