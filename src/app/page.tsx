'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LeadManager } from '@/lib/leads';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = LeadManager.getCurrentUser();
    if (currentUser) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-gray-400 text-2xl animate-spin">refresh</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Loading...</h3>
        <p className="text-sm text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
}
