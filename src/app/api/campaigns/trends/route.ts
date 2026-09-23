import { NextRequest, NextResponse } from "next/server";
import { getDb, buildDateFilter } from "@/lib/db";
import type { TrendPoint } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const { whereClause, params } = buildDateFilter(searchParams);

    const db = getDb();

    const stmt = db.prepare(`
      SELECT
        date_stop                                    AS date,
        COALESCE(SUM(spend), 0)                      AS spend,
        COALESCE(SUM(impressions), 0)                AS impressions,
        COALESCE(SUM(clicks), 0)                     AS clicks,
        COALESCE(SUM(leads), 0)                      AS leads,
        COALESCE(SUM(purchases), 0)                  AS purchases,
        COALESCE(SUM(landing_page_views), 0)         AS landing_page_views,
        COALESCE(SUM(video_views), 0)                AS video_views,
        COALESCE(SUM(post_engagement), 0)           AS post_engagement,
        COALESCE(SUM(messaging_conversations), 0)     AS messaging_conversations
      FROM campaigns
      ${whereClause}
      GROUP BY date_stop
      ORDER BY date_stop ASC
    `);

    const rows = stmt.all(...params) as Record<string, unknown>[];

    const trends: TrendPoint[] = rows.map((row) => ({
      date: (row.date as string) || "",
      spend: Number(row.spend) || 0,
      impressions: Number(row.impressions) || 0,
      clicks: Number(row.clicks) || 0,
      leads: Number(row.leads) || 0,
      purchases: Number(row.purchases) || 0,
    }));

    return NextResponse.json({ trends });
  } catch (error) {
    console.error("Trends API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trends" },
      { status: 500 }
    );
  }
}
