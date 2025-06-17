"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";

export default function TestAuth() {
  const { user } = useUser();
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  const checkToken = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setResult("❌ No token found in localStorage. Please log in first.");
        return;
      }

      setResult(`✅ Token found: ${token.substring(0, 50)}...`);

      // Test token with server
      const response = await fetch(`${apiUrl}/api/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setResult(
          (prev) =>
            prev +
            `\n\n✅ Token is valid!\nUser: ${data.user.name} (${data.user.role})\nEmail: ${data.user.email}`
        );
      } else {
        const errorData = await response.json();
        setResult(
          (prev) =>
            prev + `\n\n❌ Token verification failed: ${errorData.message}`
        );
      }
    } catch (error) {
      setResult(
        (prev) =>
          prev +
          `\n\n❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const testMenuAPI = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setResult("❌ No token found. Please log in first.");
        return;
      }

      const response = await fetch(`${apiUrl}/api/menus/my-menu`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setResult(`✅ Menu API works!\nMenu: ${JSON.stringify(data, null, 2)}`);
      } else if (response.status === 404) {
        setResult(
          `✅ Menu API works! (No menu found - this is normal for new restaurants)`
        );
      } else {
        const errorData = await response.json();
        setResult(`❌ Menu API failed: ${errorData.message}`);
      }
    } catch (error) {
      setResult(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const clearToken = () => {
    localStorage.removeItem("token");
    setResult("🗑️ Token cleared from localStorage");
  };

  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-3xl font-bold mb-6'>Authentication Debug Tool</h1>

      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>Debug Authentication</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex space-x-2'>
            <Button onClick={checkToken} disabled={loading}>
              Check Token Status
            </Button>
            <Button onClick={testMenuAPI} disabled={loading} variant='outline'>
              Test Menu API
            </Button>
            <Button
              onClick={clearToken}
              disabled={loading}
              variant='destructive'
            >
              Clear Token
            </Button>
          </div>

          {result && (
            <div className='bg-gray-100 p-4 rounded-lg'>
              <pre className='whitespace-pre-wrap text-sm'>{result}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className='list-decimal list-inside space-y-2'>
            <li>
              <strong>Check if you're logged in:</strong> Click "Check Token
              Status" above
            </li>
            <li>
              <strong>If no token found:</strong> Go to{" "}
              <a href='/auth/login' className='text-blue-600 underline'>
                /auth/login
              </a>{" "}
              and log in
            </li>
            <li>
              <strong>If token is expired:</strong> Log out and log back in
            </li>
            <li>
              <strong>If token is invalid:</strong> Clear token and log in again
            </li>
            <li>
              <strong>Server issues:</strong> Make sure the backend server is
              running on port 5001
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
