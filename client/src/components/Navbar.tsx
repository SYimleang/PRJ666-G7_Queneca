'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUser } from '../context/UserContext';

export default function Navbar() {
  const { user, setUser } = useUser();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine dashboard link based on role
  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'staff':
        return '/staff';
      case 'customer':
        return '/customer';
      default:
        return '/';
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
          <Input
            type="text"
            placeholder="Search..."
            className="bg-amber-50 w-48 md:w-64"
          />
          <Link
            href="/restaurant-registration"
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Restaurant Registration (temp)
          </Link>
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
