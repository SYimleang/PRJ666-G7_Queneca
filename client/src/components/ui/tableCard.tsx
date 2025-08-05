"use client";

// components/TableCard.tsx
import React from "react";

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

interface Props {
  table: Table;
  onSeat: (id: string) => void;
  onClear: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function TableCard({ table, onSeat, onClear, onDelete }: Props) {
  return (
    <div className="relative border rounded-xl p-4 shadow-md w-48 h-56 flex flex-col justify-between bg-white">
      {onDelete && (
        <button
          onClick={() => onDelete(table._id)}
          className="absolute top-2 right-2 z-10 bg-red-600 text-white text-xs px-2 py-1 rounded shadow"
        >
          ✕
        </button>
      )}

      <h2 className="text-lg font-bold text-center">
        Table {table.tableNumber}
      </h2>
      <p className="text-center text-sm text-gray-700">Seats: {table.seats}</p>
      <p className="text-center">
        Status:{" "}
        <span
          className={
            table.status === "available" ? "text-green-600" : "text-red-600"
          }
        >
          {table.status}
        </span>
      </p>

      {table.status === "available" ? (
        <button
          onClick={() => onSeat(table._id)}
          className="bg-blue-500 text-white py-2 rounded"
        >
          Seat
        </button>
      ) : (
        <>
          <button
            onClick={() => onClear(table._id)}
            className="bg-green-600 text-white py-2 rounded"
          >
            Clear
          </button>
        </>
      )}
    </div>
  );
}
