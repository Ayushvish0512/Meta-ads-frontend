import type { Campaign } from "@/types";
import { formatCurrency, formatNumber } from "@/lib/utils";

export function campaignToCSVRow(c: Campaign): Record<string, string> {
  return {
    "Campaign ID": c.campaign_id ?? "",
    "Campaign Name": c.campaign_name ?? "",
    "Date": c.date_stop ?? "",
    "Spend (INR)": (c.spend ?? 0).toFixed(2),
    "Impressions": formatNumber(c.impressions ?? 0),
    "Reach": formatNumber(c.reach ?? 0),
    "Frequency": (c.frequency ?? 0).toFixed(2),
    "Clicks": formatNumber(c.clicks ?? 0),
    "Unique Clicks": formatNumber(c.unique_clicks ?? 0),
    "Inline Link Clicks": formatNumber(c.inline_link_clicks ?? 0),
    "CTR (%)": (c.ctr ?? 0).toFixed(2),
    "CPC (INR)": (c.cpc ?? 0).toFixed(2),
    "CPM (INR)": (c.cpm ?? 0).toFixed(2),
    "CPP (INR)": (c.cpp ?? 0).toFixed(2),
    "Leads": formatNumber(c.leads ?? 0),
    "Cost Per Lead (INR)": (c.cost_per_lead ?? 0).toFixed(2),
    "Lead Conv. Rate (%)": (c.lead_conversion_rate ?? 0).toFixed(2),
    "Purchases": formatNumber(c.purchases ?? 0),
    "Cost Per Purchase (INR)": (c.cost_per_purchase ?? 0).toFixed(2),
    "Purchase Conv. Rate (%)": (c.purchase_conversion_rate ?? 0).toFixed(2),
    "Landing Page Views": formatNumber(c.landing_page_views ?? 0),
    "Click-to-LP Rate (%)": (c.click_to_landing_page_rate ?? 0).toFixed(2),
    "Messaging Conversations": formatNumber(c.messaging_conversations ?? 0),
    "Cost per Messaging (INR)": (c.cost_per_messaging_conversation ?? 0).toFixed(2),
    "Video Views": formatNumber(c.video_views ?? 0),
    "Post Engagement (Calc)": formatNumber(c.post_engagement_calculated ?? 0),
    "Action Values": c.action_values ?? "",
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
  params.set("page", "1");
  params.set("page_size", "1000");

  const res = await fetch(`/api/campaigns?${params.toString()}`);
  const json = await res.json();
  const campaigns: Campaign[] = json.campaigns ?? [];
  downloadCSV(campaigns, `meta_ads_${dateStart ?? "all"}_${dateStop ?? "all"}.csv`);
}

export function formatCurrencySafe(value: number | null | undefined): string {
  return formatCurrency(value ?? 0);
}
