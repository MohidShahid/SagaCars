"use client";

import React, { useEffect, useState } from "react";
import { getAllTemplates } from "@/lib/api/templateActions";
import { PreparationTemplate } from "@/types/PreparationTemplate";
import { SkeletonCard } from "@/components/shared/skeletonCard";
import { TemplateCard } from "@/components/shared/templateCard";

const Templates = () => {
  const [templatelist, setTemplatelist] = useState<Array<PreparationTemplate>>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getAllTemplates();
        setTemplatelist(data?.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch templates:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="pt-12 flex flex-col gap-8 px-12 pb-16">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 font-heading">
            Preparation Templates List
          </h1>
          <p className="text-sm text-zinc-500">
            Manage your car preparation steps and checklists
          </p>
        </div>

        <div className="bg-zinc-50 border border-zinc-200/80 px-3 py-1.5 rounded-lg">
          <span className="text-xs font-semibold text-zinc-600">
            Total Templates: {templatelist.length}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <SkeletonCard key={item} />
          ))}
        </div>
      ) : templatelist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
          <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
            <span className="text-lg">📋</span>
          </div>
          <h3 className="text-sm font-semibold text-zinc-900">No templates found</h3>
          <p className="text-xs text-zinc-500 mt-1">Create a new preparation template to get started.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {templatelist.map((temp, index) => (
            <TemplateCard key={index} template={temp} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Templates;

