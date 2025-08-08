"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";

const hours = Array.from({ length: 24 }, (_, i) => i); // 0 to 23
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const PeakHoursHeatmap = () => {
  const { user } = useUser() || null;

  const [showLoading, setShowLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [heatmap, setHeatmap] = useState<number[][]>(
    Array(7)
      .fill(null)
      .map(() => Array(24).fill(0))
  );

  useEffect(() => {
    const fetchHeatmap = async () => {
      if (!user) {
        setError("User not authenticated");
        setShowLoading(false);
        return;
      }
      try {
        setShowLoading(true);

        const response = await fetch(`${apiUrl}/api/analytics/peak-hours`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to fetch peak hours stats"
          );
        }

        const data = await response.json();

        const matrix = Array(7)
          .fill(null)
          .map(() => Array(24).fill(0));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.forEach((entry: any) => {
          console.log(
            "Peak hours data:",
            entry.dayOfWeek,
            entry.hour,
            entry.count
          );
          const dayIdx = (entry.dayOfWeek + 5) % 7; // Mongo Sunday=1 → Sun=0
          const hour = entry.hour;
          matrix[dayIdx][hour] = entry.count;
        });

        setHeatmap(matrix);
        setError("");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Error fetching peak hours:", err);
        setError(err.message || "Failed to fetch peak hours stats");
      } finally {
        setShowLoading(false);
      }
    };

    fetchHeatmap();
  }, [user?.token]);
  //

  return (
    <div className="mb-10">
      <h2 className="text-lg font-bold mb-2 text-center">Peak Hours Heatmap</h2>
      <h3 className="text-sm text-center mb-4">
        {new Date().toLocaleString("default", { month: "long" })}
      </h3>
      {showLoading ? (
        <p className="text-center">Loading heatmap...</p>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <div className="grid grid-cols-25 gap-1">
          <div></div>
          {hours.map((h) => (
            <div key={h} className="text-xs text-left">
              {h}
            </div>
          ))}
          {days.map((day, dayIdx) => (
            <React.Fragment key={day}>
              <div className="text-xs">{day}</div>
              {hours.map((hour) => {
                const value = heatmap[dayIdx][hour];
                const intensity = value > 0 ? Math.floor(value * 120) : 0;
                return (
                  <div
                    key={`${day}-${hour}`}
                    className="w-4 h-4"
                    style={{
                      backgroundColor: `rgb(248, ${255 - intensity}, ${
                        255 - intensity
                      })`,
                    }}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default PeakHoursHeatmap;
