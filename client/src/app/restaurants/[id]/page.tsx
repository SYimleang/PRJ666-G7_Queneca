// app/restaurants/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { IRestaurant } from "@/types/restaurant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [src, setSrc] = useState("/restaurant_logo.png");

  useEffect(() => {
    const fetchRestaurant = async () => {
      const res = await fetch(`${apiUrl}/api/restaurants/${id}`);
      const data = await res.json();
      setRestaurant(data.restaurant);
      
      if (data.restaurant.logoUrl) {
        setSrc(data.restaurant.logoUrl);
      }
    };
    fetchRestaurant();
  }, [id]);

  if (!restaurant) return <p className="p-6">Loading...</p>;

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Restaurant Info</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {restaurant ? (
            <>
              {/* Logo on the left */}
              <div className="relative w-full h-48 md:h-full max-h-[250px] justify-center">
                <Image
                  src={src}
                  alt="Restaurant Logo"
                  fill
                  className="object-contain"
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
                    {restaurant.location.address}, {restaurant.location.city},{" "}
                    {restaurant.location.region} {restaurant.location.zip}
                  </p>
                  <p className="text-gray-700">Call: {restaurant.phone.slice(0, 3)}-{restaurant.phone.slice(3, 6)}-{restaurant.phone.slice(6)}</p>

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
              </div>

              <div className="col-span-1 md:col-span-3 text-center mx-auto px-8">
                <Button
                  className="mt-4 bg-red-600 hover:bg-red-500 text-white px-16 py-2 rounded"
                  onClick={() => {
                    window.location.href = ``; // Replace with booking URL
                  }}
                >
                  Book!
                </Button>
              </div>
              
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
