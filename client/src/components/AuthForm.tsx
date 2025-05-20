'use client';

import { useForm } from 'react-hook-form';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useUser } from '../context/UserContext';
import dotenv from 'dotenv';
dotenv.config();
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

type FormValues = {
  email: string;
  password: string;
  role?: string;
};

export default function AuthForm() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 5000;
  const [isSignup, setIsSignup] = useState(false);
  const searchParams = useSearchParams();
  const { setUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    const mode = searchParams.get('mode');
    setIsSignup(mode === 'signup');
  }, [searchParams]);

  const form = useForm<FormValues>({
    defaultValues: {
      email: '',
      password: '',
      role: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    const endpoint = isSignup ? 'register' : 'login';
    try {
      const response = await fetch(`${apiUrl}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong');
      }

      if (!isSignup) {
        type DecodedToken = {
          email: string;
          role: 'admin' | 'staff' | 'customer';
        };

        const decoded = jwtDecode<DecodedToken>(result.token);
        console.log('Decoded Token:', decoded);
        // Update context
        setUser({
          email: decoded.email,
          role: decoded.role,
          token: result.token,
        });

        // Redirect
        if (decoded.role === 'admin') {
          router.push('/admin');
        } else if (decoded.role === 'staff') {
          router.push('/staff');
        } else {
          router.push('/customer');
        }
      }
      console.log('Success:', result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
        alert(error.message);
      } else {
        console.error('Unexpected error:', error);
        alert('An unexpected error occurred');
      }
    }
  };

  return (
    <div className=" w-full max-w-md  mt-15 p-6 rounded-xl ">
      <div className="flex justify-center mb-4">
        <Image src="/logo.png" alt="Logo" width={250} height={100} />
      </div>
      <h2 className="text-red-600 text-2xl font-bold mb-4 text-center mt-8">
        {isSignup ? 'Sign Up' : 'Log In'}
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-red-500">Email</FormLabel>
                <FormControl>
                  <Input
                    className="bg-amber-50"
                    type="email"
                    placeholder="you@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-red-500">Password</FormLabel>
                <FormControl>
                  <Input
                    className="bg-amber-50"
                    type="password"
                    placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Role dropdown (only for Sign Up) */}
          {isSignup && (
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-red-500">Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl className="bg-amber-50">
                      <SelectTrigger>
                        <SelectValue
                          className="bg-amber-50"
                          placeholder="Select a role"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-amber-50">
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-500 text-white"
          >
            {isSignup ? 'Create Account' : 'Log In'}
          </Button>
        </form>
      </Form>

      <div className="text-sm mt-4 text-center">
        {isSignup ? (
          <>
            Already have an account?{' '}
            <button
              className="text-blue-600 hover:underline"
              onClick={() => setIsSignup(false)}
            >
              Log In
            </button>
          </>
        ) : (
          <>
            Don&apos;t have an account?{' '}
            <button
              className="text-blue-600 hover:underline"
              onClick={() => setIsSignup(true)}
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </div>
  );
}
