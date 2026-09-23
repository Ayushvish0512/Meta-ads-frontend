"use client";

import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { Calendar } from "lucide-react";
import { useState } from "react";

export type DateRange = {
  start: string | null;
  end: string | null;
  label: string;
};

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const presets: { label: string; range: { start: string | null; end: string | null } }[] = [
  { label: "All Time", range: { start: null, end: null } },
];

function getDateRange(daysAgo: number): { start: string; end: string } {
  const end = new Date();
  const start = subDays(end, daysAgo);
  return {
    start: format(start, "yyyy-MM-dd"),
    end: format(end, "yyyy-MM-dd"),
  };
}

function getMonthToDate(): { start: string; end: string } {
  const now = new Date();
  return {
    start: format(startOfMonth(now), "yyyy-MM-dd"),
    end: format(endOfMonth(now), "yyyy-MM-dd"),
  };
}

function getLastNDaysOptions(): { label: string; start: string; end: string }[] {
  return [
    { label: "Last 7 Days", ...getDateRange(7) },
    { label: "Last 14 Days", ...getDateRange(14) },
    { label: "Last 30 Days", ...getDateRange(30) },
    { label: "Last 60 Days", ...getDateRange(60) },
    { label: "Last 90 Days", ...getDateRange(90) },
    { label: "Month to Date", ...getMonthToDate() },
  ];
}

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const handlePreset = (range: { start: string | null; end: string | null }, label: string) => {
    onChange({ start: range.start, end: range.end, label });
    setShowCustom(false);
  };

  const handleCustomApply = () => {
    onChange({
      start: customStart || null,
      end: customEnd || null,
      label: customStart && customEnd ? `${customStart} → ${customEnd}` : "Custom",
    });
    setShowCustom(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowCustom(!showCustom)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
      >
        <Calendar size={16} />
        <span>{value.label}</span>
      </button>

      {showCustom && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowCustom(false)}
          />
          <div className="absolute left-0 z-20 w-56 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl">
            <div className="p-2 text-xs font-medium text-zinc-500 uppercase">
              Presets
            </div>
            <div className="py-1">
              {getLastNDaysOptions().map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => handlePreset({ start: opt.start, end: opt.end }, opt.label)}
                  className="w-full px-3 py-2 text-sm text-left text-zinc-300 hover:bg-zinc-800 transition-colors"
                >
                  {opt.label}
                </button>
              ))}
              <button
                onClick={() => handlePreset({ start: null, end: null }, "All Time")}
                className="w-full px-3 py-2 text-sm text-left text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                All Time
              </button>
            </div>

            <div className="border-t border-zinc-800">
              <div className="p-3">
                <div className="mb-2 text-xs font-medium text-zinc-500">Custom Range</div>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full px-2 py-1.5 mb-2 text-xs text-zinc-300 bg-zinc-800 rounded border border-zinc-700 focus:outline-none focus:border-blue-600"
                />
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full px-2 py-1.5 mb-2 text-xs text-zinc-300 bg-zinc-800 rounded border border-zinc-700 focus:outline-none focus:border-blue-600"
                />
                <button
                  onClick={handleCustomApply}
                  className="w-full px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
