'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LeadManager, SalesUser } from '@/lib/leads';

type TimePeriod = 'day' | 'week' | 'month' | 'year';

export default function MyProgressPage() {
  const [currentUser, setCurrentUser] = useState<SalesUser | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('day');
  const [selectedCallerId, setSelectedCallerId] = useState<string>('all');
  const [allCallers, setAllCallers] = useState<SalesUser[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const user = LeadManager.getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUser(user);

    // Load all callers for admin users
    const users = LeadManager.getUsers();
    setAllCallers(users.filter(u => u.role === 'Sales Rep' || u.role === 'Manager' || u.role === 'Admin'));

    fetchAnalytics();
  }, [timePeriod, selectedCallerId, router]);

  const fetchAnalytics = () => {
    const data = LeadManager.getCallAnalytics(timePeriod, selectedCallerId === 'all' ? undefined : selectedCallerId);
    setAnalyticsData(data);
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'Booked Demo': return 'bg-blue-500';
      case 'Interested': return 'bg-green-500';
      case 'Not Interested': return 'bg-red-500';
      case 'Requested More Info': return 'bg-yellow-500';
      case 'No Answer': return 'bg-orange-500';
      case 'Callback Requested': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-gray-400 text-2xl animate-spin">refresh</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading...</h3>
          <p className="text-sm text-gray-600">Please wait while we verify your access.</p>
        </div>
      </div>
    );
  }

  const totalCalls = analyticsData?.totalCalls || 0;
  const bookedDemos = analyticsData?.callsByOutcome['Booked Demo'] || 0;
  const interestedLeads = analyticsData?.callsByOutcome['Interested'] || 0;
  const notInterested = analyticsData?.callsByOutcome['Not Interested'] || 0;
  const requestedInfo = analyticsData?.callsByOutcome['Requested More Info'] || 0;
  const noAnswer = analyticsData?.callsByOutcome['No Answer'] || 0;
  const callbackRequested = analyticsData?.callsByOutcome['Callback Requested'] || 0;

  const successRate = totalCalls > 0 ? ((bookedDemos + interestedLeads) / totalCalls) * 100 : 0;

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="min-h-screen w-72 flex flex-col justify-between text-white p-4 bg-blue-600">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col p-4">
            <h1 className="text-xl font-bold leading-normal text-white">Cold Solutions</h1>
            <p className="text-sm font-normal leading-normal text-blue-200">My Progress</p>
          </div>
          <nav className="flex flex-col gap-2">
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700 text-white" href="/dashboard">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>dashboard</span>
              <p className="text-sm font-medium leading-normal">Dashboard</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700 text-white" href="/call-log">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>call</span>
              <p className="text-sm font-medium leading-normal">Call Log</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-700 text-white" href="/my-progress">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>trending_up</span>
              <p className="text-sm font-medium leading-normal">My Progress</p>
            </a>
            {currentUser?.role === 'Admin' && (
              <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700 text-white" href="/users">
                <span className="material-symbols-outlined" style={{fontSize: '20px'}}>people</span>
                <p className="text-sm font-medium leading-normal">Users</p>
              </a>
            )}
          </nav>
        </div>
        
        <div className="p-4 border-t border-blue-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm">person</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">{currentUser.name}</p>
              <p className="text-xs text-blue-200">{currentUser.role}</p>
            </div>
          </div>
          <button 
            onClick={() => { LeadManager.logout(); router.push('/login'); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-200 hover:text-white hover:bg-blue-700 rounded-md transition-colors"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen bg-gray-50">
        {/* Header */}
        <header className="p-6 bg-white border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Progress</h1>
              <p className="text-sm text-gray-600 mt-1">Track your performance and call conversion</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
                className="rounded-md border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <select
                value={selectedCallerId}
                onChange={(e) => setSelectedCallerId(e.target.value)}
                className="rounded-md border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                <option value="all">All Callers</option>
                {allCallers.map(caller => (
                  <option key={caller.id} value={caller.id}>{caller.name}</option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600 text-xl">call</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Calls</p>
                  <p className="text-2xl font-bold text-gray-900">{totalCalls}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-600 text-xl">check_circle</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Booked Demos</p>
                  <p className="text-2xl font-bold text-gray-900">{bookedDemos}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-yellow-600 text-xl">trending_up</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Interested</p>
                  <p className="text-2xl font-bold text-gray-900">{interestedLeads}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-purple-600 text-xl">percent</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{successRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Call Outcomes Breakdown */}
          <div className="bg-white rounded-lg border p-6 mb-8">
            <h3 className="text-lg font-semibold mb-6 text-gray-900">Call Outcomes Breakdown</h3>
            <div className="space-y-4">
              {analyticsData && Object.entries(analyticsData.callsByOutcome).map(([outcome, count]) => {
                const countNum = Number(count) || 0;
                const percentage = totalCalls > 0 ? (countNum / totalCalls) * 100 : 0;
                return (
                  <div key={outcome} className="flex items-center gap-4">
                    <span className={`inline-block w-3 h-3 rounded-full ${getOutcomeColor(outcome)}`}></span>
                    <p className="text-sm text-gray-700 w-32">{outcome}</p>
                    <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${getOutcomeColor(outcome)}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{countNum} ({percentage.toFixed(1)}%)</span>
                  </div>
                );
              })}
              {totalCalls === 0 && <p className="text-center text-gray-500">No calls recorded for this period.</p>}
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Call Distribution</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Booked Demos</span>
                  <span className="text-sm font-medium text-gray-900">{bookedDemos}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Interested</span>
                  <span className="text-sm font-medium text-gray-900">{interestedLeads}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Requested More Info</span>
                  <span className="text-sm font-medium text-gray-900">{requestedInfo}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">No Answer</span>
                  <span className="text-sm font-medium text-gray-900">{noAnswer}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Callback Requested</span>
                  <span className="text-sm font-medium text-gray-900">{callbackRequested}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Not Interested</span>
                  <span className="text-sm font-medium text-gray-900">{notInterested}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Performance Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Calls Made</span>
                  <span className="text-sm font-medium text-gray-900">{totalCalls}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Positive Outcomes</span>
                  <span className="text-sm font-medium text-green-600">{bookedDemos + interestedLeads}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Follow-up Required</span>
                  <span className="text-sm font-medium text-yellow-600">{requestedInfo + callbackRequested}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">No Response</span>
                  <span className="text-sm font-medium text-orange-600">{noAnswer}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Rejected</span>
                  <span className="text-sm font-medium text-red-600">{notInterested}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
