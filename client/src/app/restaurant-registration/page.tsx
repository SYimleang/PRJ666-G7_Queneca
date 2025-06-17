"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useUser } from "../../context/UserContext";
import { useRestaurant } from "../../context/RestaurantContext";
import dotenv from "dotenv";
dotenv.config();
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  name: z.string(),
  phone: z.string(),
  address: z.string(),
  city: z.string(),
  region: z.string(),
  zip: z.string(),
  openHour: z.string(),
  closeHour: z.string(),
  logo: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function RestaurantForm() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  const { user, setUser } = useUser();
  const { setRestaurant } = useRestaurant();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      city: "",
      region: "",
      zip: "",
      openHour: "",
      closeHour: "",
      logo: "",
    } as FormValues,
  });

  const onSubmit = async (data: FormValues) => {
    const dataToSend = {
      name: data.name,
      phone: data.phone,
      logo: data.logo,
      location: {
        address: data.address,
        city: data.city,
        region: data.region,
        zip: data.zip,
      },
      hours: {
        open: data.openHour,
        close: data.closeHour,
      },
    };
    try {
      if (!user) {
        alert("user not found");
        return;
      }
      const response = await fetch(`${apiUrl}/api/restaurants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Something went wrong");
      }

      // update user context
      setUser({
        ...user,
        role: "admin", // backend is updating user role and would have already throwed error if failed
        restaurantId: result.restaurant._id,
        token: result.token,
      });
      console.log("restaurant-registration fetch result ", result);

      // update restaurant context
      setRestaurant(result.restaurant);

      // re-route
      router.push("/admin");
      alert("Successfully registered restaurant");

      console.log("Success:", result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error:", error.message);
        alert(error.message);
      } else {
        console.error("Unexpected error:", error);
        alert("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="min-h-screen flex justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className=" w-full max-w-md mb-15 p-1 rounded-xl ">
        <div className="w-full mt-10 max-w-md p-6 rounded-xl bg-white shadow-lg border border-red-100">
          <div className="flex justify-center mb-4">
            <Image src="/logo.png" alt="Logo" width={250} height={100} />
          </div>
          <h2 className="text-red-600 text-2xl font-bold mb-4 text-center mt-8">
            Restaurant Registration
          </h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Restaurant Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-red-500">
                      Restaurant Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-amber-50 border-red-200 focus:border-red-400 "
                        type="text"
                        placeholder="Restaurant Name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-red-500">Address</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-amber-50 border-red-200 focus:border-red-400 "
                        type="text"
                        placeholder="123 street"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Region */}
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-red-500">
                        Province/State
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-amber-50 border-red-200 focus:border-red-400 "
                          type="text"
                          placeholder="ON"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* City */}
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-red-500">City</FormLabel>
                      <FormControl>
                        <Input
                          className="bg-amber-50 border-red-200 focus:border-red-400 "
                          type="text"
                          placeholder="Toronto"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Postal Code*/}
              <FormField
                control={form.control}
                name="zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-red-500">Postal Code</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-amber-50 border-red-200 focus:border-red-400 "
                        type="text"
                        placeholder="M2X 4N3"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-red-500">Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-amber-50 border-red-200 focus:border-red-400 "
                        type="text"
                        placeholder="333-333-3333"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Opening Hour */}
                <FormField
                  control={form.control}
                  name="openHour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-red-500">
                        Opening Hour
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-amber-50 border-red-200 focus:border-red-400 "
                          type="text"
                          placeholder="3"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Closing Hour */}
                <FormField
                  control={form.control}
                  name="closeHour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-red-500">
                        Closing Hour
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-amber-50 border-red-200 focus:border-red-400 "
                          type="text"
                          placeholder="8"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Role default hidden customer dont think needed*/}
              {/* <input type="hidden" value="customer" {...form.register('role')} /> */}

              <div className="flex space-x-5 justify-center items-center">
                {/* Submit Button */}
                <Button
                  type="button"
                  className="w-40 bg-red-600 hover:bg-red-500 text-white"
                  onClick={router.back}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-40 bg-red-600 hover:bg-red-500 text-white"
                >
                  Register
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
