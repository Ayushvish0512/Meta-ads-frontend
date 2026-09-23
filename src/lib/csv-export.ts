import type { Campaign } from "@/types";
import { formatCurrency, formatNumber } from "@/lib/utils";

export function campaignToCSVRow(c: Campaign): Record<string, string> {
  return {
    "Campaign ID": c.campaign_id ?? "",
    "Campaign Name": c.campaign_name ?? "",
    "Date Start": c.date_start ?? "",
    "Date Stop": c.date_stop ?? "",
    "Spend": formatCurrency(c.spend ?? 0),
    "Impressions": formatNumber(c.impressions ?? 0),
    "Reach": formatNumber(c.reach ?? 0),
    "Frequency": (c.frequency ?? 0).toFixed(2),
    "Clicks": formatNumber(c.clicks ?? 0),
    "Link Clicks": formatNumber(c.link_clicks ?? 0),
    "CTR (%)": (c.ctr ?? 0).toFixed(2),
    "CPC ($)": formatCurrency(c.cpc ?? 0),
    "CPM ($)": formatCurrency(c.cpm ?? 0),
    "Leads": formatNumber(c.leads ?? 0),
    "Cost Per Lead ($)": formatCurrency(c.cost_per_lead ?? 0),
    "Lead Conv. Rate (%)": (c.lead_conversion_rate ?? 0).toFixed(2),
    "Purchases": formatNumber(c.purchases ?? 0),
    "Cost Per Purchase ($)": formatCurrency(c.cost_per_purchase ?? 0),
    "Purchase Conv. Rate (%)": (c.purchase_conversion_rate ?? 0).toFixed(2),
    "Landing Page Views": formatNumber(c.landing_page_views ?? 0),
    "Click-to-LP Rate (%)": (c.click_to_landing_page_rate ?? 0).toFixed(2),
    "Messaging Conversations": formatNumber(c.messaging_conversations ?? 0),
    "Messaging Replies": formatNumber(c.messaging_replies ?? 0),
    "Cost per Messaging ($)": formatCurrency(c.cost_per_messaging_conversation ?? 0),
    "Video Views": formatNumber(c.video_views ?? 0),
    "Post Engagement": formatNumber(c.post_engagement ?? 0),
    "Actions": c.actions ?? "",
  };
}

export function downloadCSV(
  data: Campaign[],
  filename = "campaigns.csv"
): void {
  if (data.length === 0) return;

  const rows = data.map(campaignToCSVRow);
  const headers = Object.keys(rows[0]);
  const csvLines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          const escaped = val.replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    ),
  ];

  const csvContent = csvLines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function fetchAndExportCSV(
  dateStart: string | null,
  dateStop: string | null
): Promise<void> {
  const params = new URLSearchParams();
  if (dateStart) params.set("date_start", dateStart);
  if (dateStop) params.set("date_stop", dateStop);

  const res = await fetch(`/api/campaigns${params.toString() ? `?${params.toString()}` : ""}&page=1&page_size=1000`);
  const json = await res.json();
  const campaigns: Campaign[] = json.campaigns || [];
  downloadCSV(campaigns);
}
