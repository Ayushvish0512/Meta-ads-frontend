"use client";

import { ReactNode } from "react";

interface SectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  subtitle?: string;
}

export function Section({ title, children, className = "", subtitle }: SectionProps) {
  return (
    <section className={`bg-zinc-900 border border-zinc-800 rounded-xl p-5 ${className}`}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {subtitle && <p className="text-sm text-zinc-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}
