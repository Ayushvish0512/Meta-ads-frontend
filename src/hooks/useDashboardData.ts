"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ActionAggregation,
  Campaign,
  CampaignRollup,
  CampaignSummary,
  DataHealthResponse,
  EngagementResponse,
  FunnelData,
  RevenueSummary,
  TrendPoint,
} from "@/types";
import type { DateRange } from "@/components/DateRangePicker";

const STAGGER_MS = 1;
const DEFAULT_WINDOW_DAYS = 7;

type Range = Pick<DateRange, "start" | "end">;

export interface DashboardData {
  health: DataHealthResponse | null;
  summary: CampaignSummary | null;
  rollup: CampaignRollup[];
  trends: TrendPoint[];
  funnel: FunnelData | null;
  funnelRates: Record<string, number> | null;
  actions: ActionAggregation[];
  engagement: EngagementResponse | null;
  revenue: RevenueSummary | null;
  campaigns: Campaign[];
  total: number;
}

export type SectionKey =
  | "health"
  | "summary"
  | "rollup"
  | "trends"
  | "funnel"
  | "engagement"
  | "revenue"
  | "actions"
  | "campaigns";

const EMPTY: DashboardData = {
  health: null,
  summary: null,
  rollup: [],
  trends: [],
  funnel: null,
  funnelRates: null,
  actions: [],
  engagement: null,
  revenue: null,
  campaigns: [],
  total: 0,
};

const ALL_KEYS: SectionKey[] = [
  "health",
  "summary",
  "rollup",
  "trends",
  "funnel",
  "engagement",
  "revenue",
  "actions",
  "campaigns",
];

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildQuery(range: Range): string {
  const params = new URLSearchParams();
  if (range.start) params.set("date_start", range.start);
  if (range.end) params.set("date_stop", range.end);
  const str = params.toString();
  return str ? `?${str}` : "";
}

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} responded ${res.status}`);
  return (await res.json()) as T;
}

/** Formats using local calendar parts. toISOString() would shift these by a
 *  day in any timezone east/west of UTC. */
function formatLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00`);
  if (isNaN(date.getTime())) return iso;
  date.setDate(date.getDate() + days);
  return formatLocal(date);
}

function lastWindow(anchorIso: string, days: number): Range {
  return { start: shiftDays(anchorIso, -(days - 1)), end: anchorIso };
}

export function useDashboardData() {
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [data, setData] = useState<DashboardData>(EMPTY);
  const [loading, setLoading] = useState<Set<SectionKey>>(
    () => new Set(ALL_KEYS)
  );
  const [settled, setSettled] = useState<Set<SectionKey>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);

  const runIdRef = useRef(0);
  const rangeRef = useRef<DateRange | null>(null);
  const initializedRef = useRef(false);

  const markLoading = useCallback((keys: SectionKey[]) => {
    setLoading((prev) => {
      const next = new Set(prev);
      for (const key of keys) next.add(key);
      return next;
    });
  }, []);

  const settle = useCallback((key: SectionKey) => {
    setLoading((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    setSettled((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  const patch = useCallback(
    <K extends keyof DashboardData>(key: K, value: DashboardData[K]) => {
      setData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const load = useCallback(
    async (range: DateRange) => {
      const runId = ++runIdRef.current;
      const isCurrent = () => runIdRef.current === runId;
      const query = buildQuery(range);

      markLoading(["summary", "rollup"]);
      setError(null);

      // Phase 1 - the "Performance Overview" above the fold. Both requests
      // are issued together so the first paint only waits on one round trip.
      const critical = await Promise.allSettled([
        getJSON<CampaignSummary>(`/api/campaigns/summary${query}`),
        getJSON<{ rollup: CampaignRollup[] }>(`/api/campaigns/rollup${query}`),
      ]);
      if (!isCurrent()) return;

      if (critical[0].status === "fulfilled") {
        patch("summary", critical[0].value);
      } else {
        setError(critical[0].reason?.message ?? "Failed to load summary");
      }
      if (critical[1].status === "fulfilled") {
        patch("rollup", critical[1].value.rollup ?? []);
      }
      settle("summary");
      settle("rollup");

      // Phase 2 - everything below the fold, released one request at a time so
      // each section paints as it lands instead of blocking on the whole page.
      const deferred: { key: SectionKey; run: () => Promise<void> }[] = [
        {
          key: "trends",
          run: async () => {
            const res = await getJSON<{ trends: TrendPoint[] }>(
              `/api/campaigns/trends${query}`
            );
            if (isCurrent()) patch("trends", res.trends ?? []);
          },
        },
        {
          key: "funnel",
          run: async () => {
            const res = await getJSON<{
              funnel: FunnelData;
              rates: Record<string, number>;
            }>(`/api/campaigns/funnel${query}`);
            if (!isCurrent()) return;
            patch("funnel", res.funnel);
            patch("funnelRates", res.rates);
          },
        },
        {
          key: "engagement",
          run: async () => {
            const res = await getJSON<EngagementResponse>(
              `/api/campaigns/engagement${query}`
            );
            if (isCurrent()) patch("engagement", res);
          },
        },
        {
          key: "revenue",
          run: async () => {
            const res = await getJSON<RevenueSummary>(
              `/api/campaigns/revenue${query}`
            );
            if (isCurrent()) patch("revenue", res);
          },
        },
        {
          key: "actions",
          run: async () => {
            const res = await getJSON<{ actions: ActionAggregation[] }>(
              `/api/campaigns/actions${query}&top_n=20`
            );
            if (isCurrent()) patch("actions", res.actions ?? []);
          },
        },
        {
          key: "campaigns",
          run: async () => {
            const res = await getJSON<{ campaigns: Campaign[]; total: number }>(
              `/api/campaigns${query}${query ? "&" : "?"}page=1&page_size=1000`
            );
            if (!isCurrent()) return;
            patch("campaigns", res.campaigns ?? []);
            patch("total", res.total ?? 0);
          },
        },
      ];

      for (const step of deferred) {
        markLoading([step.key]);
        await wait(STAGGER_MS);
        if (!isCurrent()) return;
        try {
          await step.run();
        } catch (err) {
          if (isCurrent()) {
            setError(
              err instanceof Error ? err.message : `Failed to load ${step.key}`
            );
          }
        }
        settle(step.key);
      }

      if (isCurrent()) setLoading(new Set());
    },
    [markLoading, patch, settle]
  );

  // Bootstrap: learn the dataset bounds once, then pin the default window to
  // the newest date that actually has data rather than to today.
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const runId = ++runIdRef.current;

    void (async () => {
      try {
        const health = await getJSON<DataHealthResponse>("/api/data/health");
        if (runIdRef.current !== runId) return;

        patch("health", health);
        settle("health");

        const anchor = health.dataset_last_date;
        const range: DateRange = anchor
          ? {
              ...lastWindow(anchor, DEFAULT_WINDOW_DAYS),
              label: `Last ${DEFAULT_WINDOW_DAYS} Days`,
            }
          : { start: null, end: null, label: "All Time" };

        rangeRef.current = range;
        setDateRange(range);
        await load(range);
      } catch (err) {
        if (runIdRef.current !== runId) return;
        setFatal(err instanceof Error ? err.message : "Failed to reach the API");
        setLoading(new Set());
      }
    })();
  }, [load, patch, settle]);

  const changeRange = useCallback(
    (range: DateRange) => {
      rangeRef.current = range;
      setDateRange(range);
      void load(range);
    },
    [load]
  );

  const refresh = useCallback(() => {
    const range = rangeRef.current;
    if (!range) return;
    setSettled(new Set());
    void load(range);
  }, [load]);

  return {
    data,
    dateRange,
    loading,
    settled,
    error,
    fatal,
    ready: settled.size === ALL_KEYS.length,
    setDateRange: changeRange,
    refresh,
  };
}
