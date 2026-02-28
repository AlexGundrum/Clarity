"use client";

import { ReactNode } from "react";

interface MacVideoWindowProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function MacVideoWindow({ title, children, className = "" }: MacVideoWindowProps) {
  return (
    <div className={`mac-window overflow-hidden ${className}`}>
      {/* Title Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200/40 bg-slate-50/80 px-4 py-2.5 backdrop-blur-sm">
        {/* Traffic Lights */}
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-400/70 transition-colors hover:bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-yellow-400/70 transition-colors hover:bg-yellow-500" />
          <div className="h-3 w-3 rounded-full bg-green-400/70 transition-colors hover:bg-green-500" />
        </div>
        
        {/* Title */}
        <span className="ml-2 flex-1 text-center font-mono text-xs tracking-wide text-slate-600">
          {title}
        </span>
        
        {/* Spacer for centering */}
        <div className="w-[52px]" />
      </div>

      {/* Content */}
      <div className="relative bg-slate-900">
        {children}
      </div>
    </div>
  );
}
