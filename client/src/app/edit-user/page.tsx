'use client';

import { useUser } from '../../context/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function EditUserPage() {
  const { user, setUser, loading } = useUser();
  const router = useRouter();

  const [email, setEmail] = useState(user?.email || '');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    } else if (user) {
      setEmail(user.email);
    }
  }, [loading, user, router]);

  if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  if (!user) return null;

  const handleSave = () => {
    // Just update context for now; can later call an API to save on the backend
    setUser({ ...user!, email });
    alert('User info updated!');
  };

  const handleLogout = () => {
    setUser(null);
    router.push('/auth');
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6">
      <h1 className="text-2xl font-bold mb-6 text-red-500 text-center">
        Edit Profile
      </h1>

      <label className="block mb-2 text-sm font-medium text-red-500">
        Email
      </label>
      <Input
        type="email"
        value={email}
        className="mb-4 bg-amber-50"
        onChange={(e) => setEmail(e.target.value)}
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
  );
}
