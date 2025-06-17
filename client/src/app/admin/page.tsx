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

export default function AdminDashboardPage() {
  const { restaurant } = useRestaurant();
  const { user } = useUser();

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
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {restaurant ? (
            <div>
              <Image
                src={restaurant.logoUrl || "/restaurant_logo.png"}
                alt="Restaurant Logo"
                width={100}
                height={100}
              />
              <h2 className="text-xl font-semibold mt-4">{restaurant.name}</h2>
              <p>{restaurant.phone}</p>
              <p>
                {restaurant.location.address}, {restaurant.location.city},{" "}
                {restaurant.location.region} {restaurant.location.zip}
              </p>
              <p>
                Hours: {restaurant.hours.open} - {restaurant.hours.close}
              </p>
            </div>
          ) : (
            <></>
          )}

          <div className="flex flex-col items-center justify-center border rounded-lg p-6 bg-gray-50">
            {restaurant?.qrCode ? (
              <Image
                src={restaurant.qrCode}
                alt="QR Code"
                width={150}
                height={150}
                className="mb-4"
              />
            ) : (
              <></>
            )}
            <Button
              onClick={printQRCode}
              className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Print QR Code
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Waitlist Summary */}
      <Card>
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
