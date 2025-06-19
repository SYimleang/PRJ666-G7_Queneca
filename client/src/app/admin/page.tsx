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
import { useState } from "react";

export default function AdminDashboardPage() {
  const { restaurant } = useRestaurant();
  const { user } = useUser();
  const [src, setSrc] = useState(restaurant?.logoUrl || "/restaurant_logo.png");

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
                  <p className="text-gray-700">{restaurant.phone}</p>
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
                    <a
                      href="/admin/restaurant-config"
                      className="inline-block text-sm text-red-600 underline hover:text-red-800"
                    >
                      Set hours here
                    </a>
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

      {/* Waitlist Summary */}
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Waitlist Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-lg font-bold">12</p>
              <p className="text-sm text-muted-foreground">Total Waiting</p>
            </div>
            <div>
              <p className="text-lg font-bold">3</p>
              <p className="text-sm text-muted-foreground">Currently Seated</p>
            </div>
            <div>
              <p className="text-lg font-bold">7m</p>
              <p className="text-sm text-muted-foreground">Avg Wait Time</p>
            </div>
            <div>
              <p className="text-lg font-bold">20</p>
              <p className="text-sm text-muted-foreground">Tables Available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
