"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IWaitlistSettings } from "@/types/restaurant";
import { useRestaurant } from "@/context/RestaurantContext";
import { useUser } from "@/context/UserContext";

export default function WaitlistSettings() {
  const { restaurant } = useRestaurant();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  const [settings, setSettings] = useState<IWaitlistSettings>({
    autoRemoveMinutes: 30,
    maxCapacity: 50,
    estimatedWaitTimePerCustomer: 15,
    tableReadyNotificationMessage:
      "Your table is ready! Please come to the host stand.",
  });

  useEffect(() => {
    fetchWaitlistSettings();
  }, [restaurant]);

  const fetchWaitlistSettings = async () => {
    if (!restaurant?._id) return;

    try {
      setLoading(true);
      const token = user?.token;
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${apiUrl}/api/restaurants/${restaurant._id}/waitlist-settings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch waitlist settings");
      }

      const data = await response.json();
      setSettings(data.waitlistSettings);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load waitlist settings"
      );
    } finally {
      setLoading(false);
    }
  };

  const validateSettings = (): string | null => {
    if (
      !settings.autoRemoveMinutes ||
      settings.autoRemoveMinutes < 1 ||
      settings.autoRemoveMinutes > 1440
    ) {
      return "Auto-remove minutes must be between 1 and 1440 (24 hours)";
    }
    if (
      !settings.maxCapacity ||
      settings.maxCapacity < 1 ||
      settings.maxCapacity > 1000
    ) {
      return "Max capacity must be between 1 and 1000";
    }
    if (
      !settings.estimatedWaitTimePerCustomer ||
      settings.estimatedWaitTimePerCustomer < 1 ||
      settings.estimatedWaitTimePerCustomer > 240
    ) {
      return "Estimated wait time per customer must be between 1 and 240 minutes";
    }
    if (!settings.tableReadyNotificationMessage.trim()) {
      return "Table ready notification message cannot be empty";
    }
    if (settings.tableReadyNotificationMessage.length > 500) {
      return "Table ready notification message cannot exceed 500 characters";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateSettings();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!restaurant?._id) {
      setError("Restaurant information not available");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const token = user?.token;
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${apiUrl}/api/restaurants/${restaurant._id}/waitlist-settings`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(settings),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to update waitlist settings"
        );
      }

      const data = await response.json();
      setSettings(data.waitlistSettings);
      setSuccess("Waitlist settings updated successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update waitlist settings"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({
      autoRemoveMinutes: 30,
      maxCapacity: 50,
      estimatedWaitTimePerCustomer: 15,
      tableReadyNotificationMessage:
        "Your table is ready! Please come to the host stand.",
    });
  };

  if (loading) {
    return (
      <div className='container mx-auto p-6'>
        <div className='flex items-center justify-center'>
          <div className='text-lg'>Loading waitlist settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold'>Waitlist Settings</h1>
        <p className='text-gray-600'>
          Configure how your restaurant's waitlist behaves
        </p>
      </div>

      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
          {error}
        </div>
      )}

      {success && (
        <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4'>
          {success}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Waitlist Configuration</CardTitle>
          <CardDescription>
            Customize your waitlist behavior and customer notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <Label htmlFor='autoRemoveMinutes'>
                  Auto-Remove Timeout (minutes) *
                </Label>
                <Input
                  id='autoRemoveMinutes'
                  type='number'
                  min='1'
                  max='1440'
                  value={settings.autoRemoveMinutes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      autoRemoveMinutes: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder='30'
                  required
                />
                <p className='text-sm text-gray-500 mt-1'>
                  Automatically remove customers from waitlist after this many
                  minutes
                </p>
              </div>

              <div>
                <Label htmlFor='maxCapacity'>Maximum Waitlist Capacity *</Label>
                <Input
                  id='maxCapacity'
                  type='number'
                  min='1'
                  max='1000'
                  value={settings.maxCapacity}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maxCapacity: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder='50'
                  required
                />
                <p className='text-sm text-gray-500 mt-1'>
                  Maximum number of customers allowed on the waitlist
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor='estimatedWaitTimePerCustomer'>
                Estimated Wait Time Per Customer (minutes) *
              </Label>
              <Input
                id='estimatedWaitTimePerCustomer'
                type='number'
                min='1'
                max='240'
                value={settings.estimatedWaitTimePerCustomer}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    estimatedWaitTimePerCustomer: parseInt(e.target.value) || 0,
                  })
                }
                placeholder='15'
                required
              />
              <p className='text-sm text-gray-500 mt-1'>
                Average wait time per customer ahead in line
              </p>
            </div>

            <div>
              <Label htmlFor='tableReadyNotificationMessage'>
                Table Ready Notification Message *
              </Label>
              <textarea
                id='tableReadyNotificationMessage'
                className='w-full p-3 border border-gray-300 rounded-md resize-vertical min-h-[100px]'
                maxLength={500}
                value={settings.tableReadyNotificationMessage}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    tableReadyNotificationMessage: e.target.value,
                  })
                }
                placeholder='Your table is ready! Please come to the host stand.'
                required
              />
              <p className='text-sm text-gray-500 mt-1'>
                Message sent to customers when their table is ready (
                {settings.tableReadyNotificationMessage.length}/500 characters)
              </p>
            </div>

            <div className='bg-gray-50 p-4 rounded-lg'>
              <h3 className='font-medium mb-3'>Current Settings Preview</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                <div>
                  <span className='font-medium'>Auto-Remove:</span>{" "}
                  {settings.autoRemoveMinutes} minutes
                </div>
                <div>
                  <span className='font-medium'>Max Capacity:</span>{" "}
                  {settings.maxCapacity} customers
                </div>
                <div>
                  <span className='font-medium'>Wait Time Per Customer:</span>{" "}
                  {settings.estimatedWaitTimePerCustomer} minutes
                </div>
                <div className='md:col-span-2'>
                  <span className='font-medium'>Notification Message:</span>
                  <p className='mt-1 text-gray-600 italic'>
                    "{settings.tableReadyNotificationMessage}"
                  </p>
                </div>
              </div>
            </div>

            <div className='flex space-x-4'>
              <Button
                type='submit'
                disabled={saving}
                className='bg-blue-600 hover:bg-blue-700'
              >
                {saving ? "Saving..." : "Save Settings"}
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={handleReset}
                disabled={saving}
              >
                Reset to Defaults
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className='mt-6'>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3 text-sm text-gray-600'>
            <div>
              <strong>Auto-Remove Timeout:</strong> Customers will be
              automatically removed from the waitlist if they don't respond
              within the specified timeframe.
            </div>
            <div>
              <strong>Maximum Capacity:</strong> Once the waitlist reaches this
              number, new customers won't be able to join until space becomes
              available.
            </div>
            <div>
              <strong>Estimated Wait Time:</strong> This is multiplied by the
              customer's position in line to give them an estimated wait time.
            </div>
            <div>
              <strong>Notification Message:</strong> This message will be sent
              to customers when their table is ready (via SMS, email, or app
              notification).
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
