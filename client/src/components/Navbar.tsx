"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser } from "../context/UserContext";
import { IRestaurant } from "@/types/restaurant";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function Navbar() {
  const { user, setUser } = useUser();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IRestaurant[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim()) {
        fetch(`${apiUrl}/api/restaurants`)
          .then((res) => res.json())
          .then((data) => {
            const filtered = data.restaurants.filter((r: IRestaurant) =>
              r.name.toLowerCase().includes(query.toLowerCase())
            );
            setResults(filtered);
            setShowDropdown(true);
          });
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300); // debounce

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Determine dashboard link based on role
  const getDashboardLink = () => {
    if (!user) return "/";
    switch (user.role) {
      case "admin":
        return "/admin";
      case "staff":
        return "/staff";
      case "customer":
        return "/";
      default:
        return "/";
    }
  };

  return (
    <header className="w-full bg-white shadow px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href={getDashboardLink()}>
            <Image src="/logo.png" alt="Logo" width={200} height={45} />
          </Link>

          {/* Links */}
          <nav className="hidden md:flex gap-4 text-sm font-medium">
            <Link
              href="/about"
              className="text-red-600 hover:text-red-500 transition-colors"
            >
              About Us
            </Link>
            <Link
              href="/faqs"
              className="text-red-600 hover:text-red-500 transition-colors"
            >
              Support
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="relative">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="bg-amber-50 w-48 md:w-64"
            />
            {showDropdown && results.length > 0 && (
              <div className="absolute bg-white border border-gray-200 mt-1 rounded w-full shadow-md z-50">
                {results.map((restaurant) => (
                  <Link
                    key={restaurant._id}
                    href={`/restaurant/${restaurant._id}`}
                    className="block px-4 py-2 hover:bg-gray-100 text-sm"
                    onClick={() => {
                      setShowDropdown(false);
                      setQuery("");
                    }}
                  >
                    {restaurant.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <div ref={dropdownRef} className="relative inline-block text-left">
              <button
                onClick={() => setOpen(!open)}
                className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded"
              >
                {user.name}
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-10">
                  <Link
                    href="/edit-user"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setOpen(false)}
                  >
                    Edit Profile
                  </Link>
                  <Link
                    onClick={() => {
                      setUser(null);
                      setOpen(false);
                    }}
                    href="/auth?mode=login"
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                  >
                    Log Out
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth?mode=login">
                <Button
                  className="text-red-500 hover:text-red-600"
                  variant="ghost"
                >
                  Log In
                </Button>
              </Link>
              <Link href="/auth?mode=signup">
                <Button className="bg-red-600 text-white hover:bg-red-500">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
