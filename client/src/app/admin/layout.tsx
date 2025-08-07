"use client";

import { useUser } from "@/context/UserContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Not logged in
    if (!user) {
      router.replace("/auth?mode=login");
    }
    // Staff
    else if (user.role == "staff") {
      router.replace("/staff");
    }
    // Customer
    else if (user.role == "customer") {
      router.replace("/");
    }
  }, [user, loading, router]);

  // Show nothing or a spinner while loading
  if (loading) return <div className="p-10">Loading...</div>;

  if (!user || user.role !== "admin") return null;

  return <>{children}</>;
}
