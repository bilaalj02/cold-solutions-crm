'use client'

import React, { useState } from "react";
import { notionDatabases } from "../lib/notion-databases";
import { useAuth } from "../lib/auth";
import ProtectedRoute from "../components/ProtectedRoute";

function ColdSolutionsDashboard() {
  const [leadsDropdownOpen, setLeadsDropdownOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen w-full group/design-root overflow-x-hidden bg-white" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
      {/* Sidebar */}
      <div className="flex min-h-screen w-72 flex-col justify-between text-white p-4" style={{backgroundColor: '#0a2240'}}>
          <div className="flex flex-col gap-8">
            <div className="flex flex-col p-4">
              <h1 className="text-xl font-bold leading-normal text-white">Cold Solutions</h1>
              <p className="text-sm font-normal leading-normal" style={{color: '#a0a0a0'}}>Your Business, Streamlined</p>
            </div>
            <nav className="flex flex-col gap-2">
              <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-white" style={{backgroundColor: '#3dbff2'}} href="#">
                <span className="material-symbols-outlined" style={{fontSize: '20px'}}>dashboard</span>
                <p className="text-sm font-medium leading-normal">Dashboard</p>
              </a>
              
              {/* Leads Database Dropdown */}
              <div className="flex flex-col">
                <button 
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white w-full text-left"
                  onClick={() => setLeadsDropdownOpen(!leadsDropdownOpen)}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined" style={{fontSize: '20px'}}>group</span>
                    <p className="text-sm font-medium leading-normal">Leads Database</p>
                  </div>
                  <span className={`material-symbols-outlined transition-transform ${leadsDropdownOpen ? 'rotate-180' : ''}`} style={{fontSize: '16px'}}>
                    expand_more
                  </span>
                </button>
                
                {leadsDropdownOpen && (
                  <div className="ml-4 mt-2 flex flex-col gap-1">
                    <a className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-opacity-20 hover:bg-white text-white text-sm" href="/leads">
                      <span className="material-symbols-outlined" style={{fontSize: '16px'}}>database</span>
                      <p className="text-sm leading-normal">All Leads</p>
                    </a>
                    {notionDatabases.map((db) => (
                      <a 
                        key={db.id} 
                        className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-opacity-20 hover:bg-white text-white text-sm" 
                        href={`/database/${db.slug}`}
                      >
                        <span className="material-symbols-outlined" style={{fontSize: '16px'}}>{db.icon}</span>
                        <p className="text-sm leading-normal">{db.name}</p>
                      </a>
                    ))}
                  </div>
                )}
              </div>
              
              <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/calls">
                <span className="material-symbols-outlined" style={{fontSize: '20px'}}>phone_in_talk</span>
                <p className="text-sm font-medium leading-normal">Calls Database</p>
              </a>
              <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/email">
                <span className="material-symbols-outlined" style={{fontSize: '20px'}}>email</span>
                <p className="text-sm font-medium leading-normal">Email Management</p>
              </a>
              <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/automation">
                <span className="material-symbols-outlined" style={{fontSize: '20px'}}>smart_toy</span>
                <p className="text-sm font-medium leading-normal">Automation Hub</p>
              </a>
              <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/analytics">
                <span className="material-symbols-outlined" style={{fontSize: '20px'}}>analytics</span>
                <p className="text-sm font-medium leading-normal">Performance Analytics</p>
              </a>
              <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/operations">
                <span className="material-symbols-outlined" style={{fontSize: '20px'}}>dvr</span>
                <p className="text-sm font-medium leading-normal">Operations Console</p>
              </a>
            </nav>
          </div>
          <div className="flex flex-col gap-2">
            <div className="px-4 py-3 rounded-lg bg-opacity-10 bg-white">
              <p className="text-xs font-medium" style={{color: '#a0a0a0'}}>SIGNED IN AS</p>
              <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
              <p className="text-xs" style={{color: '#a0a0a0'}}>{user?.email}</p>
            </div>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="#">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>settings</span>
              <p className="text-sm font-medium leading-normal">Settings</p>
            </a>
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white text-left w-full"
            >
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>logout</span>
              <p className="text-sm font-medium leading-normal">Sign Out</p>
            </button>
          </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-h-screen" style={{backgroundColor: '#f9fafb'}}>
          <header className="p-6">
            <h1 className="text-3xl font-bold" style={{color: '#0a2240'}}>Dashboard</h1>
          </header>
          
          <main className="flex flex-col gap-8 p-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex flex-col gap-2 rounded-lg p-6 bg-white border border-gray-200 shadow-sm">
                <p className="text-gray-600 text-base font-medium">New Leads</p>
                <p className="text-3xl font-bold" style={{color: '#0a2240'}}>24</p>
              </div>
              <div className="flex flex-col gap-2 rounded-lg p-6 bg-white border border-gray-200 shadow-sm">
                <p className="text-gray-600 text-base font-medium">Calls This Week</p>
                <p className="text-3xl font-bold" style={{color: '#0a2240'}}>15</p>
              </div>
              <div className="flex flex-col gap-2 rounded-lg p-6 bg-white border border-gray-200 shadow-sm">
                <p className="text-gray-600 text-base font-medium">Meetings Booked</p>
                <p className="text-3xl font-bold" style={{color: '#0a2240'}}>8</p>
              </div>
              <div className="flex flex-col gap-2 rounded-lg p-6 bg-white border border-gray-200 shadow-sm">
                <p className="text-gray-600 text-base font-medium">Conversion %</p>
                <p className="text-3xl font-bold" style={{color: '#0a2240'}}>12%</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Leads Over Time Chart */}
              <div className="lg:col-span-1 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold mb-4" style={{color: '#0a2240'}}>Leads Over Time</h3>
                <div className="h-64">
                  <svg fill="none" height="100%" preserveAspectRatio="none" viewBox="0 0 472 200" width="100%" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 136.25C18.1538 136.25 18.1538 26.25 36.3077 26.25C54.4615 26.25 54.4615 51.25 72.6154 51.25C90.7692 51.25 90.7692 116.25 108.923 116.25C127.077 116.25 127.077 41.25 145.231 41.25C163.385 41.25 163.385 126.25 181.538 126.25C199.692 126.25 199.692 76.25 217.846 76.25C236 76.25 236 56.25 254.154 56.25C272.308 56.25 272.308 151.25 290.462 151.25C308.615 151.25 308.615 186.25 326.769 186.25C344.923 186.25 344.923 1.25 363.077 1.25C381.231 1.25 381.231 101.25 399.385 101.25C417.538 101.25 417.538 161.25 435.692 161.25C453.846 161.25 453.846 31.25 472 31.25" stroke="#3dbff2" strokeLinecap="round" strokeWidth="3"></path>
                    <path d="M0 136.25C18.1538 136.25 18.1538 26.25 36.3077 26.25C54.4615 26.25 54.4615 51.25 72.6154 51.25C90.7692 51.25 90.7692 116.25 108.923 116.25C127.077 116.25 127.077 41.25 145.231 41.25C163.385 41.25 163.385 126.25 181.538 126.25C199.692 126.25 199.692 76.25 217.846 76.25C236 76.25 236 56.25 254.154 56.25C272.308 56.25 272.308 151.25 290.462 151.25C308.615 151.25 308.615 186.25 326.769 186.25C344.923 186.25 344.923 1.25 363.077 1.25C381.231 1.25 381.231 101.25 399.385 101.25C417.538 101.25 417.538 161.25 435.692 161.25C453.846 161.25 453.846 31.25 472 31.25V200H0V136.25Z" fill="url(#paint0_linear_leads)"></path>
                    <defs>
                      <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_leads" x1="236" x2="236" y1="1.25" y2="200">
                        <stop stopColor="#3dbff2" stopOpacity="0.2"></stop>
                        <stop offset="1" stopColor="#3dbff2" stopOpacity="0"></stop>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* AI Voice Calls Chart */}
              <div className="lg:col-span-1 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold mb-4" style={{color: '#0a2240'}}>AI Voice Calls</h3>
                <div className="h-64 flex items-end gap-4">
                  <div className="flex-1 h-full flex flex-col justify-end items-center gap-2">
                    <div className="w-full rounded-t-md" style={{height: "40%", backgroundColor: '#3dbff2'}}></div>
                    <span className="text-xs text-gray-500">Jan</span>
                  </div>
                  <div className="flex-1 h-full flex flex-col justify-end items-center gap-2">
                    <div className="w-full rounded-t-md" style={{height: "60%", backgroundColor: '#3dbff2'}}></div>
                    <span className="text-xs text-gray-500">Feb</span>
                  </div>
                  <div className="flex-1 h-full flex flex-col justify-end items-center gap-2">
                    <div className="w-full rounded-t-md" style={{height: "30%", backgroundColor: '#3dbff2'}}></div>
                    <span className="text-xs text-gray-500">Mar</span>
                  </div>
                  <div className="flex-1 h-full flex flex-col justify-end items-center gap-2">
                    <div className="w-full rounded-t-md" style={{height: "75%", backgroundColor: '#3dbff2'}}></div>
                    <span className="text-xs text-gray-500">Apr</span>
                  </div>
                  <div className="flex-1 h-full flex flex-col justify-end items-center gap-2">
                    <div className="w-full rounded-t-md" style={{height: "50%", backgroundColor: '#3dbff2'}}></div>
                    <span className="text-xs text-gray-500">May</span>
                  </div>
                </div>
              </div>

              {/* Pipeline Funnel */}
              <div className="lg:col-span-1 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold mb-4" style={{color: '#0a2240'}}>Pipeline Funnel</h3>
                <div className="h-64 flex flex-col justify-center gap-2">
                  <div className="flex items-center gap-4">
                    <span className="w-24 text-sm text-gray-500">Prospects</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div className="h-4 rounded-full" style={{width: "100%", backgroundColor: '#0a2240'}}></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-24 text-sm text-gray-500">Qualified</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div className="h-4 rounded-full" style={{width: "75%", backgroundColor: '#0a2240'}}></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-24 text-sm text-gray-500">Contacted</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div className="h-4 rounded-full" style={{width: "50%", backgroundColor: '#0a2240'}}></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="w-24 text-sm text-gray-500">Won</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div className="h-4 rounded-full" style={{width: "25%", backgroundColor: '#0a2240'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row - Leads Table and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Leads Table */}
              <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold p-6" style={{color: '#0a2240'}}>Recent Leads</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">NAME</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">SOURCE</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">SCORE</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">LAST INTERACTION</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Ethan Harper</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Website</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Qualified</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">85</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2 days ago</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="hover:underline" style={{color: '#3dbff2'}}>Open</button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Olivia Bennett</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Referral</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Contacted</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">78</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3 days ago</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="hover:underline" style={{color: '#3dbff2'}}>Open</button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Liam Carter</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Social Media</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Interested</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">62</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">5 days ago</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="hover:underline" style={{color: '#3dbff2'}}>Open</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="lg:col-span-1 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4" style={{color: '#0a2240'}}>Recent Activity</h3>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <div className="rounded-full p-2 mt-1" style={{backgroundColor: '#3dbff2'}}>
                      <span className="material-symbols-outlined text-white" style={{fontSize: '16px'}}>phone_in_talk</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">Call with Ethan Harper</p>
                      <p className="text-sm text-gray-500">2 days ago</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <span className="material-symbols-outlined" style={{fontSize: '16px'}}>chevron_right</span>
                    </button>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="rounded-full p-2 mt-1" style={{backgroundColor: '#3dbff2'}}>
                      <span className="material-symbols-outlined text-white" style={{fontSize: '16px'}}>videocam</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">Meeting with Olivia Bennett</p>
                      <p className="text-sm text-gray-500">3 days ago</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <span className="material-symbols-outlined" style={{fontSize: '16px'}}>chevron_right</span>
                    </button>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="rounded-full p-2 mt-1" style={{backgroundColor: '#3dbff2'}}>
                      <span className="material-symbols-outlined text-white" style={{fontSize: '16px'}}>phone_in_talk</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">Call with Liam Carter</p>
                      <p className="text-sm text-gray-500">5 days ago</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <span className="material-symbols-outlined" style={{fontSize: '16px'}}>chevron_right</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </main>
      </div>
    </div>
  );
}

export default function ProtectedDashboard() {
  return (
    <ProtectedRoute>
      <ColdSolutionsDashboard />
    </ProtectedRoute>
  );
}