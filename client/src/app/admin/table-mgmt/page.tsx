"use client";

// pages/admin/tables.tsx
import { useEffect, useState } from "react";
import TableCard from "@/components/ui/tableCard";
import { useUser } from "@/context/UserContext";
import AdminNav from "@/components/AdminNav";
import { Separator } from "@/components/ui/separator";

type Table = {
  _id: string;
  tableNumber: number;
  status: "available" | "occupied";
  seatedParty?: {
    name: string;
    size: number;
  };
  seats: number;
};

export default function AdminTablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [newSeats, setNewSeats] = useState("");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { user } = useUser();
  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    const token = user?.token;
    const res = await fetch(`${apiUrl}/api/admin/tables`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      setTables(data.tables ?? data);
    }
  };

  const handleSeatTable = async (tableId: string) => {
    const token = user?.token;

    const res = await fetch(`${apiUrl}/api/tables/${tableId}/seat`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const updated = await res.json();
      setTables((prev) =>
        prev.map((t) => (t._id === tableId ? updated.table : t)),
      );
    }
  };

  const handleClearTable = async (tableId: string) => {
    const token = user?.token;

    const res = await fetch(`${apiUrl}/api/tables/${tableId}/clear`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const updated = await res.json();
      setTables((prev) =>
        prev.map((t) => (t._id === tableId ? updated.table : t)),
      );
    }
  };

  const handleAddTable = async () => {
    setSaving(true);
    setSuccess(null);
    setError(null);
    try {
      const tableNumber = parseInt(newTableNumber);
      const seats = parseInt(newSeats);

      if (isNaN(tableNumber) || isNaN(seats) || seats < 1) {
        setError("Enter a valid table number and number of seats.");
        return;
      }
      const token = user?.token;

      const res = await fetch(`${apiUrl}/api/admin/tables`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tableNumber, seats }),
      });

      if (res.ok) {
        setNewTableNumber("");
        fetchTables();
        setSuccess("Table successfully added!");
      } else {
        const error = await res.json();
        setError("Error: Failed to add table");
        alert(error.message || "Failed to add table");
      }
    } catch (err: any) {
      console.error("Failed to add table: " + err);
      setError(err + " failed to add table");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTable = async (id: string) => {
    const confirmed = confirm("Are you sure you want to delete this table?");
    if (!confirmed) return;
    const token = user?.token;

    const res = await fetch(`${apiUrl}/api/admin/tables/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      fetchTables();
    } else {
      alert("Failed to delete table");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <AdminNav></AdminNav>
      <Separator className="mt-5 mb-5" />
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Table Management</h1>
        <p className="text-gray-600">Configure the tables in your restaurant</p>
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Manage Tables</h1>

        <div className="mb-6 flex items-center gap-4">
          <input
            type="number"
            placeholder="Table Number"
            value={newTableNumber}
            onChange={(e) => setNewTableNumber(e.target.value)}
            className="border px-4 py-2 rounded"
          />
          <input
            type="number"
            placeholder="# of Seats"
            value={newSeats}
            onChange={(e) => setNewSeats(e.target.value)}
            className="border px-4 py-2 rounded"
          />

          <button
            onClick={handleAddTable}
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={saving}
          >
            {saving ? "Adding Table..." : "Add Table"}
          </button>
        </div>

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {tables.map((table) => (
            <TableCard
              key={table._id}
              table={table}
              onSeat={handleSeatTable}
              onClear={handleClearTable}
              onDelete={() => handleDeleteTable(table._id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
