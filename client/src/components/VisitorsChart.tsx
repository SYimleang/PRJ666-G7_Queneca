"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

type VisitorData = {
  _id: string;
  count: number;
};

const VisitorsChart = ({
  range,
}: {
  range: "daily" | "weekly" | "monthly";
}) => {
  const [data, setData] = useState<VisitorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useUser();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${apiUrl}/api/analytics/visitors?range=${range}`,
          {
            headers: {
              Authorization: user?.token ? `Bearer ${user.token}` : "",
            },
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.statusText}`);
        }

        const json = await res.json();
        setData(json);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [range]);

  return (
    <div className="mb-10 items-center">
      <h2 className="text-lg font-bold mb-2 text-center">Visitors ({range})</h2>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">Error: {error}</p>
      ) : (
        <LineChart
          width={1000}
          height={300}
          data={data}
          className="mx-auto rounded-lg"
        >
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="_id" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#8884d8" />
        </LineChart>
      )}
    </div>
  );
};

export default VisitorsChart;
