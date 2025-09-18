'use client'

import React, { useState, useEffect } from "react";

export default function OperationsConsole() {
  const [operationalStats, setOperationalStats] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Fetch operational data
  const fetchOperationalData = async () => {
    try {
      setIsLoading(true);

      // Fetch operational stats
      const statsResponse = await fetch('/api/operations/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setOperationalStats(statsData.stats);
      }

      // Fetch Retell AI agents
      const agentsResponse = await fetch('/api/retell/agents');
      if (agentsResponse.ok) {
        const agentsData = await agentsResponse.json();
        setAgents(agentsData.agents || []);
      }

      // Fetch system logs
      const logsResponse = await fetch('/api/operations/logs?limit=5');
      if (logsResponse.ok) {
        const logsData = await logsResponse.json();
        setSystemLogs(logsData.logs || []);
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching operational data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchOperationalData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOperationalData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Determine system status color
  const getSystemStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return { bg: 'bg-green-100', text: 'text-green-600', icon: 'check_circle' };
      case 'degraded': return { bg: 'bg-yellow-100', text: 'text-yellow-600', icon: 'warning' };
      case 'down': return { bg: 'bg-red-100', text: 'text-red-600', icon: 'error' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-600', icon: 'help' };
    }
  };

  // Get agent status badge color
  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'training': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get log severity color
  const getLogSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const systemStatus = getSystemStatusColor(operationalStats?.system_status || 'operational');

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
            <div className="flex items-center gap-4">
              {lastRefresh && (
                <span className="text-sm text-gray-600">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={fetchOperationalData}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-md border py-1.5 px-3 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{color: '#0a2240'}}
              >
                <span className={`material-symbols-outlined ${isLoading ? 'animate-spin' : ''}`}>refresh</span>
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
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
                  <p className={`text-lg font-semibold mt-1 ${systemStatus.text}`}>
                    {operationalStats?.system_status === 'operational' ? 'All Systems Operational' :
                     operationalStats?.system_status === 'degraded' ? 'Performance Degraded' :
                     operationalStats?.system_status === 'down' ? 'System Issues Detected' : 'Unknown Status'}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${systemStatus.bg}`}>
                  <span className={`material-symbols-outlined ${systemStatus.text}`}>{systemStatus.icon}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active AI Agents</p>
                  <p className="text-2xl font-bold mt-1" style={{color: '#0a2240'}}>
                    {isLoading ? '...' : operationalStats?.active_agents || 0}
                  </p>
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
                  <p className="text-2xl font-bold mt-1" style={{color: '#0a2240'}}>
                    {isLoading ? '...' : operationalStats?.queue_depth || 0}
                  </p>
                </div>
                <div className="p-3 rounded-full" style={{backgroundColor: '#e1f5fe'}}>
                  <span className="material-symbols-outlined" style={{color: '#3dbff2'}}>queue</span>
                </div>
              </div>
            </div>
          </div>

          {/* Call Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Voice Agent Calls</p>
                  <p className="text-2xl font-bold mt-1" style={{color: '#10b981'}}>
                    {isLoading ? '...' : operationalStats?.voice_agent_calls_today || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Today</p>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <span className="material-symbols-outlined text-green-600">record_voice_over</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Call Duration</p>
                  <p className="text-2xl font-bold mt-1" style={{color: '#f59e0b'}}>
                    {isLoading ? '...' : `${operationalStats?.average_call_duration || 0}s`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Today</p>
                </div>
                <div className="p-3 rounded-full bg-yellow-100">
                  <span className="material-symbols-outlined text-yellow-600">timer</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Call Minutes</p>
                  <p className="text-2xl font-bold mt-1" style={{color: '#8b5cf6'}}>
                    {isLoading ? '...' : operationalStats?.total_call_minutes_today || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Today</p>
                </div>
                <div className="p-3 rounded-full bg-purple-100">
                  <span className="material-symbols-outlined text-purple-600">schedule</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Published Agents</p>
                  <p className="text-2xl font-bold mt-1" style={{color: '#3dbff2'}}>
                    {isLoading ? '...' : operationalStats?.published_agents || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    of {operationalStats?.active_agents || 0} total
                  </p>
                </div>
                <div className="p-3 rounded-full" style={{backgroundColor: '#e1f5fe'}}>
                  <span className="material-symbols-outlined" style={{color: '#3dbff2'}}>verified</span>
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
                      <div
                        className={`h-2 rounded-full ${
                          (operationalStats?.api_response_time || 0) > 200 ? 'bg-red-500' :
                          (operationalStats?.api_response_time || 0) > 150 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{width: `${Math.min(100, ((operationalStats?.api_response_time || 0) / 300) * 100)}%`}}
                      ></div>
                    </div>
                    <span className={`text-sm font-medium ${
                      (operationalStats?.api_response_time || 0) > 200 ? 'text-red-600' :
                      (operationalStats?.api_response_time || 0) > 150 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {isLoading ? '...' : `${operationalStats?.api_response_time || 0}ms`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Memory Usage</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          (operationalStats?.memory_usage || 0) > 85 ? 'bg-red-500' :
                          (operationalStats?.memory_usage || 0) > 70 ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}
                        style={{width: `${operationalStats?.memory_usage || 0}%`}}
                      ></div>
                    </div>
                    <span className={`text-sm font-medium ${
                      (operationalStats?.memory_usage || 0) > 85 ? 'text-red-600' :
                      (operationalStats?.memory_usage || 0) > 70 ? 'text-yellow-600' : 'text-blue-600'
                    }`}>
                      {isLoading ? '...' : `${operationalStats?.memory_usage || 0}%`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Error Rate</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          (operationalStats?.error_rate || 0) > 5 ? 'bg-red-500' :
                          (operationalStats?.error_rate || 0) > 2 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{width: `${Math.min(100, (operationalStats?.error_rate || 0) * 10)}%`}}
                      ></div>
                    </div>
                    <span className={`text-sm font-medium ${
                      (operationalStats?.error_rate || 0) > 5 ? 'text-red-600' :
                      (operationalStats?.error_rate || 0) > 2 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {isLoading ? '...' : `${operationalStats?.error_rate || 0}%`}
                    </span>
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
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3dbff2] mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Loading agents...</p>
                      </td>
                    </tr>
                  ) : agents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <span className="material-symbols-outlined text-4xl mb-2 block">psychology</span>
                          <p className="text-sm">No Retell AI agents found</p>
                          <p className="text-xs mt-1">Configure your RETELL_API_KEY to see your agents</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    agents.map((agent, index) => {
                      const getLastModifiedTime = (timestamp: string) => {
                        const date = new Date(timestamp);
                        const now = new Date();
                        const diffTime = Math.abs(now.getTime() - date.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
                      };

                      return (
                        <tr key={agent.id}>
                          <td className="px-6 py-4 font-medium" style={{color: '#0a2240'}}>
                            {agent.name}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAgentStatusColor(agent.status)}`}>
                              {agent.status === 'active' ? 'Active' : agent.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {getLastModifiedTime(agent.last_modified)}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            <div className="text-xs">
                              <div>{agent.language || 'en-US'}</div>
                              <div className="text-gray-400">{agent.response_engine}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                className="text-gray-400 hover:text-gray-600"
                                title="View Agent Details"
                                onClick={() => console.log('View agent:', agent.id)}
                              >
                                <span className="material-symbols-outlined text-base">visibility</span>
                              </button>
                              <button
                                className="text-gray-400 hover:text-gray-600"
                                title="Agent Settings"
                                onClick={() => console.log('Settings for:', agent.id)}
                              >
                                <span className="material-symbols-outlined text-base">settings</span>
                              </button>
                              <button
                                className="text-gray-400 hover:text-gray-600"
                                title="Test Agent"
                                onClick={() => console.log('Test agent:', agent.id)}
                              >
                                <span className="material-symbols-outlined text-base">play_arrow</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
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
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#3dbff2]"></div>
                  <span className="ml-2 text-sm text-gray-500">Loading logs...</span>
                </div>
              ) : systemLogs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">
                    <span className="material-symbols-outlined text-4xl mb-2 block">description</span>
                    <p className="text-sm">No recent system activity</p>
                    <p className="text-xs mt-1">System logs will appear here as events occur</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {systemLogs.map((log, index) => (
                    <div key={log.id} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${getLogSeverityColor(log.severity)}`}></div>
                      <div className="flex-1">
                        <p className="text-sm">{log.message}</p>
                        <p className="text-xs text-gray-500">{log.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}