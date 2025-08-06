// components/TooltipWrapper.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

interface Visit {
  date: string;
  partySize: number;
  notes?: string;
  stars?: number;
  message?: string;
}

interface Props {
  customerId: string;
  children: React.ReactNode;
  apiToken: string;
  renderContent?: (history: Visit[]) => React.ReactNode;
}

export default function TooltipWrapper({
  customerId,
  children,
  apiToken,
  renderContent,
}: Props) {
  const [history, setHistory] = useState<Visit[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Prefetch optional
  }, []);

  const fetchHistory = async () => {
    if (history || loading) return; // prevent re-fetching
    setLoading(true);
    try {
      const res = await fetch(`/api/history/customer/${customerId}`, {
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error(err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip onOpenChange={(open) => open && fetchHistory()}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className="max-w-sm">
          {loading && <Skeleton className="h-16 w-full" />}
          {!loading && history && renderContent?.(history)}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
