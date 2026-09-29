import { NextRequest, NextResponse } from "next/server";
import { getDb, buildDateFilter, toNum, safeDivide } from "@/lib/db";
import type { FunnelData } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const { whereClause, params } = buildDateFilter(searchParams);

    const db = getDb();

    // link_clicks is NULL for every row in the current dataset, so the
    // effective link-click count falls back to inline_link_clicks.
    const stmt = db.prepare(`
      SELECT
        COALESCE(SUM(impressions), 0)        AS impressions,
        COALESCE(SUM(reach), 0)              AS reach,
        COALESCE(SUM(clicks), 0)             AS clicks,
        CASE WHEN COALESCE(SUM(COALESCE(link_clicks, 0)), 0) > 0
          THEN SUM(COALESCE(link_clicks, 0))
          ELSE COALESCE(SUM(COALESCE(inline_link_clicks, 0)), 0)
        END                                  AS link_clicks,
        COALESCE(SUM(landing_page_views), 0) AS landing_page_views,
        COALESCE(SUM(leads), 0)              AS leads,
        COALESCE(SUM(purchases), 0)          AS purchases,
        COALESCE(SUM(post_engagement_calculated), 0) AS post_engagement
      FROM campaigns
      ${whereClause}
    `);

    const row = stmt.get(...params) as Record<string, unknown>;

    const clicks = toNum(row.clicks);
    const lpv = toNum(row.landing_page_views);
    const leads = toNum(row.leads);
    const purchases = toNum(row.purchases);

    const funnel: FunnelData = {
      impressions: toNum(row.impressions),
      reach: toNum(row.reach),
      clicks,
      link_clicks: toNum(row.link_clicks),
      landing_page_views: lpv,
      leads,
      purchases,
      post_engagement: toNum(row.post_engagement),
    };

    return NextResponse.json({
      funnel,
      rates: {
        impression_to_click: round(safeDivide(clicks, funnel.impressions) * 100),
        click_to_lpv: round(safeDivide(lpv, clicks) * 100),
        lpv_to_lead: round(safeDivide(leads, lpv) * 100),
        lead_to_purchase: round(safeDivide(purchases, leads) * 100),
        click_to_lead: round(safeDivide(leads, clicks) * 100),
        click_to_purchase: round(safeDivide(purchases, clicks) * 100),
      },
    });
  } catch (error) {
    console.error("Funnel API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch funnel" },
      { status: 500 }
    );
  }
}

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
