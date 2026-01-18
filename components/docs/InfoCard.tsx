"use client";

import { ReactNode } from "react";

interface InfoCardProps {
  title: string;
  children: ReactNode;
}

export default function InfoCard({ title, children }: InfoCardProps) {
  return (
    <div className="bg-slate-900/60 border border-white/5 rounded p-3 mb-3">
      <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium mb-2">
        {title}
      </p>
      <div className="text-xs text-white/60 leading-relaxed">{children}</div>
    </div>
  );
}
