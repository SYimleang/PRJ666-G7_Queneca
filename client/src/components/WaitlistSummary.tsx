"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";
import { useRestaurant } from "@/context/RestaurantContext";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

interface WaitlistStats {
  totalWaiting: number;
  totalCalled: number;
  totalSeated: number;
  avgWaitTime: number;
  capacity: number;
}

export default function WaitlistSummary() {
  const { user } = useUser();
  const { restaurant } = useRestaurant();
  const [stats, setStats] = useState<WaitlistStats>({
    totalWaiting: 0,
    totalCalled: 0,
    totalSeated: 0,
    avgWaitTime: 0,
    capacity: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch waitlist statistics
  const fetchStats = async () => {
    if (!user || !restaurant) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${apiUrl}/api/waitlist/restaurant/${restaurant._id}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const waitlist = data.waitlist || [];
        const settings = data.settings || {};

        // Calculate statistics
        const totalWaiting = waitlist.filter(
          (entry: any) => entry.status === "waiting"
        ).length;
        const totalCalled = waitlist.filter(
          (entry: any) => entry.status === "called"
        ).length;
        const totalSeated = waitlist.filter(
          (entry: any) => entry.status === "seated"
        ).length;

        // Calculate average wait time for waiting customers
        const waitingEntries = waitlist.filter(
          (entry: any) => entry.status === "waiting"
        );
        const avgWaitTime =
          waitingEntries.length > 0
            ? Math.round(
                waitingEntries.reduce(
                  (sum: number, entry: any) => sum + entry.estimatedWaitTime,
                  0
                ) / waitingEntries.length
              )
            : 0;

        setStats({
          totalWaiting,
          totalCalled,
          totalSeated,
          avgWaitTime,
          capacity: settings.maxCapacity || 0,
        });
      }
    } catch (err) {
      console.error("Error fetching waitlist stats:", err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (user && restaurant) {
      fetchStats();
      const interval = setInterval(fetchStats, 30000);
      return () => clearInterval(interval);
    }
  }, [user, restaurant]);

  const formatWaitTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (!user || !restaurant) {
    return null;
  }

  return (
    <Card className='mt-5'>
      <CardHeader>
        <CardTitle>Waitlist Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className='text-center py-4'>
            <p className='text-gray-600'>Loading stats...</p>
          </div>
        ) : (
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-center'>
            <div className='p-4 bg-blue-50 rounded-lg'>
              <p className='text-2xl font-bold text-blue-600'>
                {stats.totalWaiting}
              </p>
              <p className='text-sm text-gray-600'>Currently Waiting</p>
            </div>
            <div className='p-4 bg-green-50 rounded-lg'>
              <p className='text-2xl font-bold text-green-600'>
                {stats.totalCalled}
              </p>
              <p className='text-sm text-gray-600'>Called</p>
            </div>
            <div className='p-4 bg-purple-50 rounded-lg'>
              <p className='text-2xl font-bold text-purple-600'>
                {stats.avgWaitTime > 0
                  ? formatWaitTime(stats.avgWaitTime)
                  : "N/A"}
              </p>
              <p className='text-sm text-gray-600'>Avg Wait Time</p>
            </div>
            <div className='p-4 bg-gray-50 rounded-lg'>
              <p className='text-2xl font-bold text-gray-600'>
                {stats.capacity > 0
                  ? `${stats.totalWaiting + stats.totalCalled}/${stats.capacity}`
                  : "N/A"}
              </p>
              <p className='text-sm text-gray-600'>Capacity</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
