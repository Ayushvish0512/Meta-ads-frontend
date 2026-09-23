import { DatabaseSync } from "node:sqlite";
import path from "node:path";

let db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!db) {
    const dbPath = path.join(process.cwd(), "meta_ads.db");
    db = new DatabaseSync(dbPath);
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

  if (conditions.length > 0) {
    return { whereClause: "WHERE " + conditions.join(" AND "), params };
  }

  return { whereClause: "", params };
}
