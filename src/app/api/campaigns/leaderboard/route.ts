import { NextRequest, NextResponse } from "next/server";
import { getDb, buildDateFilter } from "@/lib/db";
import type { LeaderboardEntry, LeaderboardResponse } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const { whereClause, params } = buildDateFilter(searchParams);

    const db = getDb();

    const stmt = db.prepare(`
      SELECT
        campaign_id,
        campaign_name,
        spend,
        impressions,
        reach,
        clicks,
        link_clicks,
        ctr,
        cpc,
        cpm,
        leads,
        cost_per_lead,
        lead_conversion_rate,
        purchases,
        cost_per_purchase,
        purchase_conversion_rate,
        landing_page_views,
        click_to_landing_page_rate,
        messaging_conversations,
        messaging_replies,
        cost_per_messaging_conversation,
        video_views,
        post_engagement,
        CASE WHEN COALESCE(clicks, 0) > 0
          THEN ROUND((clicks * 1.0 / impressions) * 100, 2)
          ELSE 0 END                                     AS roi_proxy,
        CASE WHEN COALESCE(spend, 0) > 0 AND COALESCE(purchases, 0) > 0
          THEN ROUND(spend / purchases, 2)
          ELSE NULL END                                 AS roas
      FROM campaigns
      ${whereClause}
      ORDER BY spend DESC
      LIMIT 50
    `);

    const rows = stmt.all(...params) as Record<string, unknown>[];

    const entries: LeaderboardEntry[] = rows.map((row) => ({
      campaign_id: String(row.campaign_id),
      campaign_name: (row.campaign_name as string) || null,
      spend: Number(row.spend) || null,
      impressions: Number(row.impressions) || null,
      reach: Number(row.reach) || null,
      clicks: Number(row.clicks) || null,
      leads: Number(row.leads) || null,
      purchases: Number(row.purchases) || null,
      ctr: Number(row.ctr) || null,
      cpc: Number(row.cpc) || null,
      cpm: Number(row.cpm) || null,
      cost_per_lead: Number(row.cost_per_lead) || null,
      lead_conversion_rate: Number(row.lead_conversion_rate) || null,
      purchase_conversion_rate: Number(row.purchase_conversion_rate) || null,
      roas: row.roas ? Number(row.roas) : null,
    }));

    const response: LeaderboardResponse = {
      entries,
      total: entries.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Leaderboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
