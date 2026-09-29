"use client";

import { format, subDays, startOfMonth } from "date-fns";
import { Calendar, Check, Database } from "lucide-react";
import { useState } from "react";

export type DateRange = {
  start: string | null;
  end: string | null;
  label: string;
};

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  /** Latest date that actually has data. Presets anchor to this, not today. */
  maxDate?: string | null;
  /** Earliest date that has data. */
  minDate?: string | null;
}

function toDate(value: string | null | undefined, fallback: Date): Date {
  if (!value) return fallback;
  const parsed = new Date(`${value}T00:00:00`);
  return isNaN(parsed.getTime()) ? fallback : parsed;
}

/** Inclusive end date for a "last N days" window. */
function windowFor(anchor: Date, days: number): { start: string; end: string } {
  return {
    start: format(subDays(anchor, days - 1), "yyyy-MM-dd"),
    end: format(anchor, "yyyy-MM-dd"),
  };
}

export default function DateRangePicker({
  value,
  onChange,
  maxDate,
  minDate,
}: DateRangePickerProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // Anchor every preset to the newest date present in the database.
  // Falling back to today only happens when the database is empty.
  const anchor = toDate(maxDate, new Date());
  const floor = toDate(minDate, anchor);

  const presets: { label: string; start: string; end: string }[] = [
    { label: "Last 7 Days", ...windowFor(anchor, 7) },
    { label: "Last 14 Days", ...windowFor(anchor, 14) },
    { label: "Last 30 Days", ...windowFor(anchor, 30) },
    { label: "Last 60 Days", ...windowFor(anchor, 60) },
    {
      label: "Month to Date",
      start: format(startOfMonth(anchor), "yyyy-MM-dd"),
      end: format(anchor, "yyyy-MM-dd"),
    },
    {
      label: "All Time",
      start: format(floor, "yyyy-MM-dd"),
      end: format(anchor, "yyyy-MM-dd"),
    },
  ];

  const handlePreset = (preset: (typeof presets)[number]) => {
    onChange({ start: preset.start, end: preset.end, label: preset.label });
    setShowCustom(false);
  };

  const handleCustomApply = () => {
    const start = customStart || null;
    const end = customEnd || null;
    onChange({
      start,
      end,
      label: start && end ? `${start} → ${end}` : start ? `From ${start}` : end ? `Until ${end}` : "Custom",
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
          <div className="absolute right-0 z-20 w-64 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl">
            {maxDate && (
              <div className="flex items-center gap-1.5 px-3 py-2 text-[11px] text-zinc-500 border-b border-zinc-800">
                <Database size={11} />
                <span>
                  Data through{" "}
                  <span className="text-zinc-400">{maxDate}</span>
                </span>
              </div>
            )}

            <div className="p-2 text-xs font-medium text-zinc-500 uppercase">
              Presets
            </div>
            <div className="py-1">
              {presets.map((preset) => {
                const active =
                  value.start === preset.start && value.end === preset.end;
                return (
                  <button
                    key={preset.label}
                    onClick={() => handlePreset(preset)}
                    className="w-full px-3 py-2 text-sm text-left text-zinc-300 hover:bg-zinc-800 transition-colors flex items-center justify-between gap-2"
                  >
                    <span>{preset.label}</span>
                    <span className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-600">
                        {preset.start.slice(5)} → {preset.end.slice(5)}
                      </span>
                      {active && <Check size={12} className="text-blue-400" />}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-zinc-800">
              <div className="p-3">
                <div className="mb-2 text-xs font-medium text-zinc-500">
                  Custom Range
                </div>
                <input
                  type="date"
                  value={customStart}
                  min={minDate ?? undefined}
                  max={maxDate ?? undefined}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full px-2 py-1.5 mb-2 text-xs text-zinc-300 bg-zinc-800 rounded border border-zinc-700 focus:outline-none focus:border-blue-600"
                />
                <input
                  type="date"
                  value={customEnd}
                  min={minDate ?? undefined}
                  max={maxDate ?? undefined}
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
