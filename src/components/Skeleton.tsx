import { ChartColumnBig } from "lucide-react";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-zinc-800 animate-pulse rounded ${className}`} />;
}

export function ChartSkeleton({ height = 320, label }: { height?: number; label?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 animate-pulse"
      style={{ height }}
    >
      <ChartColumnBig size={22} className="text-zinc-700" />
      <span className="text-xs text-zinc-600">{label ?? "Loading…"}</span>
      <div className="flex items-end gap-1.5 mt-1">
        {[40, 70, 55, 85, 65, 95, 50].map((h, i) => (
          <div
            key={i}
            className="w-4 bg-zinc-800 rounded-t"
            style={{ height: `${(h / 100) * 90}px` }}
          />
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 8 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-2">
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="h-6 bg-zinc-800 rounded flex-1"
              style={{ opacity: 1 - r * 0.08 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
