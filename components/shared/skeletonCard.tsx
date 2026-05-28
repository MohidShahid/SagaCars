import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type SkeletonCardProps = React.HTMLAttributes<HTMLDivElement>;

export function SkeletonCard({ className, ...props }: SkeletonCardProps) {
  return (
    <Card 
      className={cn(
        "group relative overflow-hidden border border-zinc-200/85 bg-white",
        className
      )}
      {...props}
    >
      {/* Top accent border placeholder */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-zinc-200" />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 pt-5">
        <div className="flex items-center gap-3 w-full">
          {/* Icon skeleton */}
          <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
          <div className="space-y-2 w-1/2">
            {/* Title skeleton */}
            <Skeleton className="h-4 w-full" />
            {/* Subtext skeleton */}
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
        {/* Badge skeleton */}
        <Skeleton className="h-5 w-16 rounded-full shrink-0" />
      </CardHeader>

      <CardContent className="pb-6">
        <div className="relative pl-4 mt-2">
          {/* Vertical timeline line placeholder */}
          <div className="absolute left-[7px] top-1.5 bottom-1.5 w-[1.5px] bg-zinc-100" />

          <div className="space-y-4">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="relative flex gap-4 items-center">
                {/* Timeline bullet skeleton */}
                <div className="absolute -left-[14px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-2 ring-zinc-50">
                  <Skeleton className="h-1.5 w-1.5 rounded-full" />
                </div>

                <div className="flex flex-1 items-center justify-between gap-4">
                  {/* Task text skeleton */}
                  <Skeleton className="h-4 w-2/3" />
                  {/* Order badge skeleton */}
                  <Skeleton className="h-4 w-6 rounded shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
