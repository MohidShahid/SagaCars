"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PreparationTemplate } from "@/types/PreparationTemplate";
import { cn } from "@/lib/utils";
import { ClipboardList } from "lucide-react";

interface TemplateCardProps extends React.HTMLAttributes<HTMLDivElement> {
  template: PreparationTemplate;
}

export function TemplateCard({ template, className, ...props }: TemplateCardProps) {
  // Sort checklist by order to ensure chronological rendering
  const sortedChecklist = [...(template?.checklist || [])].sort((a, b) => {
    const orderA = typeof a.order === 'string' ? parseInt(a.order, 10) : a.order;
    const orderB = typeof b.order === 'string' ? parseInt(b.order, 10) : b.order;
    return (orderA || 0) - (orderB || 0);
  });

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border border-zinc-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-[0_12px_30px_-15px_rgba(0,0,0,0.08)]",
        className
      )}
      {...props}
    >
      {/* Visual Accent/Glow Effect */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-zinc-800 via-zinc-900 to-black opacity-80" />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-700 transition-colors group-hover:bg-black group-hover:text-white group-hover:border-black duration-300">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold tracking-tight text-zinc-900 line-clamp-1">
              {template?.name}
            </CardTitle>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              Template
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-700 border border-zinc-200">
          {template?.checklist?.length || 0} items
        </span>
      </CardHeader>

      <CardContent className="pb-6">
        {sortedChecklist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
            <p className="text-xs font-medium text-zinc-400">No tasks defined in this template</p>
          </div>
        ) : (
          <div className="relative pl-4 mt-2">
            {/* Vertical timeline line */}
            <div className="absolute left-[7px] top-1.5 bottom-1.5 w-[1.5px] bg-gradient-to-b from-zinc-200 via-zinc-200 to-zinc-100" />

            <div className="space-y-4">
              {sortedChecklist.map((item, index) => (
                <div key={index} className="relative flex gap-4 group/item">
                  {/* Timeline bullet */}
                  <div className="absolute -left-[14px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-2 ring-zinc-100 group-hover/item:ring-black/20 transition-all duration-200">
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-400 group-hover/item:bg-black transition-colors duration-200" />
                  </div>

                  <div className="flex flex-1 items-start justify-between gap-2 ml-6">
                    <span className="text-sm font-medium text-zinc-700 group-hover/item:text-black transition-colors duration-200">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-bold font-mono text-zinc-400 bg-zinc-50 border border-zinc-100 px-1.5 py-0.5 rounded group-hover/item:text-zinc-600 transition-colors duration-200">
                      #{index + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
