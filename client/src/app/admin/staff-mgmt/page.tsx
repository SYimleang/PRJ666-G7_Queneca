"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { IUser } from "@/types/user";
import AdminNav from "@/components/AdminNav";
import { useUser } from "@/context/UserContext";

interface IStaff {
  name: string;
  email: string;
  role: string;
  active: boolean;
}

export default function StaffManagement() {
  const { user } = useUser();
  const [staff, setStaff] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<IStaff>>({
    name: "",
    email: "",
    role: "staff",
    active: true,
  });
  const [editingStaff, setEditingStaff] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  useEffect(() => {
    fetchStaff();
  });

  const fetchStaff = async () => {
    try {
      const token = user?.token;
      console.log("Fetching staff with token:", token);
      const res = await fetch(`${apiUrl}/api/staff-mgmt`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch staff list");
      const data = await res.json();
      console.log("Fetched staff data:", data);
      setStaff(data.staff || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.name?.trim()) return "Name is required";
    if (!formData.email?.trim()) return "Email is required";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const token = user?.token;
      if (!token) {
        throw new Error("No authentication token found");
      }

      let updateStaff: IUser[];

      if (editingStaff) {
        // Update existing staff
        updateStaff = staff?.map((s, idxStaff) =>
          idxStaff === editingStaff ? { ...s, ...(formData as IUser) } : s
        );
      } else {
        updateStaff = [...(staff || []), formData as IUser];
      }
      console.log("Submitting staff data:", updateStaff);

      const response = await fetch(`${apiUrl}/api/staff-mgmt`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userList: updateStaff }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save staff");
      }

      await fetchStaff();
      resetForm();
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const handleEdit = (index: number) => {
    setEditingStaff(index);
    setFormData(staff[index]);
    setShowForm(true);
  };

  const handleDelete = async (index: number) => {
    if (!confirm("Delete this staff member?")) return;

    try {
      if (!user?.token) {
        throw new Error("No authentication token found");
      }

      const staffToDelete = staff[index];

      console.log("Deleting staff:", staffToDelete._id);

      const res = await fetch(`${apiUrl}/api/staff-mgmt/${staffToDelete._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete staff");
      await fetchStaff();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", role: "staff", active: true });
    setEditingStaff(null);
    setShowForm(false);
  };

  return (
    <div className="container mx-auto p-6">
      <AdminNav />
      <Separator className="my-5" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-gray-600">Add and manage your restaurant staff</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          Add New Staff
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      {loading && <p>Loading staff...</p>}

      {(showForm || editingStaff) && (
        <Card className="mb-6 ">
          <CardHeader>
            <CardTitle>
              {editingStaff !== null ? "Edit Staff" : "Add New Staff"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Role *</Label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={formData.role || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {editingStaff !== null ? "Update" : "Add"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {staff.length === 0 ? (
          <p className="text-gray-500">No staff found</p>
        ) : (
          staff.map((staff, index) => (
            <Card key={index}>
              <CardContent className="grid grid-cols-6 p-4 gap-0 justify-center items-center">
                <div className="col-span-1 flex justify-center items-center">
                  <div className="relative inline-flex items-center justify-center w-15 h-15 rounded-full bg-gray-100 overflow-hidden">
                    <span className="text-gray-600 text-lg font-semibold">
                      {staff.name
                        .split(" ")
                        .map((word) => word[0])
                        .join("")}
                    </span>
                  </div>
                </div>

                <div className="justify-start">
                  <h3 className="font-semibold text-lg">{staff.name}</h3>
                  <p className="text-sm text-gray-600">
                    <b>Email:</b> {staff.email}
                  </p>
                  <p className="text-sm text-gray-600 capitalize">
                    <b>Role:</b> {staff.role}
                  </p>
                </div>
                <div></div>
                <div></div>
                <div></div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(index)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600"
                    onClick={() => handleDelete(index)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
