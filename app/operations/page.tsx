'use client'

import React, { useState, useEffect } from "react";
import StandardSidebar from "../../components/StandardSidebar";
import ProtectedRoute from "../../components/ProtectedRoute";

function OperationsConsolePage() {
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

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden" style={{fontFamily: 'Inter, "Noto Sans", sans-serif', position: 'relative'}}>
      <StandardSidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-h-screen" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <header className="glass-card border-0 p-6 m-4 mb-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{color: '#0a2240'}}>Operations Console</h1>
              <p className="text-gray-600 mt-1">Monitor and manage your AI voice agents and system operations</p>
            </div>
            <div className="flex items-center gap-4">
              {lastRefresh && (
                <div className="text-xs text-gray-500">
                  Last update: {lastRefresh.toLocaleTimeString()}
                </div>
              )}
              <button
                onClick={fetchOperationalData}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 glass-card hover:scale-105 transition-all disabled:opacity-50"
              >
                <span className={`material-symbols-outlined ${isLoading ? 'animate-spin' : ''}`}>refresh</span>
                <span className="text-sm font-medium text-gray-700">{isLoading ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex flex-col gap-8 p-6">
          {/* System Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-2xl text-green-600">check_circle</span>
                <p className="text-gray-600 text-base font-medium">System Status</p>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {operationalStats?.system_status === 'operational' ? 'Operational' :
                 operationalStats?.system_status === 'degraded' ? 'Degraded' :
                 operationalStats?.system_status === 'down' ? 'Down' : 'Unknown'}
              </p>
              <p className="text-sm text-gray-500 mt-2">All systems running normally</p>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-2xl text-blue-600">psychology</span>
                <p className="text-gray-600 text-base font-medium">Active AI Agents</p>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {isLoading ? '...' : operationalStats?.active_agents || 0}
              </p>
              <p className="text-sm text-gray-500 mt-2">Voice agents online</p>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-2xl text-purple-600">queue</span>
                <p className="text-gray-600 text-base font-medium">Queue Depth</p>
              </div>
              <p className="text-3xl font-bold text-purple-600">
                {isLoading ? '...' : operationalStats?.queue_depth || 0}
              </p>
              <p className="text-sm text-gray-500 mt-2">Calls in queue</p>
            </div>
          </div>

          {/* Call Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-2xl text-green-600">call</span>
                <p className="text-gray-600 text-base font-medium">Voice Calls</p>
              </div>
              <p className="text-3xl font-bold" style={{color: '#10b981'}}>
                {isLoading ? '...' : operationalStats?.voice_agent_calls_today || 0}
              </p>
              <p className="text-sm text-gray-500 mt-2">Today</p>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-2xl text-amber-600">timer</span>
                <p className="text-gray-600 text-base font-medium">Avg Duration</p>
              </div>
              <p className="text-3xl font-bold" style={{color: '#f59e0b'}}>
                {isLoading ? '...' : `${operationalStats?.average_call_duration || 0}s`}
              </p>
              <p className="text-sm text-gray-500 mt-2">Per call</p>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-2xl text-purple-600">schedule</span>
                <p className="text-gray-600 text-base font-medium">Total Minutes</p>
              </div>
              <p className="text-3xl font-bold" style={{color: '#8b5cf6'}}>
                {isLoading ? '...' : operationalStats?.total_call_minutes_today || 0}
              </p>
              <p className="text-sm text-gray-500 mt-2">Today</p>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-2xl text-blue-600">verified</span>
                <p className="text-gray-600 text-base font-medium">Published</p>
              </div>
              <p className="text-3xl font-bold" style={{color: '#3dbff2'}}>
                {isLoading ? '...' : operationalStats?.published_agents || 0}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                of {operationalStats?.active_agents || 0} agents
              </p>
            </div>
          </div>

          {/* Quick Actions and System Health */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4" style={{color: '#0a2240'}}>Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center gap-3 p-4 glass-card hover:scale-105 transition-all border-0">
                  <span className="material-symbols-outlined text-3xl text-green-600">play_circle</span>
                  <span className="text-sm font-medium text-gray-700">Start Agent</span>
                </button>
                <button className="flex flex-col items-center gap-3 p-4 glass-card hover:scale-105 transition-all border-0">
                  <span className="material-symbols-outlined text-3xl text-amber-600">pause_circle</span>
                  <span className="text-sm font-medium text-gray-700">Pause Agent</span>
                </button>
                <button className="flex flex-col items-center gap-3 p-4 glass-card hover:scale-105 transition-all border-0">
                  <span className="material-symbols-outlined text-3xl text-blue-600">sync</span>
                  <span className="text-sm font-medium text-gray-700">Sync KB</span>
                </button>
                <button className="flex flex-col items-center gap-3 p-4 glass-card hover:scale-105 transition-all border-0">
                  <span className="material-symbols-outlined text-3xl text-red-600">restart_alt</span>
                  <span className="text-sm font-medium text-gray-700">Restart</span>
                </button>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4" style={{color: '#0a2240'}}>System Health</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Response Time</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
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
                  <span className="text-sm text-gray-600">Memory Usage</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
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
                  <span className="text-sm text-gray-600">Error Rate</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
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

          {/* Agent Management Table */}
          <div className="glass-card">
            <div className="px-6 py-4 border-b border-white border-opacity-30">
              <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>AI Agent Management</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-white border-opacity-30" style={{background: 'rgba(249, 250, 251, 0.5)'}}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Agent ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Last Active</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Version</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">Actions</th>
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
                        <tr key={agent.id} className="hover:bg-gray-50 transition-colors">
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
                                className="text-blue-600 hover:scale-110 transition-transform"
                                title="View Agent Details"
                                onClick={() => console.log('View agent:', agent.id)}
                              >
                                <span className="material-symbols-outlined text-xl">visibility</span>
                              </button>
                              <button
                                className="text-gray-600 hover:scale-110 transition-transform"
                                title="Agent Settings"
                                onClick={() => console.log('Settings for:', agent.id)}
                              >
                                <span className="material-symbols-outlined text-xl">settings</span>
                              </button>
                              <button
                                className="text-green-600 hover:scale-110 transition-transform"
                                title="Test Agent"
                                onClick={() => console.log('Test agent:', agent.id)}
                              >
                                <span className="material-symbols-outlined text-xl">play_circle</span>
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

          {/* Recent System Logs */}
          <div className="glass-card">
            <div className="px-6 py-4 border-b border-white border-opacity-30 flex items-center justify-between">
              <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>Recent System Logs</h3>
              <button className="text-sm text-blue-600 hover:underline">View All</button>
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
                  {systemLogs.map((log, index) => {
                    const getSeverityColor = (severity: string) => {
                      switch (severity) {
                        case 'success': return 'text-green-600';
                        case 'warning': return 'text-yellow-600';
                        case 'error': return 'text-red-600';
                        case 'info': return 'text-blue-600';
                        default: return 'text-gray-600';
                      }
                    };

                    const getSeverityIcon = (severity: string) => {
                      switch (severity) {
                        case 'success': return 'check_circle';
                        case 'warning': return 'warning';
                        case 'error': return 'error';
                        case 'info': return 'info';
                        default: return 'circle';
                      }
                    };

                    return (
                      <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl hover:glass-button transition-all">
                        <span className={`material-symbols-outlined text-xl ${getSeverityColor(log.severity)}`}>
                          {getSeverityIcon(log.severity)}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">{log.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{log.timestamp}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ProtectedOperationsConsole() {
  return (
    <ProtectedRoute>
      <OperationsConsolePage />
    </ProtectedRoute>
  );
}
