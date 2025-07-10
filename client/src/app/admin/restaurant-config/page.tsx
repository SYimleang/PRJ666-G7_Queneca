"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/context/UserContext";
import { useRestaurant } from "@/context/RestaurantContext";
import { useState, useEffect } from "react";

// Days of the week
const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Schema for daily hours
const hoursSchema = z.object({
  day: z.string(),
  open: z.string(),
  close: z.string(),
});

const formSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(2),
  province: z.string().min(2),
  city: z.string().min(2),
  zip: z.string().min(4),
  phone: z.string().min(7),
  hours: z.array(hoursSchema),
  logoUrl: z
    .string()
    .url({ message: "Must be a valid URL" })
    .regex(/\.(jpg|jpeg|png|webp|gif|svg)$/i, {
      message: "Logo must be an image URL (.jpg, .png, etc.)",
    }),
});

type FormValues = z.infer<typeof formSchema>;

export default function RestaurantSettingsPage() {
  const { user } = useUser();
  const { restaurant, setRestaurant } = useRestaurant();
  const router = useRouter();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      province: "",
      city: "",
      zip: "",
      phone: "",
      hours: daysOfWeek.map((day) => ({
        day,
        open: "09:00",
        close: "21:00",
      })),
      logoUrl: "",
    },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "hours",
  });

  useEffect(() => {
    fetchRestaurant();
  }, [restaurant]);

  const fetchRestaurant = async () => {
    try {
      const token = user?.token;
      const res = await fetch(
        `${apiUrl}/api/restaurants/${user?.restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      const restaurantData = data.restaurant ?? data;

      // Default fallback hours
      const defaultHours = daysOfWeek.map((day) => ({
        day,
        open: "",
        close: "",
      }));

      // Use hours only if it's a non-empty array
      const currentHours =
        Array.isArray(restaurantData.hours) && restaurantData.hours.length > 0
          ? restaurantData.hours
          : defaultHours;

      form.reset({
        zip: restaurantData.location.zip,
        name: restaurantData.name,
        address: restaurantData.location.address,
        province: restaurantData.location.region,
        city: restaurantData.location.city,
        phone: restaurantData.phone,
        hours: currentHours,
        logoUrl: restaurantData.logoUrl,
      });

      replace(currentHours);
    } catch (err) {
      console.error("Error loading restaurant:", err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    console.log("Submitted:", data);
    try {
      setError(null);
      setSuccess(null);
      const restaurantId = user?.restaurantId;
      const token = user?.token;

      const payload = {
        name: data.name,
        phone: data.phone,
        location: {
          address: data.address,
          city: data.city,
          region: data.province,
          zip: data.zip,
        },
        hours: data.hours,
        logoUrl: data.logoUrl,
      };

      const res = await fetch(`${apiUrl}/api/restaurants/${restaurantId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to update restaurant");
      }

      setRestaurant(result.restaurant);

      console.log("Updated restaurant:", result.restaurant);
      setSuccess("Restaurant config updated successfully!");
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Update failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update restaurant config",
      );
    }
  };

  return (
    <div className="container mx-auto p-6">
      <AdminNav></AdminNav>
      <Separator className="mt-5 mb-5" />
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Restaurant Configuration</h1>
        <p className="text-gray-600">
          Configure the information your customers see
        </p>
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <Card>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Basic Fields */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Restaurant Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Golden Spoon" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="(123) 456-7890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Toronto" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Province</FormLabel>
                        <FormControl>
                          <Input placeholder="Ontario" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="zip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="M4B 1B3" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/logo.png"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* Hours Section */}
                <div>
                  <h3 className="text-lg font-semibold">Operating Hours</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex items-center gap-2 justify-between"
                      >
                        {/* Hidden input to register the day so it's tracked in the form */}
                        <input
                          type="hidden"
                          {...form.register(`hours.${index}.day`)}
                        />

                        {/* Display the day label using the current form value */}
                        <span className="w-24 font-medium">
                          {form.getValues(`hours.${index}.day`)}
                        </span>

                        {/* Open time input */}
                        <FormField
                          control={form.control}
                          name={`hours.${index}.open`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel className="text-sm">Open</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Close time input */}
                        <FormField
                          control={form.control}
                          name={`hours.${index}.close`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel className="text-sm">Close</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button onClick={router.back} type="reset" variant="outline">
                    Cancel
                  </Button>
                  <Button className="bg-red-500 hover:bg-red-600" type="submit">
                    Save Settings
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
