import { NextRequest, NextResponse } from "next/server";
import { getDb, buildDateFilter, toNum, safeDivide } from "@/lib/db";
import type { CampaignEngagement, EngagementBucket, EngagementResponse } from "@/types";

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
        COALESCE(SUM(spend), 0)      AS spend,
        COALESCE(SUM(impressions), 0) AS impressions,
        COALESCE(SUM(video_views), 0) AS video_views,
        COALESCE(SUM(post_engagement_calculated), 0) AS post_engagement,
        COALESCE(SUM(landing_page_views), 0) AS landing_page_views,
        COALESCE(SUM(messaging_conversations), 0) AS messaging_conversations,
        COALESCE(SUM(messaging_replies), 0) AS messaging_replies
      FROM campaigns
      ${whereClause}
      GROUP BY campaign_id
      ORDER BY spend DESC
    `);

    const rows = stmt.all(...params) as Record<string, unknown>[];

    const byCampaign: CampaignEngagement[] = rows.map((row) => {
      const spend = toNum(row.spend);
      const impressions = toNum(row.impressions);
      const videoViews = toNum(row.video_views);
      const postEngagement = toNum(row.post_engagement);
      const messagingConversations = toNum(row.messaging_conversations);
      const messagingReplies = toNum(row.messaging_replies);
      const totalEngagement = postEngagement + videoViews;

      return {
        campaign_id: String(row.campaign_id),
        campaign_name: String(row.campaign_name),
        spend: round(spend),
        impressions,
        video_views: videoViews,
        post_engagement: postEngagement,
        landing_page_views: toNum(row.landing_page_views),
        messaging_conversations: messagingConversations,
        messaging_replies: messagingReplies,
        video_view_rate: pct(safeDivide(videoViews, impressions)),
        engagement_rate: pct(safeDivide(totalEngagement, impressions)),
        cost_per_engagement: round(safeDivide(spend, totalEngagement)),
        cost_per_messaging_conversation: round(
          safeDivide(spend, messagingConversations)
        ),
        engagement_per_rupee: round(safeDivide(totalEngagement, spend), 4),
      };
    });

    const totals = byCampaign.reduce(
      (acc, c) => ({
        spend: acc.spend + c.spend,
        impressions: acc.impressions + c.impressions,
        video_views: acc.video_views + c.video_views,
        post_engagement: acc.post_engagement + c.post_engagement,
        landing_page_views: acc.landing_page_views + c.landing_page_views,
        messaging_conversations:
          acc.messaging_conversations + c.messaging_conversations,
        messaging_replies: acc.messaging_replies + c.messaging_replies,
      }),
      {
        spend: 0,
        impressions: 0,
        video_views: 0,
        post_engagement: 0,
        landing_page_views: 0,
        messaging_conversations: 0,
        messaging_replies: 0,
      }
    );

    const totalEngagement = totals.video_views + totals.post_engagement;

    const bucketDefs: { label: string; value: number }[] = [
      { label: "Video Views", value: totals.video_views },
      { label: "Post Engagement", value: totals.post_engagement },
      { label: "Landing Page Views", value: totals.landing_page_views },
      { label: "Messaging Conversations", value: totals.messaging_conversations },
    ];

    const bucketTotal =
      bucketDefs.reduce((sum, b) => sum + b.value, 0) || 1;

    const buckets: EngagementBucket[] = bucketDefs.map((b) => ({
      label: b.label,
      value: b.value,
      cost: round(safeDivide(totals.spend, b.value)),
      share: pct(safeDivide(b.value, bucketTotal)),
    }));

    const response: EngagementResponse = {
      totals: {
        spend: round(totals.spend),
        impressions: totals.impressions,
        video_views: totals.video_views,
        post_engagement: totals.post_engagement,
        landing_page_views: totals.landing_page_views,
        messaging_conversations: totals.messaging_conversations,
        messaging_replies: totals.messaging_replies,
        video_view_rate: pct(safeDivide(totals.video_views, totals.impressions)),
        engagement_rate: pct(safeDivide(totalEngagement, totals.impressions)),
        cost_per_engagement: round(safeDivide(totals.spend, totalEngagement)),
        cost_per_video_view: round(safeDivide(totals.spend, totals.video_views)),
      },
      buckets,
      by_campaign: byCampaign,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Engagement API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch engagement data" },
      { status: 500 }
    );
  }
}
