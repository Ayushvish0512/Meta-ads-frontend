import { NextRequest, NextResponse } from "next/server";
import { getDb, buildDateFilter, toNum, safeDivide, parseJsonObject } from "@/lib/db";
import type { RevenueRow, RevenueSummary, ValueAggregation } from "@/types";

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
        campaign_id,
        COALESCE(MAX(campaign_name), campaign_id) AS campaign_name,
        COALESCE(SUM(spend), 0)     AS spend,
        COALESCE(SUM(purchases), 0) AS purchases,
        action_values
      FROM campaigns
      ${whereClause}
      GROUP BY campaign_id
      ORDER BY spend DESC
    `);

    const rows = stmt.all(...params) as Record<string, unknown>[];

    const actionTotals = new Map<string, { value: number; occurrences: number }>();
    const campaignMap = new Map<
      string,
      { spend: number; purchases: number; revenue: number; daysWithRevenue: number }
    >();

    let totalSpend = 0;
    let totalPurchases = 0;
    let totalRevenue = 0;
    let rowsWithRevenue = 0;
    let totalRows = 0;

    const countStmt = db.prepare(`SELECT COUNT(*) AS c FROM campaigns ${whereClause}`);
    totalRows = toNum((countStmt.get(...params) as { c: number }).c);

    const rowStmt = db.prepare(`
      SELECT campaign_id, spend, purchases, action_values FROM campaigns ${whereClause}
    `);
    const detailRows = rowStmt.all(...params) as Record<string, unknown>[];

    for (const row of detailRows) {
      const campaignId = String(row.campaign_id);
      const spend = toNum(row.spend);
      const purchases = toNum(row.purchases);
      const values = parseJsonObject(
        (row.action_values as string | null) ?? null
      );

      const hasRevenue = Object.keys(values).length > 0;
      if (hasRevenue) rowsWithRevenue += 1;

      if (!campaignMap.has(campaignId)) {
        campaignMap.set(campaignId, {
          spend: 0,
          purchases: 0,
          revenue: 0,
          daysWithRevenue: 0,
        });
      }
      const entry = campaignMap.get(campaignId)!;
      entry.spend += spend;
      entry.purchases += purchases;

      if (hasRevenue) {
        entry.daysWithRevenue += 1;
        for (const [actionType, value] of Object.entries(values)) {
          entry.revenue += value;
          totalRevenue += value;
          const agg = actionTotals.get(actionType) ?? { value: 0, occurrences: 0 };
          agg.value += value;
          agg.occurrences += 1;
          actionTotals.set(actionType, agg);
        }
      }
    }

    for (const row of rows) {
      totalSpend += toNum(row.spend);
      totalPurchases += toNum(row.purchases);
    }

    const byActionType: ValueAggregation[] = Array.from(actionTotals.entries())
      .map(([actionType, agg]) => ({
        action_type: actionType,
        value: round(agg.value),
        occurrences: agg.occurrences,
        spend: 0,
        roas: 0,
      }))
      .sort((a, b) => b.value - a.value);

    const byCampaign: RevenueRow[] = rows.map((row) => {
      const campaignId = String(row.campaign_id);
      const entry = campaignMap.get(campaignId) ?? {
        spend: 0,
        purchases: 0,
        revenue: 0,
        daysWithRevenue: 0,
      };
      return {
        campaign_id: campaignId,
        campaign_name: String(row.campaign_name),
        spend: round(entry.spend),
        purchases: entry.purchases,
        revenue: round(entry.revenue),
        roas: round(safeDivide(entry.revenue, entry.spend)),
        cost_per_purchase: round(safeDivide(entry.spend, entry.purchases)),
        days_with_revenue: entry.daysWithRevenue,
      };
    });

    const summary: RevenueSummary = {
      total_spend: round(totalSpend),
      total_revenue: round(totalRevenue),
      total_purchases: totalPurchases,
      blended_roas: round(safeDivide(totalRevenue, totalSpend)),
      cost_per_purchase: round(safeDivide(totalSpend, totalPurchases)),
      revenue_coverage_pct: round(safeDivide(rowsWithRevenue, totalRows) * 100),
      rows_with_revenue: rowsWithRevenue,
      total_rows: totalRows,
      by_action_type: byActionType,
      by_campaign: byCampaign,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Revenue API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue data" },
      { status: 500 }
    );
  }
}
