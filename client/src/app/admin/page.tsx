// app/admin/page.tsx

"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
// import { Input } from '@/components/ui/input';
import Image from "next/image";
import AdminNav from "@/components/AdminNav";
import { useRestaurant } from "@/context/RestaurantContext";
import { useUser } from "@/context/UserContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import WaitlistSummary from "@/components/WaitlistSummary";
import WaitlistTable from "@/components/WaitlistTable";
import TableCard from "@/components/ui/tableCard";

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
export default function AdminDashboardPage() {
  const { restaurant } = useRestaurant();
  const { user } = useUser();
  const [src, setSrc] = useState(restaurant?.logoUrl || "/restaurant_logo.png");
  const [tables, setTables] = useState<Table[]>([]);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
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
  const printQRCode = () => {
    if (!restaurant?.qrCode) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code</title>
          <style>
            body {
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            img {
              width: 300px;
              height: 300px;
            }
          </style>
        </head>
        <body>
          <img src="${restaurant.qrCode}" alt="QR Code" />
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Give it a moment to render before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
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
      {/* Custom Navbar Slot */}
      <AdminNav></AdminNav>
      <Separator className="mt-5 mb-5" />
      <div className="flex justify-between items-center">
        {user ? (
          <h1 className="mb-5 text-2xl font-bold">
            {user.name}&apos;s Admin Dashboard
          </h1>
        ) : (
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        )}
        <div className="space-x-2"></div>
      </div>

      {/* Restaurant Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Restaurant Info</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
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

              {Array.isArray(restaurant.hours) &&
              restaurant.hours.length > 0 ? (
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

              {/* QR Code on the right */}
              <div className="flex flex-col items-center justify-center border rounded-lg p-4 bg-gray-50">
                {restaurant.qrCode && (
                  <Image
                    src={restaurant.qrCode}
                    alt="QR Code"
                    width={200}
                    height={200}
                    className="mb-4"
                  />
                )}
                <Button
                  onClick={printQRCode}
                  className="w-full bg-red-500 hover:bg-red-600 text-white"
                >
                  Print QR Code
                </Button>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
      {/* Tables */}
      <Card className="mt-6">
        <CardContent>
          <CardTitle className="mb-6 text-xl">Table Management</CardTitle>
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
