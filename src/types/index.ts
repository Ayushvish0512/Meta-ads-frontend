export interface Campaign {
  campaign_id: string;
  campaign_name: string | null;
  date_start: string;
  date_stop: string;
  spend: number | null;
  impressions: number | null;
  reach: number | null;
  frequency: number | null;
  clicks: number | null;
  link_clicks: number | null;
  ctr: number | null;
  cpc: number | null;
  cpm: number | null;
  leads: number | null;
  cost_per_lead: number | null;
  lead_conversion_rate: number | null;
  purchases: number | null;
  cost_per_purchase: number | null;
  purchase_conversion_rate: number | null;
  landing_page_views: number | null;
  click_to_landing_page_rate: number | null;
  messaging_conversations: number | null;
  messaging_replies: number | null;
  cost_per_messaging_conversation: number | null;
  video_views: number | null;
  post_engagement: number | null;
  actions: string | null;
  unique_clicks: number | null;
  unique_actions: number | null;
  unique_ctr: number | null;
  cpp: number | null;
  cost_per_unique_click: number | null;
  inline_link_clicks: number | null;
  outbound_clicks: number | null;
  landing_page_view: number | null;
  cost_per_landing_page_view: number | null;
  cost_per_inline_link_click: number | null;
  cost_per_outbound_click: number | null;
  action_values: string | null;
  purchase_roas: number | null;
  conversions: number | null;
  cost_per_conversion: number | null;
  unique_conversions: number | null;
  cost_per_unique_conversion: number | null;
  video_p25_watched_actions: number | null;
  video_p50_watched_actions: number | null;
  video_p75_watched_actions: number | null;
  video_p100_watched_actions: number | null;
  page_engagement: number | null;
  quality_ranking: string | null;
  post_engagement_calculated: number | null;
  metric_sources: string | null;
}

export interface CampaignSummary {
  total_spend: number;
  total_impressions: number;
  total_reach: number;
  total_clicks: number;
  total_leads: number;
  total_purchases: number;
  overall_ctr: number;
  unique_ctr: number;
  avg_cpc: number;
  avg_cpm: number;
  avg_cpl: number;
  avg_cpp: number;
  avg_frequency: number;
  total_inline_link_clicks: number;
  total_unique_clicks: number;
  total_landing_page_views: number;
  total_video_views: number;
  total_post_engagement: number;
  total_messaging_conversations: number;
  lead_conversion_rate: number;
  purchase_conversion_rate: number;
  click_to_landing_page_rate: number;
  cost_per_purchase: number;
  avg_days_active: number;
  campaign_count: number;
  row_count: number;
  date_range_start: string | null;
  date_range_end: string | null;
}

export interface CampaignRollup {
  campaign_id: string;
  campaign_name: string;
  days: number;
  first_date: string;
  last_date: string;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  unique_clicks: number;
  inline_link_clicks: number;
  ctr: number;
  unique_ctr: number;
  cpc: number;
  cpm: number;
  cpp: number;
  frequency: number;
  leads: number;
  cost_per_lead: number;
  lead_conversion_rate: number;
  purchases: number;
  cost_per_purchase: number;
  purchase_conversion_rate: number;
  landing_page_views: number;
  click_to_landing_page_rate: number;
  video_views: number;
  video_through_rate: number;
  post_engagement: number;
  messaging_conversations: number;
  spend_share: number;
  lead_share: number;
}

export interface TrendPoint {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  unique_clicks: number;
  leads: number;
  purchases: number;
  conversions: number;
  landing_page_views: number;
  video_views: number;
  post_engagement: number;
  messaging_conversations: number;
  ctr: number;
  cpc: number;
  cpl: number;
  active_campaigns: number;
  cumulative_spend: number;
}

export interface FunnelData {
  impressions: number;
  reach: number;
  clicks: number;
  link_clicks: number;
  landing_page_views: number;
  leads: number;
  purchases: number;
  post_engagement: number;
}

export interface ActionAggregation {
  action_type: string;
  value: number;
}

export interface ValueAggregation {
  action_type: string;
  value: number;
  occurrences: number;
  spend: number;
  roas: number;
}

export interface RevenueRow {
  campaign_id: string;
  campaign_name: string;
  spend: number;
  purchases: number;
  revenue: number;
  roas: number;
  cost_per_purchase: number;
  days_with_revenue: number;
}

export interface RevenueSummary {
  total_spend: number;
  total_revenue: number;
  total_purchases: number;
  blended_roas: number;
  cost_per_purchase: number;
  revenue_coverage_pct: number;
  rows_with_revenue: number;
  total_rows: number;
  by_action_type: ValueAggregation[];
  by_campaign: RevenueRow[];
}

export interface EngagementBucket {
  label: string;
  value: number;
  cost: number;
  share: number;
}

export interface CampaignEngagement {
  campaign_id: string;
  campaign_name: string;
  spend: number;
  impressions: number;
  video_views: number;
  post_engagement: number;
  landing_page_views: number;
  messaging_conversations: number;
  messaging_replies: number;
  video_view_rate: number;
  engagement_rate: number;
  cost_per_engagement: number;
  cost_per_messaging_conversation: number;
  engagement_per_rupee: number;
}

export interface EngagementResponse {
  totals: {
    spend: number;
    impressions: number;
    video_views: number;
    post_engagement: number;
    landing_page_views: number;
    messaging_conversations: number;
    messaging_replies: number;
    video_view_rate: number;
    engagement_rate: number;
    cost_per_engagement: number;
    cost_per_video_view: number;
  };
  buckets: EngagementBucket[];
  by_campaign: CampaignEngagement[];
}

export interface SyncRun {
  id: number;
  started_at: string;
  completed_at: string | null;
  mode: string;
  since: string | null;
  until: string | null;
  records_received: number;
  records_saved: number;
  status: string;
  error: string | null;
}

export interface DataHealthResponse {
  total_rows: number;
  campaign_count: number;
  raw_insights_rows: number;
  first_date: string | null;
  last_date: string | null;
  distinct_dates: number;
  last_sync: SyncRun | null;
  recent_syncs: SyncRun[];
  data_freshness_hours: number | null;
}

export interface CampaignSummaryResponse {
  summary: CampaignSummary;
}

export interface CampaignsResponse {
  campaigns: Campaign[];
  total: number;
  page: number;
  pageSize: number;
}

export interface RollupResponse {
  rollup: CampaignRollup[];
  total: number;
}

export interface ActionsResponse {
  actions: ActionAggregation[];
  total_action_types: number;
  top_n: number;
}

export interface TrendsResponse {
  trends: TrendPoint[];
}
