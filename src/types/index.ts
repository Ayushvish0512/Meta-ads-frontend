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
}

export interface CampaignSummary {
  total_spend: number;
  total_impressions: number;
  total_reach: number;
  total_clicks: number;
  total_leads: number;
  total_purchases: number;
  overall_ctr: number;
  avg_cpc: number;
  avg_cpm: number;
  avg_cpl: number;
  avg_frequency: number;
  campaign_count: number;
  date_range_start: string | null;
  date_range_end: string | null;
}

export interface TrendPoint {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  purchases: number;
}

export interface FunnelData {
  impressions: number;
  link_clicks: number;
  landing_page_views: number;
  leads: number;
  purchases: number;
}

export interface ActionAggregation {
  action_type: string;
  value: number;
}

export interface LeaderboardEntry {
  campaign_id: string;
  campaign_name: string | null;
  spend: number | null;
  impressions: number | null;
  clicks: number | null;
  leads: number | null;
  purchases: number | null;
  ctr: number | null;
  cpc: number | null;
  cpm: number | null;
  cost_per_lead: number | null;
  lead_conversion_rate: number | null;
  purchase_conversion_rate: number | null;
  roas: number | null;
}

export interface CampaignsResponse {
  campaigns: Campaign[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ActionsResponse {
  actions: ActionAggregation[];
  total_action_types: number;
  top_n: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total: number;
}
