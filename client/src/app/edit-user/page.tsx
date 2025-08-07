"use client";

import { useUser } from "../../context/UserContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { z } from "zod";

export default function EditUserPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  const { user, setUser, loading } = useUser();
  const router = useRouter();

  const [email, setEmail] = useState(user?.email || "");
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [curPassword, setCurPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const getDashboardLink = () => {
    console.log(user?.role);
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

  // Password validation schema
  const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    );

  // Reusable password
  const passwordChecks = [
    { test: /.{8,}/, label: "At least 8 characters" },
    { test: /[A-Z]/, label: "One uppercase letter" },
    { test: /[a-z]/, label: "One lowercase letter" },
    { test: /[0-9]/, label: "One number" },
    { test: /[^A-Za-z0-9]/, label: "One special character" },
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    } else if (user) {
      setEmail(user.email);
      setName(user.name);
      setPhone(user.phone);
    }
  }, [loading, user, router]);

  if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  if (!user) return null;

  const handleSave = async () => {
    try {
      // Validate new password
      if (newPassword !== confirmPassword) {
        return alert("New passwords do not match!");
      }

      if (newPassword) {
        try {
          passwordSchema.parse(newPassword);
        } catch (err) {
          if (err instanceof z.ZodError) {
            return alert(err.errors[0].message); // Show first validation error
          }
        }
      }

      const response = await fetch(`${apiUrl}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`, // send token in Authorization header
        },
        body: JSON.stringify({
          currentPassword: curPassword,
          email,
          name,
          phone,
          newPassword: newPassword || undefined, // only send if not empty
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Update failed");

      setUser({ ...user!, name, email, phone });
      alert("Profile updated successfully!");
      router.push(`${getDashboardLink()}`);
    } catch (err) {
      alert(`Error: ${err}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-md mx-auto p-1">
        <div className="w-full mt-20 max-w-md p-6 rounded-xl bg-white shadow-lg border border-red-100">
          <h1 className="text-2xl font-bold mb-6 text-red-500 text-center">
            Edit Profile
          </h1>

          <label className="block mb-2 text-sm font-medium text-red-500">
            Full Name*
          </label>
          <Input
            type="text"
            value={name}
            className="mb-4 border-red-200 focus:border-red-400 bg-amber-50"
            onChange={(e) => setName(e.target.value)}
          />
          <label className="block mb-2 text-sm font-medium text-red-500">
            Email*
          </label>
          <Input
            type="email"
            value={email}
            className="mb-4 border-red-200 focus:border-red-400 bg-amber-50"
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className="block mb-2 text-sm font-medium text-red-500">
            Phone*
          </label>
          <Input
            type="text"
            value={phone}
            className="mb-4 border-red-200 focus:border-red-400 bg-amber-50"
            onChange={(e) => setPhone(e.target.value)}
          />

          <label className="block mb-2 text-sm font-medium text-red-500">
            New Password
          </label>
          <Input
            type="password"
            placeholder="Optional: Enter new password"
            value={newPassword}
            className="mb-4 border-red-200 focus:border-red-400 bg-amber-50"
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {newPassword.length > 0 && (
            <ul className="text-sm mt-2">
              {passwordChecks.map((check, i) => {
                const passed = check.test.test(newPassword);
                return (
                  <li
                    key={i}
                    className={passed ? "text-green-600" : "text-gray-400"}
                  >
                    {passed ? "✅" : "❌"} {check.label}
                  </li>
                );
              })}
            </ul>
          )}

          <label className="block mb-2 text-sm font-medium text-red-500">
            Confirm New Password
          </label>
          <Input
            type="password"
            placeholder="Optional: Confirm new password"
            value={confirmPassword}
            className="mb-4 border-red-200 focus:border-red-400 bg-amber-50"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <label className="block mb-2 text-sm font-medium text-red-500">
            Current Password*
          </label>
          <Input
            type="password"
            value={curPassword}
            className="mb-4 border-red-200 focus:border-red-400 bg-amber-50"
            onChange={(e) => setCurPassword(e.target.value)}
          />

          <div className="flex justify-between gap-2">
            <Button
              onClick={handleSave}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
