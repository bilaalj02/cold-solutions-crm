'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LeadManager, SalesUser } from '../../lib/leads';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = LeadManager.getCurrentUser();
    if (currentUser) {
      router.push('/cold-caller');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = LeadManager.authenticateUser(email, password);

      if (user) {
        LeadManager.setCurrentUser(user);
        router.push('/cold-caller');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-6 px-4 sm:py-12 sm:px-6 lg:px-8" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
      <div className="mx-auto w-full max-w-md">
        <div className="text-center">
          {/* Business Logo */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <img 
              src="/logo.png" 
              alt="Cold Solutions Logo" 
              className="h-16 w-auto sm:h-20"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{color: '#0a2240'}}>Cold Solutions</h1>
          <p className="mt-2 text-sm text-gray-600">Cold Caller Management System</p>
        </div>
        <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <span className="font-medium text-[#3dbff2] hover:text-[#2a9fd4] cursor-pointer">
            contact your administrator for access
          </span>
        </p>
      </div>

      <div className="mt-6 sm:mt-8 mx-auto w-full max-w-md">
        <div className="bg-white py-6 px-4 shadow sm:rounded-lg sm:py-8 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-[#3dbff2] focus:border-[#3dbff2] text-base sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-[#3dbff2] focus:border-[#3dbff2] text-base sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="material-symbols-outlined text-red-400">error</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3dbff2] disabled:opacity-50 disabled:cursor-not-allowed sm:text-sm sm:py-2"
                style={{backgroundColor: '#3dbff2'}}
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="material-symbols-outlined animate-spin mr-2">refresh</span>
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}