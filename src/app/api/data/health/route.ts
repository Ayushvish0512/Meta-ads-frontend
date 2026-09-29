import { NextRequest, NextResponse } from "next/server";
import { getDb, buildDateFilter, toNum } from "@/lib/db";
import type { DataHealthResponse, SyncRun } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const { whereClause, params } = buildDateFilter(searchParams);

    const db = getDb();

    const statsStmt = db.prepare(`
      SELECT
        COUNT(*)                   AS total_rows,
        COUNT(DISTINCT campaign_id) AS campaign_count,
        MIN(date_start)            AS first_date,
        MAX(date_stop)             AS last_date,
        COUNT(DISTINCT date_stop)   AS distinct_dates
      FROM campaigns
      ${whereClause}
    `);
    const stats = statsStmt.get(...params) as Record<string, unknown>;

    // Unfiltered bounds: the date picker anchors its presets to these so
    // "last 7 days" means the last 7 days that actually contain data.
    const boundsStmt = db.prepare(`
      SELECT MIN(date_start) AS first_date, MAX(date_stop) AS last_date
      FROM campaigns
    `);
    const bounds = boundsStmt.get() as Record<string, unknown>;

    let rawInsightsRows = 0;
    try {
      const rawStmt = db.prepare("SELECT COUNT(*) AS c FROM raw_insights");
      rawInsightsRows = toNum((rawStmt.get() as { c: number }).c);
    } catch {
      rawInsightsRows = 0;
    }

    let syncs: SyncRun[] = [];
    try {
      const syncStmt = db.prepare(`
        SELECT id, started_at, completed_at, mode, since, until,
               records_received, records_saved, status, error
        FROM sync_log
        ORDER BY started_at DESC
        LIMIT 10
      `);
      syncs = syncStmt.all() as unknown as SyncRun[];
    } catch {
      syncs = [];
    }

    const lastSync = syncs[0] ?? null;
    let freshnessHours: number | null = null;
    if (lastSync?.started_at) {
      const started = new Date(lastSync.started_at.replace(" ", "T"));
      if (!isNaN(started.getTime())) {
        freshnessHours =
          (Date.now() - started.getTime()) / (1000 * 60 * 60);
      }
    }

    const response: DataHealthResponse = {
      total_rows: toNum(stats.total_rows),
      campaign_count: toNum(stats.campaign_count),
      raw_insights_rows: rawInsightsRows,
      first_date: (stats.first_date as string) || null,
      last_date: (stats.last_date as string) || null,
      dataset_first_date: (bounds.first_date as string) || null,
      dataset_last_date: (bounds.last_date as string) || null,
      distinct_dates: toNum(stats.distinct_dates),
      last_sync: lastSync,
      recent_syncs: syncs,
      data_freshness_hours: freshnessHours,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Data health API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data health" },
      { status: 500 }
    );
  }
}
