"use client";

import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useUser } from "../context/UserContext";
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
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
  name: z.string().optional(),
  confirmPassword: z.string().optional(),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AdminAuthForm() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  const [isSignup, setIsSignup] = useState(false);
  const searchParams = useSearchParams();
  const { setUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    const mode = searchParams.get("mode");
    setIsSignup(mode === "signup");
  }, [searchParams]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
    },
  });

  // Reset form when switching between login and signup
  useEffect(() => {
    form.reset({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
    });
  }, [isSignup, form]);

  const onSubmit = async (data: FormValues) => {
    const endpoint = isSignup ? "register" : "login";

    let dataToSend = { ...data, role: "admin" as const };

    // Custom validation for signup
    if (isSignup) {
      if (!data.name || data.name.trim().length < 2) {
        alert("Name must be at least 2 characters");
        return;
      }
      if (
        !data.phone ||
        !/^(\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}$/.test(data.phone)
      ) {
        alert("Please enter a valid phone number");
        return;
      }
      if (!data.confirmPassword) {
        alert("Please confirm your password");
        return;
      }
      if (data.password !== data.confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      // Remove confirmPassword from the data to send to the API
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...rest } = dataToSend;
      dataToSend = rest;
    } else {
      // For login, we don't need to send role
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { role, ...loginData } = dataToSend;
      dataToSend = loginData;
    }

    try {
      const response = await fetch(`${apiUrl}/api/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Something went wrong");
      }

      if (!isSignup) {
        type DecodedToken = {
          name: string;
          email: string;
          role: "admin" | "staff" | "customer";
          phone: string;
        };

        const decoded = jwtDecode<DecodedToken>(result.token);
        console.log("Decoded Token:", decoded);

        // Verify the user is actually an admin
        if (decoded.role !== "admin") {
          alert("Access denied. This login is for administrators only.");
          return;
        }

        // Update context
        setUser({
          name: decoded.name,
          email: decoded.email,
          role: decoded.role,
          token: result.token,
          phone: decoded.phone,
        });

        // Redirect to admin dashboard
        router.push("/admin");
      } else {
        alert("Admin account created successfully! Please log in.");
        router.push("/admin/auth?mode=login");
      }
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
    <div className='w-full max-w-md mt-15 p-6 rounded-xl bg-white shadow-lg border border-red-100'>
      <div className='flex justify-center mb-4'>
        <Image src='/logo.png' alt='Logo' width={250} height={100} />
      </div>
      <div className='text-center mb-6'>
        <h2 className='text-red-600 text-2xl font-bold mb-2'>
          Admin {isSignup ? "Sign Up" : "Sign In"}
        </h2>
        <p className='text-gray-600 text-sm'>
          {isSignup
            ? "Create your administrator account"
            : "Access the admin dashboard"}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          {/* Name */}
          {isSignup && (
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-red-500'>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      className='bg-amber-50 border-red-200 focus:border-red-400'
                      type='text'
                      placeholder='Enter your full name'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Email */}
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-red-500'>Email</FormLabel>
                <FormControl>
                  <Input
                    className='bg-amber-50 border-red-200 focus:border-red-400'
                    type='email'
                    placeholder='admin@example.com'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone */}
          {isSignup && (
            <FormField
              control={form.control}
              name='phone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-red-500'>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      className='bg-amber-50 border-red-200 focus:border-red-400'
                      type='text'
                      placeholder='333-333-3333'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Password */}
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-red-500'>Password</FormLabel>
                <FormControl>
                  <Input
                    className='bg-amber-50 border-red-200 focus:border-red-400'
                    type='password'
                    placeholder='&#9679;&#9679;&#9679;&#9679;&#9679;'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm Password (only for Sign Up) */}
          {isSignup && (
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-red-500'>
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      className='bg-amber-50 border-red-200 focus:border-red-400'
                      type='password'
                      placeholder='Confirm your password'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Submit Button */}
          <Button
            type='submit'
            className='w-full bg-red-600 hover:bg-red-500 text-white py-3 font-semibold'
          >
            {isSignup ? "Create Admin Account" : "Sign In to Admin"}
          </Button>
        </form>
      </Form>

      <div className='text-sm mt-6 text-center'>
        {isSignup ? (
          <>
            Already have an admin account?{" "}
            <button
              className='text-red-600 hover:underline font-medium'
              onClick={() => {
                setIsSignup(false);
                router.push("/admin/auth?mode=login");
              }}
            >
              Sign In
            </button>
          </>
        ) : (
          <>
            Need to create an admin account?{" "}
            <button
              className='text-red-600 hover:underline font-medium'
              onClick={() => {
                setIsSignup(true);
                router.push("/admin/auth?mode=signup");
              }}
            >
              Sign Up
            </button>
          </>
        )}
      </div>

      <div className='text-center mt-4'>
        <Button
          variant='ghost'
          className='text-gray-500 hover:text-gray-700'
          onClick={() => router.push("/auth")}
        >
          ← Back to General Login
        </Button>
      </div>
    </div>
  );
}
