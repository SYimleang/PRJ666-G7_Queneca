"use client";

import { useUser } from "../../context/UserContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function EditUserPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  const { user, setUser, loading } = useUser();
  const router = useRouter();

  const [email, setEmail] = useState(user?.email || "");
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [curPassword, setCurPassword] = useState("");

  const getDashboardLink = () => {
    console.log(user?.role);
    if (!user) return "/";
    switch (user.role) {
      case "admin":
        return "/admin";
      case "staff":
        return "/staff";
      case "customer":
        return "/customer";
      default:
        return "/";
    }
  };
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

  const handleLogout = () => {
    setUser(null);
    router.push("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-md mx-auto p-1">
        <div className="w-full mt-20 max-w-md p-6 rounded-xl bg-white shadow-lg border border-red-100">
          <h1 className="text-2xl font-bold mb-6 text-red-500 text-center">
            Edit Profile
          </h1>

          <label className="block mb-2 text-sm font-medium text-red-500">
            Full Name
          </label>
          <Input
            type="text"
            value={name}
            className="mb-4 border-red-200 focus:border-red-400 bg-amber-50"
            onChange={(e) => setName(e.target.value)}
          />
          <label className="block mb-2 text-sm font-medium text-red-500">
            Email
          </label>
          <Input
            type="email"
            value={email}
            className="mb-4 border-red-200 focus:border-red-400 bg-amber-50"
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className="block mb-2 text-sm font-medium text-red-500">
            Phone
          </label>
          <Input
            type="text"
            value={phone}
            className="mb-4 border-red-200 focus:border-red-400 bg-amber-50"
            onChange={(e) => setPhone(e.target.value)}
          />
          <label className="block mb-2 text-sm font-medium text-red-500">
            Current Password
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
            <Button onClick={handleLogout} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
