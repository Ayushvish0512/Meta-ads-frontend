"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Search, ArrowUpDown, ExternalLink } from "lucide-react";
import type { Campaign } from "@/types";
import { formatCurrency, formatNumber, formatPercent, truncate } from "@/lib/utils";

interface CampaignTableProps {
  campaigns: Campaign[];
  total: number;
}

type SortKey = keyof Campaign;
type SortOrder = "asc" | "desc";

const VISIBLE_COLUMNS: { key: SortKey; label: string; render?: (c: Campaign) => React.ReactNode }[] = [
  { key: "campaign_name", label: "Campaign" },
  { key: "date_stop", label: "Date" },
  {
    key: "spend",
    label: "Spend",
    render: (c) => <span className="text-right">{formatCurrency(c.spend)}</span>,
  },
  {
    key: "impressions",
    label: "Impr.",
    render: (c) => <span className="text-right">{formatNumber(c.impressions)}</span>,
  },
  {
    key: "clicks",
    label: "Clicks",
    render: (c) => <span className="text-right">{formatNumber(c.clicks)}</span>,
  },
  {
    key: "ctr",
    label: "CTR (%)",
    render: (c) => <span className="text-right">{formatPercent(c.ctr)}</span>,
  },
  {
    key: "cpc",
    label: "CPC",
    render: (c) => <span className="text-right">{formatCurrency(c.cpc)}</span>,
  },
  {
    key: "leads",
    label: "Leads",
    render: (c) => <span className="text-right">{formatNumber(c.leads)}</span>,
  },
  {
    key: "cost_per_lead",
    label: "CPL",
    render: (c) => <span className="text-right">{formatCurrency(c.cost_per_lead)}</span>,
  },
  {
    key: "purchases",
    label: "Purch.",
    render: (c) => <span className="text-right">{formatNumber(c.purchases)}</span>,
  },
  {
    key: "cost_per_purchase",
    label: "CP Purchase",
    render: (c) => <span className="text-right">{formatCurrency(c.cost_per_purchase)}</span>,
  },
];

export default function CampaignTable({ campaigns, total }: CampaignTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("spend");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(1);

  const pageSize = 15;

  const filteredSorted = useMemo(() => {
    let result = [...campaigns];

    if (search) {
      result = result.filter((c) =>
        (c.campaign_name ?? "").toLowerCase().includes(search.toLowerCase())
      );
    }

    result.sort((a, b) => {
      const av = a[sortKey] ?? 0;
      const bv = b[sortKey] ?? 0;
      let cmp = 0;
      if (typeof av === "string" && typeof bv === "string") {
        cmp = av.localeCompare(bv);
      } else if (typeof av === "number" && typeof bv === "number") {
        cmp = av - bv;
      } else if (av === null && bv === null) {
        cmp = 0;
      } else if (av === null) {
        cmp = -1;
      } else if (bv === null) {
        cmp = 1;
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });

    return result;
  }, [campaigns, search, sortKey, sortOrder]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSorted.slice(start, start + pageSize);
  }, [filteredSorted, page]);

  const totalPages = Math.ceil(filteredSorted.length / pageSize);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-sm text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              {VISIBLE_COLUMNS.map((col) => (
                <th
                  key={String(col.key)}
                  className="px-3 py-2 text-left text-xs font-medium text-zinc-500 uppercase cursor-pointer hover:text-zinc-300"
                  onClick={() => col.key !== "campaign_name" && col.key !== "date_stop" && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {(col.key !== "campaign_name" && col.key !== "date_stop") && (
                      <ArrowUpDown size={12} />
                    )}
                    {sortKey === col.key && (
                      <span className="text-zinc-500">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={VISIBLE_COLUMNS.length} className="py-8 text-center text-zinc-500">
                  No campaigns found
                </td>
              </tr>
            ) : (
              paginated.map((c) => (
                <tr key={`${c.campaign_id}-${c.date_stop}`} className="border-b border-zinc-800/50 group">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{truncate(c.campaign_name, 35)}</span>
                      {c.campaign_id && (
                        <span className="text-xs text-zinc-600">#{truncate(c.campaign_id, 10)}</span>
                      )}
                    </div>
                  </td>
                  {VISIBLE_COLUMNS.slice(1).map((col) => (
                    <td key={col.key} className="px-3 py-2.5 text-zinc-400">
                      {col.render ? col.render(c) : truncate(String(c[col.key] ?? ""), 20)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
        <span className="text-xs text-zinc-500">
          Showing {Math.min((page - 1) * pageSize + 1, filteredSorted.length)}–{Math.min(page * pageSize, filteredSorted.length)} of {filteredSorted.length} (filtered from {total} total)
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-1 text-zinc-500 rounded hover:text-zinc-300 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-2 py-1 text-xs rounded ${
                    page === pageNum
                      ? "bg-blue-600 text-white"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-1 text-zinc-500 rounded hover:text-zinc-300 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
