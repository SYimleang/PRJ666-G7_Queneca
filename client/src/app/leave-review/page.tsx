"use client";

import { Suspense } from "react";
import LeaveReviewContent from "./LeaveReviewContent";

export default function LeaveReviewPage() {
  return (
    <Suspense>
      <LeaveReviewContent />
    </Suspense>
  );
}
