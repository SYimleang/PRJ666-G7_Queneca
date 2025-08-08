// components/TooltipWrapper.tsx
"use client";

import React, { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"; // <-- Ensure this is installed
import { Skeleton } from "@/components/ui/skeleton";

interface WaitlistVisit {
  id: string;
  restaurantId: string;
  partySize: number;
  joinedAt: string;
  status: string;
  seatedAt?: string;
  noShowAt?: string;
  cancelledAt?: string;
  notes?: string;
}

interface Review {
  id: string;
  restaurantId: string;
  rating: number;
  comment?: string;
}

interface CustomerHistory {
  waitlistHistory: WaitlistVisit[];
  reviews: Review[];
}

interface Props {
  customerId: string;
  children: React.ReactNode;
  apiToken: string;
  renderContent?: (history: CustomerHistory) => React.ReactNode;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function TooltipWrapper({
  customerId,
  children,
  apiToken,
  renderContent,
}: Props) {
  const [history, setHistory] = useState<CustomerHistory | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    if (history || loading) return; // prevent re-fetching
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/waitlist/history/${customerId}`, {
        headers: { Authorization: `Bearer ${apiToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        console.log("Fetched visit history:", data);
        setHistory({
          waitlistHistory: data.waitlistHistory || [],
          reviews: data.reviews || [],
        });
      } else {
        setHistory({ waitlistHistory: [], reviews: [] });
      }
    } catch (err) {
      console.error(err);
      setHistory({ waitlistHistory: [], reviews: [] });
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
