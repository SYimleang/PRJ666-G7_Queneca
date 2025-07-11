"use client";

import WaitlistSummary from "@/components/WaitlistSummary";
import WaitlistTable from "@/components/WaitlistTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";
import { useRestaurant } from "@/context/RestaurantContext";

export default function StaffDashboardPage() {
  const { user } = useUser();
  const { restaurant } = useRestaurant();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {user ? `Welcome, ${user.name}` : "Staff Dashboard"}
        </h1>
        {restaurant && (
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-800">{restaurant.name}</p>
            <p className="text-sm text-gray-600">Staff Management</p>
          </div>
        )}
      </div>

      {/* Restaurant Info Card */}
      {restaurant && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Restaurant Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-lg font-semibold text-gray-800">{restaurant.name}</p>
                <p className="text-gray-600">{restaurant.phone}</p>
                <p className="text-gray-600">
                  {restaurant.location.address}, {restaurant.location.city},{" "}
                  {restaurant.location.region} {restaurant.location.zip}
                </p>
              </div>
              <div>
                {Array.isArray(restaurant.hours) && restaurant.hours.length > 0 ? (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Operating Hours</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      {restaurant.hours.slice(0, 3).map((hour) => (
                        <div key={hour.day} className="flex justify-between">
                          <span>{hour.day}</span>
                          <span>
                            {hour.open && hour.close ? `${hour.open} - ${hour.close}` : "Closed"}
                          </span>
                        </div>
                      ))}
                      {restaurant.hours.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{restaurant.hours.length - 3} more days
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">Operating hours not set</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Waitlist Summary */}
      <WaitlistSummary />

      {/* Waitlist Management Table */}
      <div className="mt-6">
        <WaitlistTable />
      </div>
    </div>
  );
}
