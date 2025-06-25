"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { IRestaurant } from "@/types/restaurant";
import { IMenuItem } from "@/types/menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function RestaurantInfoPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [src, setSrc] = useState("/restaurant_logo.png");
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);
  const categories = ["Appetizer", "Main Course", "Dessert", "Beverage", "Side"];

  // useEffect to fetch restaurant data
  useEffect(() => {
    const fetchRestaurant = async () => {
      const res = await fetch(`${apiUrl}/api/restaurants/${id}`);
      const data = await res.json();
      setRestaurant(data.restaurant);
      
      if (data.restaurant.logoUrl) {
        setSrc(data.restaurant.logoUrl);
      }

      // Fetch the menu
      const menuRes = await fetch(`${apiUrl}/api/menus/restaurant/${data.restaurant._id}`);
      const menuData = await menuRes.json();
      console.log("Menu Data:", menuData);
      if (menuData.menu?.menuItems) {
        setMenuItems(menuData.menu.menuItems);
      }
    };
    fetchRestaurant();
  }, [id]);

  // If restaurant is not loaded yet, show loading state
  if (!restaurant) return <p className="p-6">Loading...</p>;

  return (
    <div className="container mx-auto p-6">
      {/* Restaurant Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Restaurant Info</CardTitle>
        </CardHeader>
        <CardContent className="grid xl:grid-cols-3 lg:grid-cols-2 gap-6 items-center">
          {restaurant ? (
            <>
              {/* Logo on the left */}
              <div className="relative lg:w-full h-48 md:h-full md:w-[150px] max-h-[250px] justify-center">
                <Image
                  src={src}
                  alt="Restaurant Logo"
                  fill
                  className="object-contain"
                  onError={() => setSrc("/restaurant_logo.png")}
                />
              </div>

              {/* Restaurant details in the middle */}
              {Array.isArray(restaurant.hours) &&
              restaurant.hours.length > 0 ? (
                <div className="md:h-full space-y-2">
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
                    className="mb-4 lg:w-[200px] lg:h-[200px] md:w-[100px] md:h-[100px]"
                  />
                )}
              </div>

              <div className="col-span-1 md:col-span-3 text-center mx-auto px-8">
                <Button
                  className="mt-4 bg-red-600 hover:bg-red-500 text-white px-16 py-2 rounded"
                  onClick={() => {
                    window.location.href = ``; // Replace with reserving URL
                  }}
                >
                  Reserve Table
                </Button>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card><br />

      <Card className="mb-6 bg-red-100">
        <CardHeader>
          <CardTitle className="text-2xl text-center ">Restaurant Menu</CardTitle>
        </CardHeader>
      </Card>

      {/* Menu Items */}
      {menuItems.length === 0 ? (
        // Case: No menu at all
        <Card className="mb-6">
          <CardContent>
            <p className="text-gray-500 text-center">No menu available for this restaurant.</p>
          </CardContent>
        </Card>
      ) : (
        // Case: Some categories have menu items
        categories.map((category) => {
          const items = menuItems.filter((item) => item.category === category);
          if (items.length === 0) return null;

          return (
            <Card key={category} className="mb-6">
              <CardHeader>
                <CardTitle className="text-2xl">{category}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="border rounded p-4 bg-white shadow-sm"
                  >
                    <div className="w-full max-w-[250px] mx-auto aspect-[4/3] relative mb-2">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded mb-2 flex items-center justify-center mx-auto">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold">{item.name}</h4>
                      <p className="text-md text-gray-800 mb-2">
                        ${item.price.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Ingredients: {item.ingredients}
                      </p>
                    </div>
                    
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
