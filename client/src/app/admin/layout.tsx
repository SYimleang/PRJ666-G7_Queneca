// app/admin/layout.tsx
import type { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-white shadow p-4">
        <div className="text-lg font-bold text-gray-800">Admin Dashboard</div>
      </nav>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
