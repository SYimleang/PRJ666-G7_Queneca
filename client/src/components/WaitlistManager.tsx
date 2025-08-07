"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { useGameContext } from "@/context/GameContext";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

interface WaitlistEntry {
  id: string;
  restaurantName?: string;
  position: number;
  estimatedWaitTime: number;
  partySize: number;
  notes?: string;
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

interface WaitlistManagerProps {
  restaurantId: string;
  restaurantName: string;
  isOpen: boolean;
}

export default function WaitlistManager({
  restaurantId,
  restaurantName,
  isOpen,
}: WaitlistManagerProps) {
  const { user } = useUser();
  const router = useRouter();
  const [waitlistEntry, setWaitlistEntry] = useState<WaitlistEntry | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [partySize, setPartySize] = useState<number>(2);
  const [notes, setNotes] = useState<string>("");
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);
  const { triggerGame } = useGameContext();

  const playRandomGame = () => {
    triggerGame();
  };

  // Check for existing waitlist entry on mount
  useEffect(() => {
    if (user && restaurantId) {
      checkWaitlistStatus();
    }
  }, [user, restaurantId]);

  // Set up polling for real-time updates when user has an active entry
  useEffect(() => {
    if (
      waitlistEntry &&
      (waitlistEntry.status === "waiting" ||
        waitlistEntry.status === "called" ||
        waitlistEntry.status === "seated")
    ) {
      // Poll every 30 seconds for real-time updates
      pollInterval.current = setInterval(() => {
        checkWaitlistStatus(false);
      }, 30000);
    } else {
      // Clear polling if no active entry
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
        pollInterval.current = null;
      }
    }

    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, [waitlistEntry]);

  const checkWaitlistStatus = async (showLoading = true) => {
    if (!user) return;

    try {
      if (showLoading) setIsCheckingStatus(true);

      const response = await fetch(
        `${apiUrl}/api/waitlist/status/${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setWaitlistEntry(data.waitlistEntry);
        setError("");
      } else if (response.status === 404) {
        // No active waitlist entry
        setWaitlistEntry(null);
        setError("");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to check waitlist status");
      }
    } catch (err) {
      console.error("Error checking waitlist status:", err);
      if (showLoading) {
        setError("Failed to check waitlist status");
      }
    } finally {
      if (showLoading) setIsCheckingStatus(false);
    }
  };

  const joinWaitlist = async () => {
    if (!user) {
      router.push("/auth");
      return;
    }

    if (partySize < 1 || partySize > 20) {
      setError("Party size must be between 1 and 20");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${apiUrl}/api/waitlist/join/${restaurantId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            partySize,
            notes: notes.trim() || undefined,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setWaitlistEntry({
          ...data.waitlistEntry,
          restaurantName,
        });
        setSuccess("Successfully joined the waitlist!");
        setShowJoinForm(false);
        setPartySize(2);
        setNotes("");
      } else {
        setError(data.message || "Failed to join waitlist");
      }
    } catch (err) {
      console.error("Error joining waitlist:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const cancelWaitlist = async () => {
    if (!waitlistEntry || !user) return;

    if (
      !confirm("Are you sure you want to cancel your waitlist reservation?")
    ) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${apiUrl}/api/waitlist/cancel/${waitlistEntry.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            reason: "Customer cancelled",
          }),
        }
      );

      if (response.ok) {
        setWaitlistEntry(null);
        setSuccess("Your waitlist reservation has been cancelled.");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to cancel waitlist entry");
      }
    } catch (err) {
      console.error("Error cancelling waitlist:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatWaitTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "waiting":
        return "text-blue-600";
      case "called":
        return "text-green-600";
      case "seated":
        return "text-gray-600";
      case "cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusMessage = (status: string): string => {
    switch (status) {
      case "waiting":
        return "You're in the queue";
      case "called":
        return "🎉 You've been called! Please head to the restaurant";
      case "seated":
        return "Enjoy your meal!";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  if (!user) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <p className="text-gray-600 mb-4">
            Please log in to join the waitlist
          </p>
          <Button
            onClick={() => router.push("/auth")}
            className="bg-red-600 hover:bg-red-700"
          >
            Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isCheckingStatus) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Checking waitlist status...</p>
        </CardContent>
      </Card>
    );
  }

  // Show current waitlist status if user has an active entry
  if (
    waitlistEntry &&
    (waitlistEntry.status === "waiting" ||
      waitlistEntry.status === "called" ||
      waitlistEntry.status === "seated")
  ) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-xl text-blue-800">
            Your Waitlist Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Position:</span>
                <span className="text-2xl font-bold text-blue-600">
                  #{waitlistEntry.position}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Estimated Wait:</span>
                <span className="text-lg font-semibold text-blue-600">
                  {formatWaitTime(waitlistEntry.estimatedWaitTime)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Party Size:</span>
                <span className="text-lg">{waitlistEntry.partySize}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Status:</span>
                <span
                  className={`text-lg font-semibold ${getStatusColor(
                    waitlistEntry.status
                  )}`}
                >
                  {getStatusMessage(waitlistEntry.status)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Joined:</span>
                <span className="text-sm text-gray-600">
                  {new Date(waitlistEntry.joinedAt).toLocaleTimeString()}
                </span>
              </div>
              {waitlistEntry.calledAt && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Called:</span>
                  <span className="text-sm text-green-600">
                    {new Date(waitlistEntry.calledAt).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {waitlistEntry.notes && (
            <div className="p-3 bg-white rounded-lg border">
              <span className="font-medium text-sm text-gray-600">Notes:</span>
              <p className="text-sm text-gray-800 mt-1">
                {waitlistEntry.notes}
              </p>
            </div>
          )}

          {waitlistEntry.status === "called" && (
            <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
              <p className="text-green-800 font-medium">
                🎉 Great news! Your table is ready. Please head to the
                restaurant within the next 10 minutes.
              </p>
            </div>
          )}

          {waitlistEntry.status === "seated" ? (
            <Button
              onClick={() =>
                router.push(`/leave-review?restaurantId=${restaurantId}`)
              }
              disabled={loading}
              variant="outline"
              className="border-green-600 text-green-800 hover:bg-green-50"
            >
              Give us a review
            </Button>
          ) : (
            <div className="flex gap-3 pt-4">
              <Button
                onClick={cancelWaitlist}
                disabled={loading}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                {loading ? "Cancelling..." : "Cancel Reservation"}
              </Button>
              <Button
                onClick={() => checkWaitlistStatus()}
                disabled={loading}
                variant="outline"
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                Refresh Status
              </Button>
              <Button
                onClick={() => playRandomGame()}
                disabled={loading}
                variant="outline"
                className="border-green-300 text-green-600 hover:bg-green-50"
              >
                Earn Rewards
              </Button>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Show join waitlist form
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Join Waitlist</CardTitle>
      </CardHeader>
      <CardContent>
        {!isOpen && (
          <div className="p-4 mb-4 bg-orange-100 border border-orange-300 rounded-lg">
            <p className="text-orange-800 font-medium">
              ⚠️ This restaurant appears to be closed. Waitlist may not be
              available.
            </p>
          </div>
        )}

        {!showJoinForm ? (
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Join the waitlist for {restaurantName} and we&apos;ll notify you
              when your table is ready!
            </p>
            <Button
              onClick={() => setShowJoinForm(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
            >
              Join Waitlist
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="partySize"
                  className="text-sm font-medium text-gray-700"
                >
                  Party Size *
                </Label>
                <Input
                  id="partySize"
                  type="number"
                  min="1"
                  max="20"
                  value={partySize}
                  onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label
                htmlFor="notes"
                className="text-sm font-medium text-gray-700"
              >
                Special Requests (Optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Any special requests, dietary restrictions, or preferences..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={joinWaitlist}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white flex-1"
              >
                {loading ? "Joining..." : "Join Waitlist"}
              </Button>
              <Button
                onClick={() => {
                  setShowJoinForm(false);
                  setError("");
                  setSuccess("");
                }}
                variant="outline"
                disabled={loading}
              >
                Cancel
              </Button>
            </div>

            {error && (
              <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-100 border border-green-300 rounded-lg">
                <p className="text-green-800 text-sm">{success}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
