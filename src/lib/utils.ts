const SORTABLE_COLUMNS_LIST = [
  "spend",
  "impressions",
  "reach",
  "frequency",
  "clicks",
  "link_clicks",
  "ctr",
  "cpc",
  "cpm",
  "leads",
  "cost_per_lead",
  "lead_conversion_rate",
  "purchases",
  "cost_per_purchase",
  "purchase_conversion_rate",
  "landing_page_views",
  "click_to_landing_page_rate",
  "messaging_conversations",
  "messaging_replies",
  "cost_per_messaging_conversation",
  "video_views",
  "post_engagement",
  "unique_clicks",
  "unique_actions",
  "unique_ctr",
  "cpp",
  "cost_per_unique_click",
  "inline_link_clicks",
  "outbound_clicks",
  "landing_page_view",
  "cost_per_landing_page_view",
  "cost_per_inline_link_click",
  "cost_per_outbound_click",
  "purchase_roas",
  "conversions",
  "cost_per_conversion",
  "unique_conversions",
  "cost_per_unique_conversion",
  "video_p25_watched_actions",
  "video_p50_watched_actions",
  "video_p75_watched_actions",
  "video_p100_watched_actions",
  "page_engagement",
  "post_engagement_calculated",
] as const;

export const SORTABLE_COLUMNS: ReadonlySet<string> = new Set<string>(
  SORTABLE_COLUMNS_LIST
);

export function isSortableColumn(column: string): boolean {
  return SORTABLE_COLUMNS.has(column);
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCompactCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return "₹0";
  if (Math.abs(value) >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)}Cr`;
  }
  if (Math.abs(value) >= 100000) {
    return `₹${(value / 100000).toFixed(2)}L`;
  }
  if (Math.abs(value) >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }
  return formatCurrency(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return "0";
  return new Intl.NumberFormat("en-IN").format(value);
}

export function formatCompactNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return "0";
  const n = Math.abs(value);
  if (n >= 10000000) return `${(value / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `${(value / 100000).toFixed(2)}L`;
  if (n >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return formatNumber(value);
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return "0%";
  return `${value.toFixed(2)}%`;
}

export function formatRatio(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return "0.00x";
  return `${value.toFixed(2)}x`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(`${iso}T00:00:00`);
  if (isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value.replace(" ", "T"));
  if (isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function relativeTime(hours: number | null): string {
  if (hours === null) return "unknown";
  if (hours < 1) return `${Math.round(hours * 60)}m ago`;
  if (hours < 48) return `${Math.round(hours)}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function truncate(text: string | null | undefined, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function shortenLabel(
  text: string | null | undefined,
  maxLength = 22
): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  const keepTail = 6;
  const head = text.slice(0, maxLength - keepTail - 1);
  const tail = text.slice(-keepTail);
  return `${head}…${tail}`;
}

export function dedupeLabels(labels: string[]): string[] {
  const seen = new Map<string, number>();
  return labels.map((label) => {
    const count = (seen.get(label) ?? 0) + 1;
    seen.set(label, count);
    return count === 1 ? label : `${label} (${count})`;
  });
}

export function buildQueryString(params: Record<string, string | null>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== "") {
      searchParams.set(key, value);
    }
  }
  const str = searchParams.toString();
  return str ? `?${str}` : "";
}
