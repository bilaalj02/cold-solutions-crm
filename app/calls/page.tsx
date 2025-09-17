'use client'

import React from "react";

export default function CallsDatabase() {
  return (
    <div className="flex min-h-screen bg-white" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
      {/* Sidebar */}
      <aside className="w-64 flex flex-col text-white" style={{backgroundColor: '#0a2240'}}>
        <div className="flex items-center gap-3 p-6 border-b border-white/10">
          <div className="w-8 h-8 flex items-center justify-center rounded-md text-white" style={{backgroundColor: '#3dbff2', color: '#0a2240'}}>
            <span className="material-symbols-outlined">show_chart</span>
          </div>
          <h1 className="text-xl font-bold">Cold Solutions</h1>
        </div>

        <nav className="flex-1 p-4">
          <a className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-md hover:bg-white/10" href="/">
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </a>
          <a className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-md mt-1 text-white" style={{backgroundColor: '#3dbff2', color: '#0a2240'}} href="/calls">
            <span className="material-symbols-outlined">call</span>
            Calls
          </a>
          <a className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-md hover:bg-white/10 mt-1" href="/leads">
            <span className="material-symbols-outlined">group</span>
            Leads Database
          </a>
          <a className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-md hover:bg-white/10 mt-1" href="/analytics">
            <span className="material-symbols-outlined">analytics</span>
            Performance Analytics
          </a>
          <a className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-md hover:bg-white/10 mt-1" href="/operations">
            <span className="material-symbols-outlined">dvr</span>
            Operations Console
          </a>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#3dbff2] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#0a2240]">person</span>
            </div>
            <div>
              <p className="font-semibold text-sm">System User</p>
              <p className="text-xs" style={{color: '#3dbff2'}}>system@coldsolutions.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Header */}
        <header className="flex items-center justify-between border-b px-8 py-4">
          <h2 className="text-2xl font-bold" style={{color: '#0a2240'}}>Calls Database</h2>
          <div className="flex items-center gap-4">
            <button className="relative hover:text-gray-900" style={{color: '#0a2240'}}>
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white" style={{backgroundColor: '#3dbff2'}}></span>
            </button>
            <button className="flex items-center gap-2 rounded-md border py-1.5 px-3 text-sm font-medium" style={{color: '#0a2240'}}>
              <span className="material-symbols-outlined">add</span>
              New Call
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 bg-gray-50/50">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calls Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg border">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Calls by Day</p>
                  <p className="text-3xl font-bold mt-1" style={{color: '#0a2240'}}>1,287</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-gray-500">Last 7 Days</p>
                    <p className="text-sm font-medium text-green-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">arrow_upward</span>
                      15%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-gray-400 hover:text-gray-900">
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button className="text-gray-400 hover:text-gray-900">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-4 items-end mt-6 h-48">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-md" style={{height: "25%", backgroundColor: '#e1f5fe'}}></div>
                  <p className="text-xs text-gray-500 font-medium">Mon</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-md" style={{height: "60%", backgroundColor: '#e1f5fe'}}></div>
                  <p className="text-xs text-gray-500 font-medium">Tue</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-md" style={{height: "80%", backgroundColor: '#3dbff2'}}></div>
                  <p className="text-xs font-bold" style={{color: '#0a2240'}}>Wed</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-md" style={{height: "70%", backgroundColor: '#e1f5fe'}}></div>
                  <p className="text-xs text-gray-500 font-medium">Thu</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-md" style={{height: "45%", backgroundColor: '#e1f5fe'}}></div>
                  <p className="text-xs text-gray-500 font-medium">Fri</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-md" style={{height: "85%", backgroundColor: '#e1f5fe'}}></div>
                  <p className="text-xs text-gray-500 font-medium">Sat</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-md" style={{height: "15%", backgroundColor: '#e1f5fe'}}></div>
                  <p className="text-xs text-gray-500 font-medium">Sun</p>
                </div>
              </div>
            </div>

            {/* Call Outcomes */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-sm text-gray-500 mb-4">Call Outcomes</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <p className="font-medium w-28" style={{color: '#0a2240'}}>Answered</p>
                  <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full" style={{width: "50%", backgroundColor: '#3dbff2'}}></div>
                  </div>
                  <p className="text-sm font-semibold ml-4" style={{color: '#0a2240'}}>60</p>
                </div>
                <div className="flex items-center">
                  <p className="font-medium w-28" style={{color: '#0a2240'}}>No Answer</p>
                  <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full" style={{width: "33.3%", backgroundColor: '#3dbff2'}}></div>
                  </div>
                  <p className="text-sm font-semibold ml-4" style={{color: '#0a2240'}}>40</p>
                </div>
                <div className="flex items-center">
                  <p className="font-medium w-28" style={{color: '#0a2240'}}>Voicemail</p>
                  <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full" style={{width: "16.7%", backgroundColor: '#3dbff2'}}></div>
                  </div>
                  <p className="text-sm font-semibold ml-4" style={{color: '#0a2240'}}>20</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Calls Table */}
          <div className="mt-8 bg-white rounded-lg border">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-bold" style={{color: '#0a2240'}}>Recent Calls</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500">
                  <tr>
                    <th className="px-6 py-3 font-medium">Caller</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Duration</th>
                    <th className="px-6 py-3 font-medium text-center">Outcome</th>
                    <th className="px-6 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody style={{color: '#0a2240'}}>
                  <tr className="border-t">
                    <td className="px-6 py-4 font-medium">Ethan Carter</td>
                    <td className="px-6 py-4 text-gray-600">2024-03-15</td>
                    <td className="px-6 py-4 text-gray-600">5 min 24s</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Answered</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-900">
                        <span className="material-symbols-outlined">more_horiz</span>
                      </button>
                    </td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-6 py-4 font-medium">Olivia Bennett</td>
                    <td className="px-6 py-4 text-gray-600">2024-03-14</td>
                    <td className="px-6 py-4 text-gray-600">2 min 10s</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">No Answer</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-900">
                        <span className="material-symbols-outlined">more_horiz</span>
                      </button>
                    </td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-6 py-4 font-medium">Liam Harper</td>
                    <td className="px-6 py-4 text-gray-600">2024-03-13</td>
                    <td className="px-6 py-4 text-gray-600">3 min 05s</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Voicemail</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-900">
                        <span className="material-symbols-outlined">more_horiz</span>
                      </button>
                    </td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-6 py-4 font-medium">Ava Morgan</td>
                    <td className="px-6 py-4 text-gray-600">2024-03-12</td>
                    <td className="px-6 py-4 text-gray-600">10 min 45s</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Answered</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-900">
                        <span className="material-symbols-outlined">more_horiz</span>
                      </button>
                    </td>
                  </tr>
                  <tr className="border-t">
                    <td className="px-6 py-4 font-medium">Noah Foster</td>
                    <td className="px-6 py-4 text-gray-600">2024-03-11</td>
                    <td className="px-6 py-4 text-gray-600">1 min 30s</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">No Answer</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-900">
                        <span className="material-symbols-outlined">more_horiz</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t flex justify-between items-center text-sm text-gray-600">
              <p>Showing 1 to 5 of 57 results</p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 border rounded-md hover:bg-gray-100">Previous</button>
                <button className="px-3 py-1 border rounded-md text-white" style={{backgroundColor: '#3dbff2'}}>1</button>
                <button className="px-3 py-1 border rounded-md hover:bg-gray-100">2</button>
                <button className="px-3 py-1 border rounded-md hover:bg-gray-100">3</button>
                <span>...</span>
                <button className="px-3 py-1 border rounded-md hover:bg-gray-100">12</button>
                <button className="px-3 py-1 border rounded-md hover:bg-gray-100">Next</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}