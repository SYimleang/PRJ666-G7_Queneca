'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUser } from '../context/UserContext';

export default function Navbar() {
  const { user } = useUser();

  // Determine dashboard link based on role
  const getDashboardLink = () => {
    console.log(user?.role);
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
              href="/support"
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
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/edit-user">
              <Button className="bg-red-500 text-white hover:bg-red-400">
                {user.username}
              </Button>
            </Link>
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
