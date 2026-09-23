import { NextRequest, NextResponse } from "next/server";
import { getDb, buildDateFilter } from "@/lib/db";
import type { Campaign, CampaignsResponse } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const { whereClause, params } = buildDateFilter(searchParams);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("page_size") || "20", 10))
    );
    const offset = (page - 1) * pageSize;

    const sortBy =
      searchParams.get("sort_by") || "spend";
    const order =
      searchParams.get("order")?.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const allowedSortColumns = [
      "spend",
      "impressions",
      "reach",
      "clicks",
      "leads",
      "purchases",
      "ctr",
      "cpc",
      "cpm",
      "cost_per_lead",
      "cost_per_purchase",
      "date_start",
      "date_stop",
      "campaign_name",
    ];

    const safeSort = allowedSortColumns.includes(sortBy) ? sortBy : "spend";

    const db = getDb();

    const countStmt = db.prepare(`
      SELECT COUNT(*) as total
      FROM campaigns
      ${whereClause}
    `);
    const totalRow = countStmt.get(...params) as { total: number };
    const total = totalRow.total || 0;

    const dataStmt = db.prepare(`
      SELECT * FROM campaigns
      ${whereClause}
      ORDER BY ${safeSort} ${order}
      LIMIT ? OFFSET ?
    `);
    const campaigns = dataStmt.all(...params, pageSize, offset) as unknown as Campaign[];

    const response: CampaignsResponse = {
      campaigns,
      total,
      page,
      pageSize,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Campaigns API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}
