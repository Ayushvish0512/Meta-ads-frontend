import { NextRequest, NextResponse } from "next/server";
import { getDb, buildDateFilter } from "@/lib/db";
import type { ActionAggregation, ActionsResponse } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const { whereClause, params } = buildDateFilter(searchParams);

    const topN = Math.max(
      1,
      Math.min(30, parseInt(searchParams.get("top_n") || "15", 10))
    );

    const db = getDb();

    const stmt = db.prepare(`
      SELECT actions FROM campaigns
      ${whereClause}
    `);

    const rows = stmt.all(...params) as { actions: string | null }[];

    const agg: Record<string, number> = {};

    for (const row of rows) {
      if (!row.actions) continue;
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(row.actions) as Record<string, unknown>;
      } catch {
        continue;
      }
      for (const [key, value] of Object.entries(parsed)) {
        const numVal = Number(value);
        if (!isNaN(numVal)) {
          agg[key] = (agg[key] || 0) + numVal;
        }
      }
    }

    const actions: ActionAggregation[] = Object.entries(agg)
      .map(([action_type, value]) => ({ action_type, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, topN);

    const response: ActionsResponse = {
      actions,
      total_action_types: Object.keys(agg).length,
      top_n: topN,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Actions API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch actions" },
      { status: 500 }
    );
  }
}
