"use client";

import { useUser } from "@/context/UserContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Not logged in
    if (!user) {
      router.replace("/login");
    } 
    // Staff
    else if (user.role == "staff") {
      router.replace("/staff");
    } 
    // Customer
    else if (user.role == "customer") {
        router.replace("/");
    }
  }, [user, router]);

  if (!user || user.role !== "admin") return null;

  return <>{children}</>;
}
