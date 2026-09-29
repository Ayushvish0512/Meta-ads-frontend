import { NextRequest, NextResponse } from "next/server";
import { getDb, buildDateFilter, toNum, safeDivide } from "@/lib/db";
import type { CampaignRollup, RollupResponse } from "@/types";

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
        campaign_id,
        COALESCE(MAX(campaign_name), campaign_id) AS campaign_name,
        COUNT(*)                                 AS days,
        MIN(date_start)                          AS first_date,
        MAX(date_stop)                           AS last_date,
        COALESCE(SUM(spend), 0)                  AS spend,
        COALESCE(SUM(impressions), 0)            AS impressions,
        COALESCE(SUM(reach), 0)                  AS reach,
        COALESCE(SUM(clicks), 0)                 AS clicks,
        COALESCE(SUM(unique_clicks), 0)          AS unique_clicks,
        COALESCE(SUM(inline_link_clicks), 0)     AS inline_link_clicks,
        COALESCE(SUM(leads), 0)                  AS leads,
        COALESCE(SUM(purchases), 0)              AS purchases,
        COALESCE(SUM(landing_page_views), 0)     AS landing_page_views,
        COALESCE(SUM(video_views), 0)            AS video_views,
        COALESCE(SUM(post_engagement_calculated), 0) AS post_engagement,
        COALESCE(SUM(messaging_conversations), 0)     AS messaging_conversations
      FROM campaigns
      ${whereClause}
      GROUP BY campaign_id
      ORDER BY spend DESC
    `);

    const rows = stmt.all(...params) as Record<string, unknown>[];

    const totals = rows.reduce<{ spend: number; leads: number }>(
      (acc, r) => ({
        spend: acc.spend + toNum(r.spend),
        leads: acc.leads + toNum(r.leads),
      }),
      { spend: 0, leads: 0 }
    );

    const rollup: CampaignRollup[] = rows.map((row) => {
      const spend = toNum(row.spend);
      const impressions = toNum(row.impressions);
      const reach = toNum(row.reach);
      const clicks = toNum(row.clicks);
      const uniqueClicks = toNum(row.unique_clicks);
      const leads = toNum(row.leads);
      const purchases = toNum(row.purchases);
      const landingPageViews = toNum(row.landing_page_views);
      const videoViews = toNum(row.video_views);
      const postEngagement = toNum(row.post_engagement);

      return {
        campaign_id: String(row.campaign_id),
        campaign_name: String(row.campaign_name),
        days: toNum(row.days),
        first_date: String(row.first_date ?? ""),
        last_date: String(row.last_date ?? ""),
        spend: round(spend),
        impressions,
        reach,
        clicks,
        unique_clicks: uniqueClicks,
        inline_link_clicks: toNum(row.inline_link_clicks),
        ctr: pct(safeDivide(clicks, impressions)),
        unique_ctr: pct(safeDivide(uniqueClicks, impressions)),
        cpc: round(safeDivide(spend, clicks)),
        cpm: round(safeDivide(spend, impressions) * 1000),
        cpp: round(safeDivide(spend, uniqueClicks)),
        frequency: round(safeDivide(impressions, reach)),
        leads,
        cost_per_lead: round(safeDivide(spend, leads)),
        lead_conversion_rate: pct(safeDivide(leads, clicks)),
        purchases,
        cost_per_purchase: round(safeDivide(spend, purchases)),
        purchase_conversion_rate: pct(safeDivide(purchases, clicks)),
        landing_page_views: landingPageViews,
        click_to_landing_page_rate: pct(safeDivide(landingPageViews, clicks)),
        video_views: videoViews,
        video_through_rate: pct(safeDivide(videoViews, impressions)),
        post_engagement: postEngagement,
        messaging_conversations: toNum(row.messaging_conversations),
        spend_share: pct(safeDivide(spend, totals.spend)),
        lead_share: pct(safeDivide(leads, totals.leads)),
      };
    });

    const response: RollupResponse = { rollup, total: rollup.length };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Rollup API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign rollup" },
      { status: 500 }
    );
  }
}
