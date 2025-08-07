"use client";

import AdminNav from "@/components/AdminNav";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import VisitorsChart from "@/components/VisitorsChart";
import PeakHoursHeatmap from "@/components/PeakHoursHeatmap";

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-6">
      <AdminNav></AdminNav>
      <Separator className="mt-5 mb-5" />
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Restaurant Analytics</h1>
      </div>
      <Card className="p-6 rounded-2xl bg-red-100 shadow-md">
        {/* {loading ? (
            <div>Loading...</div>
          ) : ( */}
        <CardContent className="space-y-6 gap-20">
          <VisitorsChart range="daily" />
        </CardContent>
        <CardContent className="space-y-6 gap-20">
          <VisitorsChart range="weekly" />
        </CardContent>
        <CardContent className="space-y-6 gap-20">
          <VisitorsChart range="monthly" />
        </CardContent>
        <CardContent className="space-y-6 gap-20 bg-black-100 rounded-lg">
          <PeakHoursHeatmap />
        </CardContent>
        {/* )} */}
      </Card>
    </div>
  );
}
