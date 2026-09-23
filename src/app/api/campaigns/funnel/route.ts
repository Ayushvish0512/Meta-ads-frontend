import { NextRequest, NextResponse } from "next/server";
import { getDb, buildDateFilter } from "@/lib/db";
import type { FunnelData } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const { whereClause, params } = buildDateFilter(searchParams);

    const db = getDb();

    const stmt = db.prepare(`
      SELECT
        COALESCE(SUM(impressions), 0)        AS impressions,
        COALESCE(SUM(clicks), 0)             AS clicks,
        COALESCE(SUM(link_clicks), 0)        AS link_clicks,
        COALESCE(SUM(landing_page_views), 0) AS landing_page_views,
        COALESCE(SUM(leads), 0)              AS leads,
        COALESCE(SUM(purchases), 0)          AS purchases
      FROM campaigns
      ${whereClause}
    `);

    const row = stmt.get(...params) as Record<string, unknown>;

    const funnel: FunnelData = {
      impressions: Number(row.impressions) || 0,
      link_clicks: Number(row.link_clicks) || 0,
      landing_page_views: Number(row.landing_page_views) || 0,
      leads: Number(row.leads) || 0,
      purchases: Number(row.purchases) || 0,
    };

    return NextResponse.json({ funnel });
  } catch (error) {
    console.error("Funnel API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch funnel" },
      { status: 500 }
    );
  }
}
