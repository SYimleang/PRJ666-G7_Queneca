"use client";

import WaitlistSummary from "@/components/WaitlistSummary";
import WaitlistTable from "@/components/WaitlistTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";
import { useRestaurant } from "@/context/RestaurantContext";
import TableCard from "@/components/ui/tableCard";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Table = {
  _id: string;
  tableNumber: number;
  status: "available" | "occupied";
  seatedParty?: {
    name: string;
    size: number;
  };
  seats: number;
};

export default function StaffDashboardPage() {
  const { user } = useUser();
  const { restaurant } = useRestaurant();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  const [tables, setTables] = useState<Table[]>([]);
  const [src, setSrc] = useState(restaurant?.logoUrl || "/restaurant_logo.png");

  const restaurantId = user?.restaurantId;

  useEffect(() => {
    if (restaurantId) {
      fetchTables();
    }
  }, [restaurantId]);

  const fetchTables = async () => {
    const token = user?.token;
    const res = await fetch(`${apiUrl}/api/tables`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      console.error("Failed to fetch tables");
      return;
    }
    const data = await res.json();
    setTables(data.tables ?? data);
  };
  const handleSeatTable = async (tableId: string) => {
    const token = user?.token;

    const res = await fetch(`${apiUrl}/api/tables/${tableId}/seat`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const updated = await res.json();
      setTables((prev) =>
        prev.map((t) => (t._id === tableId ? updated.table : t))
      );
    }
  };

  const handleClearTable = async (tableId: string) => {
    const token = user?.token;

    const res = await fetch(`${apiUrl}/api/tables/${tableId}/clear`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const updated = await res.json();
      setTables((prev) =>
        prev.map((t) => (t._id === tableId ? updated.table : t))
      );
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {user ? `Welcome, ${user.name}` : "Staff Dashboard"}
        </h1>
      </div>
      {/* Restaurant Info Card */}
      {restaurant && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Restaurant Info</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {restaurant ? (
              <>
                {/* Logo on the left */}
                <div className="relative w-full h-48 md:h-full max-h-[250px]">
                  <Image
                    src={src}
                    alt="Restaurant Logo"
                    fill
                    className="object-contain rounded shadow"
                    onError={() => setSrc("/restaurant_logo.png")}
                  />
                </div>
                {/* Name, phone, address */}

                {/* Hours on the right */}
                <div className="flex flex-col rounded-lg p-4">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {restaurant.name}
                    </h2>

                    <p className="text-gray-700">
                      {restaurant.phone.slice(0, 3)}-
                      {restaurant.phone.slice(3, 6)}-{restaurant.phone.slice(6)}
                    </p>
                    <p className="text-gray-700">
                      {restaurant.location.address}, {restaurant.location.city},{" "}
                      {restaurant.location.region} {restaurant.location.zip}
                    </p>
                  </div>
                  {Array.isArray(restaurant.hours) &&
                  restaurant.hours.length > 0 ? (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Operating Hours
                      </h3>
                      <ul className="mt-2 text-sm text-gray-700 divide-y">
                        {restaurant.hours.map((hour) => (
                          <li
                            key={hour.day}
                            className="flex justify-between py-1 w-72 text-gray-700"
                          >
                            <span className="font-medium">{hour.day}</span>
                            <span>
                              {hour.open && hour.close
                                ? `${hour.open} - ${hour.close}`
                                : "Closed"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-gray-600 mt-4">
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Operating Hours
                        </h3>
                        <p className="mb-1">Operating hours not set.</p>
                        <Link
                          href="/admin/restaurant-config"
                          className="inline-block text-sm text-red-600 underline hover:text-red-800"
                        >
                          Set hours here
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      )}
      {/* Tables */}
      <Card>
        <CardContent>
          <CardTitle className="text-xl">Table Management</CardTitle>
          {tables.length >= 1 ? (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {tables.map((table) => (
                <TableCard
                  key={table._id}
                  table={table}
                  onSeat={handleSeatTable}
                  onClear={handleClearTable}
                />
              ))}
            </div>
          ) : (
            <>Configure tables using admin account to start managing tables</>
          )}
        </CardContent>
      </Card>
      {/* Waitlist Summary */}
      <WaitlistSummary />
      {/* Waitlist Management Table */}
      <div className="mt-6">
        <WaitlistTable />
      </div>
    </div>
  );
}
