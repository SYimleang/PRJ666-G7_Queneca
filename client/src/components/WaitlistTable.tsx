/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/context/UserContext";
import { useRestaurant } from "@/context/RestaurantContext";
import TooltipWrapper from "./TooltipWrapper";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

interface WaitlistEntry {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  partySize: number;
  notes?: string;
  position: number;
  estimatedWaitTime: number;
  joinedAt: string;
  status:
    | "waiting"
    | "called"
    | "seated"
    | "cancelled"
    | "no-show"
    | "completed";
  calledAt?: string;
}

interface WaitlistSettings {
  maxCapacity: number;
  estimatedWaitTimePerCustomer: number;
  isEnabled: boolean;
}

type VisitEntry = {
  date: string;
  partySize: number;
  notes?: string;
  stars?: number;
  message?: string;
};

export default function WaitlistTable() {
  const { user } = useUser();
  const { restaurant } = useRestaurant();
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [filteredWaitlist, setFilteredWaitlist] = useState<WaitlistEntry[]>([]);
  const [settings, setSettings] = useState<WaitlistSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  type VisitHistory = VisitEntry[];

  // Fetch waitlist data
  const fetchWaitlist = async () => {
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
        const waitlistData = data.waitlist || [];
        setWaitlist(waitlistData);
        setFilteredWaitlist(waitlistData);
        setSettings(data.settings || null);
        setError("");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to fetch waitlist");
      }
    } catch (err) {
      console.error("Error fetching waitlist:", err);
      setError("Failed to fetch waitlist");
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (user && restaurant) {
      fetchWaitlist();
      const interval = setInterval(fetchWaitlist, 30000);
      return () => clearInterval(interval);
    }
  }, [user, restaurant]);

  // Filter waitlist based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredWaitlist(waitlist);
    } else {
      const filtered = waitlist.filter(
        (entry) =>
          entry.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.customerPhone.includes(searchTerm)
      );
      setFilteredWaitlist(filtered);
    }
  }, [searchTerm, waitlist]);

  // Call customer
  const callCustomer = async (entryId: string) => {
    if (!user) return;

    setActionLoading(entryId);
    try {
      const response = await fetch(`${apiUrl}/api/waitlist/call/${entryId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        await fetchWaitlist(); // Refresh the list
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to call customer");
      }
    } catch (err) {
      console.error("Error calling customer:", err);
      setError("Failed to call customer");
    } finally {
      setActionLoading("");
    }
  };

  // Mark customer as seated
  const seatCustomer = async (entryId: string) => {
    if (!user) return;

    setActionLoading(entryId);
    try {
      const response = await fetch(`${apiUrl}/api/waitlist/seat/${entryId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        await fetchWaitlist(); // Refresh the list
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to seat customer");
      }
    } catch (err) {
      console.error("Error seating customer:", err);
      setError("Failed to seat customer");
    } finally {
      setActionLoading("");
    }
  };

  // Mark customer as no-show
  const markNoShow = async (entryId: string) => {
    if (!user) return;

    if (!confirm("Are you sure you want to mark this customer as no-show?")) {
      return;
    }

    setActionLoading(entryId);
    try {
      const response = await fetch(
        `${apiUrl}/api/waitlist/no-show/${entryId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        await fetchWaitlist(); // Refresh the list
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to mark as no-show");
      }
    } catch (err) {
      console.error("Error marking no-show:", err);
      setError("Failed to mark as no-show");
    } finally {
      setActionLoading("");
    }
  };

  // Remove customer from waitlist
  const removeCustomer = async (entryId: string) => {
    if (!user) return;

    if (
      !confirm(
        "Are you sure you want to remove this customer from the waitlist?"
      )
    ) {
      return;
    }

    setActionLoading(entryId);
    try {
      const response = await fetch(
        `${apiUrl}/api/waitlist/admin/remove/${entryId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: "Removed by admin",
          }),
        }
      );

      if (response.ok) {
        await fetchWaitlist(); // Refresh the list
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to remove customer");
      }
    } catch (err) {
      console.error("Error removing customer:", err);
      setError("Failed to remove customer");
    } finally {
      setActionLoading("");
    }
  };

  const formatWaitTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPhone = (phone: string): string => {
    if (phone.length === 10) {
      return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
    }
    return phone;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "waiting":
        return "bg-blue-100 text-blue-800";
      case "called":
        return "bg-green-100 text-green-800";
      case "seated":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no-show":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case "waiting":
        return "Waiting";
      case "called":
        return "Called";
      case "seated":
        return "Seated";
      case "cancelled":
        return "Cancelled";
      case "no-show":
        return "No Show";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  if (!user || !restaurant) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Please log in to view waitlist</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Waitlist Management</CardTitle>
          <div className="flex items-center gap-4">
            <Button
              onClick={fetchWaitlist}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
            {settings && (
              <div className="text-sm text-gray-600">
                {waitlist.length} / {settings.maxCapacity} capacity
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search by customer name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          {filteredWaitlist.length !== waitlist.length && (
            <div className="text-sm text-gray-600">
              Showing {filteredWaitlist.length} of {waitlist.length} customers
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading waitlist...</p>
          </div>
        ) : waitlist.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No customers in waitlist</p>
          </div>
        ) : filteredWaitlist.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No customers match your search</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 font-semibold">#</th>
                  <th className="text-left p-3 font-semibold">Customer</th>
                  <th className="text-left p-3 font-semibold">Party</th>
                  <th className="text-left p-3 font-semibold">Wait Time</th>
                  <th className="text-left p-3 font-semibold">Joined</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWaitlist.map((entry, index) => (
                  <tr
                    key={entry.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      entry.status === "called" ? "bg-green-50" : ""
                    }`}
                  >
                    <td className="p-3">
                      <span className="font-bold text-lg text-blue-600">
                        {entry.position}
                      </span>
                    </td>
                    <td className="p-3">
                      <TooltipWrapper
                        customerId={entry.customerId}
                        apiToken={user.token}
                        renderContent={renderHistory}
                      >
                        <p className="font-medium cursor-pointer underline underline-offset-2 text-blue-600 hover:text-blue-800">
                          {entry.customerName}
                        </p>
                      </TooltipWrapper>
                      <div>
                        <p className="text-sm text-gray-600">
                          {formatPhone(entry.customerPhone)}
                        </p>
                        {entry.notes && (
                          <p className="text-xs text-gray-500 mt-1">
                            Note: {entry.notes}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-lg font-semibold">
                        {entry.partySize}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm font-medium">
                        {formatWaitTime(entry.estimatedWaitTime)}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        <p>{formatTime(entry.joinedAt)}</p>
                        {entry.calledAt && (
                          <p className="text-green-600 font-medium">
                            Called: {formatTime(entry.calledAt)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          entry.status
                        )}`}
                      >
                        {getStatusText(entry.status)}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2 flex-wrap">
                        {entry.status === "waiting" && (
                          <>
                            <Button
                              onClick={() => callCustomer(entry.id)}
                              disabled={actionLoading === entry.id}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {actionLoading === entry.id ? "..." : "Call"}
                            </Button>
                            <Button
                              onClick={() => removeCustomer(entry.id)}
                              disabled={actionLoading === entry.id}
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              {actionLoading === entry.id ? "..." : "Remove"}
                            </Button>
                          </>
                        )}
                        {entry.status === "called" && (
                          <>
                            <Button
                              onClick={() => seatCustomer(entry.id)}
                              disabled={actionLoading === entry.id}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              {actionLoading === entry.id ? "..." : "Seat"}
                            </Button>
                            <Button
                              onClick={() => markNoShow(entry.id)}
                              disabled={actionLoading === entry.id}
                              size="sm"
                              variant="outline"
                              className="border-orange-300 text-orange-600 hover:bg-orange-50"
                            >
                              {actionLoading === entry.id ? "..." : "No Show"}
                            </Button>
                            <Button
                              onClick={() => removeCustomer(entry.id)}
                              disabled={actionLoading === entry.id}
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              {actionLoading === entry.id ? "..." : "Remove"}
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">Waitlist Actions Guide:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              • <strong>Call:</strong> Notify customer their table is ready
            </li>
            <li>
              • <strong>Seat:</strong> Mark customer as seated (completes their
              waitlist)
            </li>
            <li>
              • <strong>No Show:</strong> Mark customer as no-show if they
              don&apos;t arrive
            </li>
            <li>
              • <strong>Remove:</strong> Remove customer from waitlist entirely
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );

  function renderHistory(history: VisitHistory) {
    const { waitlistHistory, reviews } = history;

    if (!history || history.length === 0) {
      return <p className="text-sm text-gray-500">No visit history found.</p>;
    }

    return (
      <div className="space-y-2 text-sm">
        <p className="font-semibold">Visited:</p>
        {waitlistHistory.map((visit, i) => (
          <div key={visit.id} className="border-b pb-1 last:border-none">
            <p>
              {new Date(visit.joinedAt).toLocaleDateString()} — Party of{" "}
              {visit.partySize}
            </p>
            {visit.notes && (
              <p className="text-xs text-gray-500">Note: {visit.notes}</p>
            )}
          </div>
        ))}
        {reviews.length > 0 && (
          <div className="pt-2">
            <p className="font-semibold">Reviews:</p>
            {reviews.map((r) => (
              <div key={r.id} className="text-yellow-600 text-sm">
                ⭐ {r.rating}/5 {r.comment && <span>— {r.comment}</span>}
              </div>
            ))}
          </div>
        )}
        {waitlistHistory.length === 0 && reviews.length === 0 && (
          <p className="text-gray-400 italic">No history available.</p>
        )}
      </div>
    );
  }
}
