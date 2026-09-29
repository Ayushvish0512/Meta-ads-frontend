import { DatabaseSync } from "node:sqlite";
import path from "node:path";

let db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!db) {
    const dbPath = path.join(process.cwd(), "meta_ads.db");
    db = new DatabaseSync(dbPath, { readOnly: true });
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

export function buildDateFilter(
  searchParams: URLSearchParams
): { whereClause: string; params: (string | number)[] } {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  const dateStart = searchParams.get("date_start");
  const dateStop = searchParams.get("date_stop");

  if (dateStart) {
    conditions.push("date_stop >= ?");
    params.push(dateStart);
  }

  if (dateStop) {
    conditions.push("date_stop <= ?");
    params.push(dateStop);
  }

  const campaignIds = searchParams.get("campaign_ids");
  if (campaignIds) {
    const ids = campaignIds
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    if (ids.length > 0) {
      conditions.push(`campaign_id IN (${ids.map(() => "?").join(", ")})`);
      params.push(...ids);
    }
  }

  if (conditions.length > 0) {
    return { whereClause: "WHERE " + conditions.join(" AND "), params };
  }

  return { whereClause: "", params };
}

export function toNum(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function toNumOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function safeDivide(numerator: number, denominator: number): number {
  if (!denominator) return 0;
  const result = numerator / denominator;
  return Number.isFinite(result) ? result : 0;
}

export function parseJsonObject(value: string | null): Record<string, number> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, number> = {};
    for (const [key, raw] of Object.entries(parsed as Record<string, unknown>)) {
      const n = Number(raw);
      if (Number.isFinite(n)) out[key] = n;
    }
    return out;
  } catch {
    return {};
  }
}
