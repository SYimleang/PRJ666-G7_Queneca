"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-5xl font-bold text-red-600 mb-4">404</h1>
      <p className="text-xl font-medium mb-2">Page Not Found</p>
      <p className="text-gray-600 mb-6">Sorry, the restaurant you are looking for does not exist.</p>
      <Link href="/" className="text-red-500 underline hover:text-red-700">
        Go back to homepage
      </Link>
    </div>
  );
}
