'use client'

import React, { useState, useEffect } from 'react';
import { MakeService, MakeScenario, MakeExecution, MakeOrganization } from '../lib/make-service';

interface MakeStats {
  totalScenarios: number;
  activeScenarios: number;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  averageSuccessRate: number;
}

interface MakeIntegrationProps {
  className?: string;
}

export function MakeIntegration({ className = '' }: MakeIntegrationProps) {
  const [scenarios, setScenarios] = useState<MakeScenario[]>([]);
  const [recentExecutions, setRecentExecutions] = useState<MakeExecution[]>([]);
  const [makeStats, setMakeStats] = useState<MakeStats>({
    totalScenarios: 0,
    activeScenarios: 0,
    totalRuns: 0,
    successfulRuns: 0,
    failedRuns: 0,
    averageSuccessRate: 0,
  });
  const [organization, setOrganization] = useState<MakeOrganization | null>(null);
  const [usagePercentage, setUsagePercentage] = useState({ operations: 0, dataTransfer: 0, scenarios: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const initMakeService = async () => {
      // For Next.js, we need to fetch credentials from our API route since process.env isn't available client-side
      try {
        const response = await fetch('/api/make-config');
        const config = await response.json();

        if (!config.apiToken || !config.organizationId) {
          setIsConfigured(false);
          const debugInfo = config.debug ? ` Debug: ${JSON.stringify(config.debug)}` : '';
          setError(`Make.com API credentials not configured. Please add MAKE_API_TOKEN and MAKE_ORGANIZATION_ID to your environment variables.${debugInfo}`);
          setLoading(false);
          return;
        }

        MakeService.initialize(config.apiToken, config.organizationId);
        setIsConfigured(true);
        await loadMakeData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize Make service');
        setLoading(false);
      }
    };

    initMakeService();
  }, []);

  const loadMakeData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [scenariosData, executionsData, usageData] = await Promise.all([
        MakeService.getAllScenariosWithStats(),
        MakeService.getRecentExecutions(10),
        MakeService.getUsageStats(),
      ]);

      if (scenariosData.error) {
        throw new Error(scenariosData.error);
      }

      if (executionsData.error) {
        console.warn('Failed to load executions:', executionsData.error);
      }

      if (usageData.error) {
        console.warn('Failed to load usage stats:', usageData.error);
      }

      setScenarios(scenariosData.scenarios);
      setMakeStats(scenariosData.totalStats);
      setRecentExecutions(executionsData.executions);
      setOrganization(usageData.organization || null);
      setUsagePercentage(usageData.usagePercentage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Make data');
    } finally {
      setLoading(false);
    }
  };

  const toggleScenario = async (scenarioId: string, isActive: boolean) => {
    try {
      if (isActive) {
        await MakeService.deactivateScenario(scenarioId);
      } else {
        await MakeService.activateScenario(scenarioId);
      }

      await loadMakeData();
    } catch (err) {
      console.error('Failed to toggle scenario:', err);
    }
  };

  const runScenario = async (scenarioId: string) => {
    try {
      const result = await MakeService.runScenario(scenarioId);
      if (result.error) {
        throw new Error(result.error.message);
      }

      setTimeout(() => loadMakeData(), 2000);
    } catch (err) {
      console.error('Failed to run scenario:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isConfigured) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-yellow-600">warning</span>
          <div>
            <h3 className="font-semibold text-yellow-800">Make.com Integration Not Configured</h3>
            <p className="text-sm text-yellow-700 mt-1">
              To view your Make automations, please configure your API credentials in the environment variables.
            </p>
            <div className="mt-3 text-xs text-yellow-600">
              <p>Required environment variables:</p>
              <ul className="list-disc list-inside mt-1 ml-2">
                <li>MAKE_API_TOKEN</li>
                <li>MAKE_ORGANIZATION_ID</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border shadow-sm p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3dbff2]"></div>
          <span className="ml-3 text-gray-600">Loading Make automations...</span>
        </div>
      </div>
    );
  }

  if (error) {
    const isAuthError = error.includes('401') || error.includes('Unauthorized') || error.includes('Access denied');

    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-red-600">error</span>
          <div>
            <h3 className="font-semibold text-red-800">
              {isAuthError ? 'Make.com Authentication Error' : 'Failed to Load Make Data'}
            </h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>

            {isAuthError && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <p className="text-yellow-800 font-medium">Possible Solutions:</p>
                <ul className="list-disc list-inside mt-1 text-yellow-700 text-xs">
                  <li>Verify your Make.com API token is correct</li>
                  <li>Check that your token has the required scopes: <strong>Organizations, Scenarios, Executions</strong></li>
                  <li>Ensure your token is for the correct Make.com region</li>
                  <li>Generate a new API token from: Make → Profile → API → Add token</li>
                </ul>
              </div>
            )}

            <button
              onClick={loadMakeData}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Make.com Overview Stats */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#7C3AED] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Make.com Automations</h3>
              <p className="text-sm text-gray-500">
                {organization?.name || 'Organization'} - {organization?.plan || 'Plan'}
              </p>
            </div>
          </div>
          <button
            onClick={loadMakeData}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border rounded-md hover:bg-gray-50"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Scenarios</p>
                  <p className="text-2xl font-bold text-blue-900">{makeStats.totalScenarios}</p>
                  <p className="text-xs text-blue-700">{makeStats.activeScenarios} active</p>
                </div>
                <span className="material-symbols-outlined text-blue-600 text-3xl">auto_awesome</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Total Executions</p>
                  <p className="text-2xl font-bold text-green-900">{makeStats.totalRuns.toLocaleString()}</p>
                  <p className="text-xs text-green-700">{makeStats.successfulRuns.toLocaleString()} successful</p>
                </div>
                <span className="material-symbols-outlined text-green-600 text-3xl">play_arrow</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Success Rate</p>
                  <p className="text-2xl font-bold text-purple-900">{makeStats.averageSuccessRate.toFixed(1)}%</p>
                  <p className="text-xs text-purple-700">{makeStats.failedRuns} failures</p>
                </div>
                <span className="material-symbols-outlined text-purple-600 text-3xl">trending_up</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Operations Used</p>
                  <p className="text-2xl font-bold text-orange-900">{usagePercentage.operations.toFixed(1)}%</p>
                  <p className="text-xs text-orange-700">
                    {organization?.usage.operations.toLocaleString()} / {organization?.limits.operations.toLocaleString()}
                  </p>
                </div>
                <span className="material-symbols-outlined text-orange-600 text-3xl">data_usage</span>
              </div>
            </div>
          </div>

          {/* Usage Progress Bars */}
          {organization && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Resource Usage</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Operations</span>
                    <span className="text-gray-900">
                      {organization.usage.operations.toLocaleString()} / {organization.limits.operations.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min(usagePercentage.operations, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Data Transfer</span>
                    <span className="text-gray-900">
                      {MakeService.formatDataTransfer(organization.usage.dataTransfer)} / {MakeService.formatDataTransfer(organization.limits.dataTransfer)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${Math.min(usagePercentage.dataTransfer, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Scenarios</span>
                    <span className="text-gray-900">
                      {organization.usage.scenarios} / {organization.limits.scenarios}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${Math.min(usagePercentage.scenarios, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scenarios List */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Active Scenarios ({scenarios.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Scenario</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Last Run</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {scenarios.slice(0, 10).map((scenario) => (
                <tr key={scenario.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{scenario.name}</div>
                      {scenario.description && (
                        <div className="text-xs text-gray-500">{scenario.description}</div>
                      )}
                      {scenario.folder && (
                        <div className="text-xs text-gray-400 mt-1">
                          📁 {scenario.folder.name}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${MakeService.getStatusColor(scenario.status)}`}>
                      {scenario.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div>Total: <span className="font-medium">{scenario.stats.totalRuns}</span></div>
                      <div className="text-xs text-gray-500">
                        Success: {scenario.stats.successfulRuns} / Failed: {scenario.stats.failedRuns}
                      </div>
                      <div className="text-xs text-gray-500">
                        Rate: {scenario.stats.totalRuns > 0
                          ? ((scenario.stats.successfulRuns / scenario.stats.totalRuns) * 100).toFixed(1)
                          : 100}%
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {scenario.lastRun ? (
                      <div className="text-sm">
                        <div>{formatDate(scenario.lastRun)}</div>
                        {scenario.nextRun && (
                          <div className="text-xs text-gray-500">
                            Next: {formatDate(scenario.nextRun)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">Never run</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleScenario(scenario.id, scenario.status === 'active')}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          scenario.status === 'active'
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {scenario.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => runScenario(scenario.id)}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium hover:bg-blue-200"
                      >
                        Run Now
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Executions */}
      {recentExecutions.length > 0 && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Executions ({recentExecutions.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Execution</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Scenario</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentExecutions.map((execution) => {
                  const scenario = scenarios.find(s => s.id === execution.scenarioId);
                  return (
                    <tr key={execution.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-mono text-xs text-gray-600">{execution.id.slice(-8)}</div>
                          <div className="text-xs text-gray-500">{formatDate(execution.startedAt)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {scenario?.name || 'Unknown Scenario'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${MakeService.getStatusColor(execution.status)}`}>
                          {execution.status}
                        </span>
                        {execution.errorMessage && (
                          <div className="text-xs text-red-600 mt-1">{execution.errorMessage}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {MakeService.formatExecutionTime(execution.executionTime)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div>{execution.operations} ops</div>
                          <div className="text-xs text-gray-500">
                            {MakeService.formatDataTransfer(execution.dataTransferred)}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}