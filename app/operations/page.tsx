'use client'

import React from "react";

export default function OperationsConsole() {
  return (
    <div className="flex min-h-screen bg-white" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
      {/* Sidebar */}
      <aside className="w-64 flex flex-col text-white" style={{backgroundColor: '#0a2240'}}>
        <div className="flex items-center gap-3 p-6 border-b border-white/10">
          <div className="w-8 h-8 flex items-center justify-center rounded-md text-white" style={{backgroundColor: '#3dbff2', color: '#0a2240'}}>
            <span className="material-symbols-outlined">dvr</span>
          </div>
          <h1 className="text-xl font-bold">Cold Solutions</h1>
        </div>
        
        <nav className="flex-1 p-4">
          <a className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-md hover:bg-white/10" href="/">
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </a>
          <a className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-md hover:bg-white/10 mt-1" href="/leads">
            <span className="material-symbols-outlined">group</span>
            Leads Database
          </a>
          <a className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-md hover:bg-white/10 mt-1" href="/calls">
            <span className="material-symbols-outlined">call</span>
            Calls Database
          </a>
          <a className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-md hover:bg-white/10 mt-1" href="/analytics">
            <span className="material-symbols-outlined">analytics</span>
            Performance Analytics
          </a>
          <a className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-md mt-1 text-white" style={{backgroundColor: '#3dbff2', color: '#0a2240'}} href="/operations">
            <span className="material-symbols-outlined">dvr</span>
            Operations Console
          </a>
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <a className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-md hover:bg-white/10" href="#">
            <span className="material-symbols-outlined">settings</span>
            Settings
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Header */}
        <header className="flex items-center justify-between border-b px-8 py-4">
          <h2 className="text-2xl font-bold" style={{color: '#0a2240'}}>Operations Console</h2>
          <div className="flex items-center gap-4">
            <button className="relative hover:text-gray-900" style={{color: '#0a2240'}}>
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white" style={{backgroundColor: '#3dbff2'}}></span>
            </button>
            <button className="flex items-center gap-2 rounded-md border py-1.5 px-3 text-sm font-medium" style={{color: '#0a2240'}}>
              <span className="material-symbols-outlined">refresh</span>
              Sync All
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 bg-gray-50/50">
          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">System Status</p>
                  <p className="text-lg font-semibold mt-1 text-green-600">All Systems Operational</p>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <span className="material-symbols-outlined text-green-600">check_circle</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active AI Agents</p>
                  <p className="text-2xl font-bold mt-1" style={{color: '#0a2240'}}>3</p>
                </div>
                <div className="p-3 rounded-full" style={{backgroundColor: '#e1f5fe'}}>
                  <span className="material-symbols-outlined" style={{color: '#3dbff2'}}>psychology</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Queue Depth</p>
                  <p className="text-2xl font-bold mt-1" style={{color: '#0a2240'}}>47</p>
                </div>
                <div className="p-3 rounded-full" style={{backgroundColor: '#e1f5fe'}}>
                  <span className="material-symbols-outlined" style={{color: '#3dbff2'}}>queue</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold mb-4" style={{color: '#0a2240'}}>Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="material-symbols-outlined text-2xl" style={{color: '#3dbff2'}}>play_arrow</span>
                  <span className="text-sm font-medium">Start Agent</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="material-symbols-outlined text-2xl" style={{color: '#3dbff2'}}>pause</span>
                  <span className="text-sm font-medium">Pause Agent</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="material-symbols-outlined text-2xl" style={{color: '#3dbff2'}}>sync</span>
                  <span className="text-sm font-medium">Sync KB</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="material-symbols-outlined text-2xl" style={{color: '#3dbff2'}}>restart_alt</span>
                  <span className="text-sm font-medium">Restart</span>
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold mb-4" style={{color: '#0a2240'}}>System Health</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Response Time</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-green-600">142ms</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Memory Usage</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{width: '68%', backgroundColor: '#3dbff2'}}></div>
                    </div>
                    <span className="text-sm font-medium" style={{color: '#3dbff2'}}>68%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Error Rate</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{width: '12%'}}></div>
                    </div>
                    <span className="text-sm font-medium text-red-600">0.8%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Agent Management */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-8">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>AI Agent Management</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500 bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 font-medium">Agent ID</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Last Active</th>
                    <th className="px-6 py-3 font-medium">Version</th>
                    <th className="px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 font-medium" style={{color: '#0a2240'}}>AI-Voice-Agent-001</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Running</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">2 minutes ago</td>
                    <td className="px-6 py-4 text-gray-600">v2.1.4</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="text-gray-400 hover:text-gray-600">
                          <span className="material-symbols-outlined text-base">pause</span>
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <span className="material-symbols-outlined text-base">restart_alt</span>
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <span className="material-symbols-outlined text-base">settings</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium" style={{color: '#0a2240'}}>AI-Voice-Agent-002</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Running</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">1 minute ago</td>
                    <td className="px-6 py-4 text-gray-600">v2.1.4</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="text-gray-400 hover:text-gray-600">
                          <span className="material-symbols-outlined text-base">pause</span>
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <span className="material-symbols-outlined text-base">restart_alt</span>
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <span className="material-symbols-outlined text-base">settings</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium" style={{color: '#0a2240'}}>AI-Voice-Agent-003</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Training</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">5 minutes ago</td>
                    <td className="px-6 py-4 text-gray-600">v2.0.8</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="text-gray-400 hover:text-gray-600">
                          <span className="material-symbols-outlined text-base">play_arrow</span>
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <span className="material-symbols-outlined text-base">restart_alt</span>
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <span className="material-symbols-outlined text-base">settings</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Logs */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>Recent System Logs</h3>
              <button className="text-sm text-gray-600 hover:text-gray-900">View All</button>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">AI-Voice-Agent-001 successfully completed call with lead #1247</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">Knowledge base synchronized successfully</p>
                    <p className="text-xs text-gray-500">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">AI-Voice-Agent-003 entered training mode for performance optimization</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">System backup completed successfully</p>
                    <p className="text-xs text-gray-500">3 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}