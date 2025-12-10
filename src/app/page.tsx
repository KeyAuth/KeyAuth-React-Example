"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Login } from "@/components/Login";
import { useAuth } from '@/contexts/AuthContext';

export default function Page() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return <Login />;
}