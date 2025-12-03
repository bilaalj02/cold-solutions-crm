'use client'

import React, { useState, useEffect } from "react";
import { AdvancedAnalytics, KPIMetric, TerritoryPerformance, ChannelPerformance, ConversionFunnelStep, RevenueData, ForecastData, AutomationMetric, MakeAutomationStats } from "../../lib/advanced-analytics";
import { LeadManager } from "../../lib/leads";
import { EmailManager } from "../../lib/email-system";
import StandardSidebar from "../../components/StandardSidebar";
import ProtectedRoute from "../../components/ProtectedRoute";

type TimePeriod = 'last7days' | 'last30days' | 'last90days' | 'last6months' | 'last12months';
type ChartType = 'overview' | 'revenue' | 'conversion' | 'territories' | 'channels' | 'forecasting' | 'automation' | 'email';

export default function AdvancedAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<ChartType>('overview');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('last30days');
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetric[]>([]);
  const [territoryData, setTerritoryData] = useState<TerritoryPerformance[]>([]);
  const [channelData, setChannelData] = useState<ChannelPerformance[]>([]);
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnelStep[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [automationMetrics, setAutomationMetrics] = useState<AutomationMetric[]>([]);
  const [makeStats, setMakeStats] = useState<MakeAutomationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredChart, setHoveredChart] = useState<string | null>(null);

  // Email analytics state
  const [emailStats, setEmailStats] = useState<any>(null);
  const [emailSends, setEmailSends] = useState<any[]>([]);
  const [templateStats, setTemplateStats] = useState<any[]>([]);

  useEffect(() => {
    loadAnalyticsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timePeriod]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const leads = LeadManager.getLeads();
      setKpiMetrics(AdvancedAnalytics.getKPIMetrics(leads));
      setTerritoryData(AdvancedAnalytics.getTerritoryPerformance());
      setChannelData(AdvancedAnalytics.getChannelPerformance());
      setConversionFunnel(AdvancedAnalytics.getConversionFunnel(leads));
      setRevenueData(AdvancedAnalytics.getRevenueData());
      setForecastData(AdvancedAnalytics.getRevenueForecast());
      setAutomationMetrics(AdvancedAnalytics.getAutomationMetrics());
      setMakeStats(AdvancedAnalytics.getMakeAutomationStats());

      // Load email analytics
      await loadEmailAnalytics();
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmailAnalytics = async () => {
    try {
      // Fetch email sends from API
      const response = await fetch('/api/email/track?limit=50');
      if (response.ok) {
        const data = await response.json();
        setEmailSends(data.data || []);

        // Calculate stats from email sends
        const sends = data.data || [];
        const totalSent = sends.length;
        const delivered = sends.filter((s: any) => s.status === 'delivered').length;
        const failed = sends.filter((s: any) => s.status === 'failed').length;
        const deliveryRate = totalSent > 0 ? ((delivered / totalSent) * 100).toFixed(1) : '0';

        // Group by industry
        const byIndustry = sends.reduce((acc: any, send: any) => {
          const industry = send.industry || 'general';
          if (!acc[industry]) {
            acc[industry] = { sent: 0, delivered: 0, failed: 0 };
          }
          acc[industry].sent++;
          if (send.status === 'delivered') acc[industry].delivered++;
          if (send.status === 'failed') acc[industry].failed++;
          return acc;
        }, {});

        // Group by template
        const byTemplate = sends.reduce((acc: any, send: any) => {
          const template = send.template_name;
          if (!acc[template]) {
            acc[template] = { name: template, sent: 0, delivered: 0, failed: 0 };
          }
          acc[template].sent++;
          if (send.status === 'delivered') acc[template].delivered++;
          if (send.status === 'failed') acc[template].failed++;
          return acc;
        }, {});

        setEmailStats({
          totalSent,
          delivered,
          failed,
          deliveryRate,
          byIndustry
        });

        setTemplateStats(Object.values(byTemplate));
      }
    } catch (error) {
      console.error('Error loading email analytics:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100';
      case 'warning': return 'bg-yellow-100';
      case 'critical': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  const getAutomationStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return 'trending_up';
      case 'down': return 'trending_down';
      default: return 'trending_flat';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatBytes = (bytes: number) => {
    return `${bytes.toFixed(1)} MB`;
  };

  const formatExecutionTime = (seconds: number) => {
    return `${seconds.toFixed(1)}s`;
  };

  const getTimePeriodLabel = (period: TimePeriod): string => {
    const labels = {
      'last7days': 'Last 7 Days',
      'last30days': 'Last 30 Days',
      'last90days': 'Last 90 Days',
      'last6months': 'Last 6 Months',
      'last12months': 'Last 12 Months'
    };
    return labels[period];
  };

  const handleChartClick = (chartId: string, dataPoint?: any) => {
    console.log(`Chart ${chartId} clicked with data:`, dataPoint);
    // Here you could navigate to a detailed view or open a modal
  };

  const renderLoadingState = () => (
    <div className="flex items-center justify-center h-48">
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3dbff2]"></div>
        <span className="text-gray-600">Loading analytics data...</span>
      </div>
    </div>
  );

  const renderEmptyState = (title: string) => (
    <div className="flex flex-col items-center justify-center h-48 text-gray-500">
      <span className="material-symbols-outlined text-4xl mb-2">analytics</span>
      <h3 className="text-lg font-medium mb-1">No {title} Data</h3>
      <p className="text-sm">Data will appear here once available</p>
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen w-full overflow-x-hidden">
        <StandardSidebar />

        <div className="flex flex-col flex-1 min-h-screen">
          {/* Header */}
          <header className="glass-card border-0 p-6 m-4 mb-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
                <p className="text-sm text-gray-600 mt-1">Revenue forecasting, conversion analysis, and performance insights</p>
              </div>
              <div className="flex items-center gap-4">
                {/* Time Period Filter */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Time Period:</label>
                  <select
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
                    className="glass-input rounded-xl py-2 pl-3 pr-10 text-sm border-0"
                  >
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="last90days">Last 90 Days</option>
                  <option value="last6months">Last 6 Months</option>
                  <option value="last12months">Last 12 Months</option>
                </select>
              </div>

              <div className="glass-card border-0 p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : formatCurrency(revenueData.reduce((acc, r) => acc + r.actual, 0))}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">YTD Revenue</div>
                </div>
              </div>
              <div className="glass-card border-0 p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {isLoading ? '...' : kpiMetrics.find(k => k.name === 'Lead Conversion Rate')?.value || 0}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Conversion Rate</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          {/* Tab Navigation */}
          <div className="glass-card border-0 mb-6">
            <div className="px-6">
            <nav className="flex space-x-8">
              {[
                { key: 'overview', label: 'Overview', icon: 'dashboard' },
                { key: 'email', label: 'Email Performance', icon: 'email' },
                { key: 'revenue', label: 'Revenue', icon: 'trending_up' },
                { key: 'conversion', label: 'Funnel Chart', icon: 'funnel_chart' },
                { key: 'territories', label: 'Territories', icon: 'map' },
                { key: 'channels', label: 'Channels', icon: 'campaign' },
                { key: 'automation', label: 'Make.com Automation', icon: 'smart_toy' },
                { key: 'forecasting', label: 'Forecasting', icon: 'preview' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as ChartType)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-[#3dbff2] text-[#3dbff2]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? renderLoadingState() : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* KPI Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {kpiMetrics.length === 0 ? renderEmptyState('KPI') : kpiMetrics.map((metric, index) => (
                      <div
                        key={index}
                        className="bg-white p-6 rounded-lg border shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-[#3dbff2]"
                        onClick={() => handleChartClick('kpi', metric)}
                        onMouseEnter={() => setHoveredChart(`kpi-${index}`)}
                        onMouseLeave={() => setHoveredChart(null)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">{metric.name}</p>
                            <p className="text-2xl font-bold mt-1" style={{color: '#0a2240'}}>
                              {metric.unit === '$' ? formatCurrency(metric.value) :
                               metric.unit === '%' ? `${metric.value}%` :
                               `${formatNumber(metric.value)}${metric.unit === 'days' || metric.unit === 'leads' ? ` ${metric.unit}` : ''}`}
                            </p>
                            {metric.previousValue !== undefined && metric.changePercentage !== undefined && (
                              <div className="flex items-center gap-1 mt-2">
                                <span className={`material-symbols-outlined text-sm ${
                                  metric.trend === 'up' ? 'text-green-600' :
                                  metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                  {getTrendIcon(metric.trend)}
                                </span>
                                <span className={`text-sm font-medium ${
                                  metric.changePercentage > 0 ? 'text-green-600' :
                                  metric.changePercentage < 0 ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                  {Math.abs(metric.changePercentage)}% vs last month
                                </span>
                              </div>
                            )}
                          </div>
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStatusBgColor(metric.status)}`}>
                            <span className={`material-symbols-outlined ${getStatusColor(metric.status)}`}>
                              {metric.status === 'good' ? 'check_circle' :
                               metric.status === 'warning' ? 'warning' : 'error'}
                            </span>
                          </div>
                        </div>
                        {metric.target && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-500">Target</span>
                              <span className="font-medium">
                                {metric.unit === '$' ? formatCurrency(metric.target) :
                                 metric.unit === '%' ? `${metric.target}%` :
                                 `${formatNumber(metric.target)} ${metric.unit}`}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-[#3dbff2] transition-all duration-300"
                                style={{width: `${Math.min((metric.value / metric.target) * 100, 100)}%`}}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Tooltip on hover */}
                        {hoveredChart === `kpi-${index}` && (
                          <div className="absolute z-10 bg-gray-900 text-white text-xs rounded p-2 mt-2 -translate-x-1/2 left-1/2">
                            Click for detailed analysis
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Outreach Method Breakdown */}
                  <div className="bg-white rounded-lg shadow-sm border">
                    <div className="px-6 py-4 border-b">
                      <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>Outreach Method Performance</h3>
                      <p className="text-sm text-gray-600">Breakdown by calls, emails, ads, and inbound leads</p>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                          { method: 'Cold Calls', leads: 180, converted: 40, rate: 22.2, cost: 25000, color: '#3dbff2' },
                          { method: 'Email Campaigns', leads: 380, converted: 39, rate: 10.2, cost: 8000, color: '#10b981' },
                          { method: 'Social Media Ads', leads: 250, converted: 22, rate: 8.8, cost: 12000, color: '#f59e0b' },
                          { method: 'Inbound Leads', leads: 120, converted: 42, rate: 35.0, cost: 5000, color: '#8b5cf6' }
                        ].map((method, index) => (
                          <div
                            key={method.method}
                            className="cursor-pointer transition-all hover:shadow-md"
                            onClick={() => handleChartClick('outreach', method)}
                          >
                            <div className="text-center">
                              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3" style={{backgroundColor: `${method.color}20`}}>
                                <span className="material-symbols-outlined" style={{color: method.color}}>
                                  {index === 0 ? 'call' : index === 1 ? 'email' : index === 2 ? 'campaign' : 'trending_up'}
                                </span>
                              </div>
                              <h4 className="font-semibold" style={{color: '#0a2240'}}>{method.method}</h4>
                              <div className="text-2xl font-bold mt-1" style={{color: method.color}}>{method.rate}%</div>
                              <div className="text-sm text-gray-500">{method.converted}/{method.leads} converted</div>
                              <div className="text-xs text-gray-400 mt-1">{formatCurrency(method.cost)} spent</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Top Performing Channels */}
                  <div className="bg-white rounded-lg shadow-sm border">
                    <div className="px-6 py-4 border-b">
                      <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>Top Performing Channels (ROI)</h3>
                    </div>
                    <div className="p-6">
                      {channelData.length === 0 ? renderEmptyState('Channel') : (
                        <div className="space-y-4">
                          {channelData.sort((a, b) => b.roi - a.roi).slice(0, 5).map((channel, index) => (
                            <div
                              key={channel.channel}
                              className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                              onClick={() => handleChartClick('channel', channel)}
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-[#3dbff2] text-white flex items-center justify-center text-sm font-bold">
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="font-medium" style={{color: '#0a2240'}}>{channel.channel}</div>
                                  <div className="text-sm text-gray-500">{channel.leads} leads • {formatCurrency(channel.cost)} spent</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-green-600">{channel.roi}% ROI</div>
                                <div className="text-sm text-gray-500">{formatCurrency(channel.revenue)} revenue</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Email Performance Tab */}
              {activeTab === 'email' && (
                <div className="space-y-8">
                  {/* Email Stats Overview */}
                  {emailStats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Total Emails Sent</p>
                            <p className="text-3xl font-bold mt-1" style={{color: '#0a2240'}}>{emailStats.totalSent}</p>
                          </div>
                          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-600">send</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Delivered</p>
                            <p className="text-3xl font-bold mt-1" style={{color: '#10b981'}}>{emailStats.delivered}</p>
                          </div>
                          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-600">check_circle</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Failed</p>
                            <p className="text-3xl font-bold mt-1" style={{color: '#ef4444'}}>{emailStats.failed}</p>
                          </div>
                          <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-red-600">error</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Delivery Rate</p>
                            <p className="text-3xl font-bold mt-1" style={{color: '#3dbff2'}}>{emailStats.deliveryRate}%</p>
                          </div>
                          <div className="w-12 h-12 rounded-lg bg-cyan-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-cyan-600">analytics</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Template Performance */}
                  <div className="bg-white rounded-lg shadow-sm border">
                    <div className="px-6 py-4 border-b">
                      <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>Template Performance</h3>
                      <p className="text-sm text-gray-600">Email delivery stats by template</p>
                    </div>
                    <div className="overflow-x-auto">
                      {templateStats.length === 0 ? (
                        <div className="p-6">{renderEmptyState('Template Performance')}</div>
                      ) : (
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Template</th>
                              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Delivered</th>
                              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Failed</th>
                              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Delivery Rate</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {templateStats.map((template: any) => {
                              const deliveryRate = template.sent > 0 ? ((template.delivered / template.sent) * 100).toFixed(1) : '0';
                              return (
                                <tr key={template.name} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 font-medium" style={{color: '#0a2240'}}>{template.name}</td>
                                  <td className="px-6 py-4">{template.sent}</td>
                                  <td className="px-6 py-4 text-green-600">{template.delivered}</td>
                                  <td className="px-6 py-4 text-red-600">{template.failed}</td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <div className="w-20 bg-gray-200 rounded-full h-2">
                                        <div
                                          className={`h-2 rounded-full ${parseFloat(deliveryRate) >= 90 ? 'bg-green-500' : parseFloat(deliveryRate) >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                          style={{width: `${deliveryRate}%`}}
                                        ></div>
                                      </div>
                                      <span className="font-medium">{deliveryRate}%</span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                  {/* Industry Breakdown */}
                  {emailStats && emailStats.byIndustry && Object.keys(emailStats.byIndustry).length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border">
                      <div className="px-6 py-4 border-b">
                        <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>Performance by Industry</h3>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.entries(emailStats.byIndustry).map(([industry, stats]: [string, any]) => {
                            const deliveryRate = stats.sent > 0 ? ((stats.delivered / stats.sent) * 100).toFixed(1) : '0';
                            return (
                              <div key={industry} className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold capitalize mb-2" style={{color: '#0a2240'}}>{industry}</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Sent:</span>
                                    <span className="font-medium">{stats.sent}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Delivered:</span>
                                    <span className="font-medium text-green-600">{stats.delivered}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Failed:</span>
                                    <span className="font-medium text-red-600">{stats.failed}</span>
                                  </div>
                                  <div className="mt-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className="h-2 rounded-full bg-[#3dbff2]"
                                        style={{width: `${deliveryRate}%`}}
                                      ></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{deliveryRate}% delivery rate</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recent Email Sends */}
                  <div className="bg-white rounded-lg shadow-sm border">
                    <div className="px-6 py-4 border-b">
                      <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>Recent Email Sends</h3>
                      <p className="text-sm text-gray-600">Last 50 emails sent from the system</p>
                    </div>
                    <div className="overflow-x-auto">
                      {emailSends.length === 0 ? (
                        <div className="p-6">{renderEmptyState('Recent Sends')}</div>
                      ) : (
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Template</th>
                              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {emailSends.map((send: any) => (
                              <tr key={send.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-600">
                                  {new Date(send.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="px-6 py-4">
                                  <div>
                                    <div className="font-medium" style={{color: '#0a2240'}}>{send.recipient_name || 'Unknown'}</div>
                                    <div className="text-xs text-gray-500">{send.recipient_email}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{send.template_name}</td>
                                <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{send.subject}</td>
                                <td className="px-6 py-4">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                                    {send.industry}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    send.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {send.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Revenue Tab */}
              {activeTab === 'revenue' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm border">
                    <div className="px-6 py-4 border-b">
                      <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>Revenue Tracking</h3>
                    </div>
                    <div className="p-6">
                      {revenueData.length === 0 ? renderEmptyState('Revenue') : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                              <tr>
                                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Period</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Actual</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Forecast</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Target</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">vs Previous</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {revenueData.map((data, index) => (
                                <tr
                                  key={data.period}
                                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                                  onClick={() => handleChartClick('revenue', data)}
                                >
                                  <td className="px-4 py-4 font-medium" style={{color: '#0a2240'}}>
                                    {new Date(data.period + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                                  </td>
                                  <td className="px-4 py-4">
                                    <span className="font-bold">{formatCurrency(data.actual)}</span>
                                  </td>
                                  <td className="px-4 py-4 text-gray-600">{formatCurrency(data.forecast)}</td>
                                  <td className="px-4 py-4 text-gray-600">{formatCurrency(data.target)}</td>
                                  <td className="px-4 py-4">
                                    {data.previousPeriod && (
                                      <span className={`font-medium ${
                                        data.actual > data.previousPeriod ? 'text-green-600' : 'text-red-600'
                                      }`}>
                                        {data.actual > data.previousPeriod ? '+' : ''}{((data.actual - data.previousPeriod) / data.previousPeriod * 100).toFixed(1)}%
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                      <div className="w-20 bg-gray-200 rounded-full h-2">
                                        <div
                                          className={`h-2 rounded-full transition-all duration-300 ${data.actual >= data.target ? 'bg-green-500' : data.actual >= data.target * 0.8 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                          style={{width: `${Math.min((data.actual / data.target) * 100, 100)}%`}}
                                        ></div>
                                      </div>
                                      <span className="text-sm">{((data.actual / data.target) * 100).toFixed(0)}%</span>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Automation Tab */}
              {activeTab === 'automation' && (
                <div className="space-y-8">
                  {/* Make.com Stats Overview */}
                  {makeStats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Total Scenarios</p>
                            <p className="text-3xl font-bold mt-1" style={{color: '#0a2240'}}>{makeStats.totalScenarios}</p>
                            <p className="text-sm text-green-600 mt-1">{makeStats.activeScenarios} active</p>
                          </div>
                          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-600">smart_toy</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Success Rate</p>
                            <p className="text-3xl font-bold mt-1" style={{color: '#0a2240'}}>
                              {((makeStats.successfulExecutions / makeStats.totalExecutions) * 100).toFixed(1)}%
                            </p>
                            <p className="text-sm text-gray-600 mt-1">{formatNumber(makeStats.successfulExecutions)} / {formatNumber(makeStats.totalExecutions)}</p>
                          </div>
                          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-600">check_circle</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Avg Execution Time</p>
                            <p className="text-3xl font-bold mt-1" style={{color: '#0a2240'}}>{formatExecutionTime(makeStats.avgExecutionTime)}</p>
                            <p className="text-sm text-gray-600 mt-1">Per scenario run</p>
                          </div>
                          <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-yellow-600">timer</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Operations Used</p>
                            <p className="text-3xl font-bold mt-1" style={{color: '#0a2240'}}>{formatNumber(makeStats.operationsUsed)}</p>
                            <p className="text-sm text-gray-600 mt-1">{formatNumber(makeStats.operationsRemaining)} remaining</p>
                          </div>
                          <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-purple-600">settings</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Automation Workflow Performance */}
                  <div className="bg-white rounded-lg shadow-sm border">
                    <div className="px-6 py-4 border-b">
                      <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>Automation Workflow Performance</h3>
                      <p className="text-sm text-gray-600">Real-time monitoring of automation workflows</p>
                    </div>
                    <div className="p-6">
                      {automationMetrics.length === 0 ? renderEmptyState('Automation') : (
                        <div className="space-y-4">
                          {automationMetrics.map((metric, index) => (
                            <div
                              key={metric.name}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() => handleChartClick('automation', metric)}
                            >
                              <div className="flex items-center gap-4">
                                <div className="flex-shrink-0">
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                    metric.status === 'active' ? 'bg-green-100' :
                                    metric.status === 'error' ? 'bg-red-100' : 'bg-gray-100'
                                  }`}>
                                    <span className={`material-symbols-outlined ${
                                      metric.status === 'active' ? 'text-green-600' :
                                      metric.status === 'error' ? 'text-red-600' : 'text-gray-600'
                                    }`}>
                                      {metric.status === 'active' ? 'play_circle' :
                                       metric.status === 'error' ? 'error' : 'pause_circle'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold" style={{color: '#0a2240'}}>{metric.name}</h4>
                                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                    <span>{formatNumber(metric.totalExecutions)} executions</span>
                                    <span>{metric.successRate.toFixed(1)}% success rate</span>
                                    <span>{formatExecutionTime(metric.avgExecutionTime)} avg time</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAutomationStatusColor(metric.status)}`}>
                                  {metric.status}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  Last run: {new Date(metric.lastExecuted).toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Make.com Monthly Usage Trends */}
                  {makeStats && (
                    <div className="bg-white rounded-lg shadow-sm border">
                      <div className="px-6 py-4 border-b">
                        <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>Make.com Monthly Usage Trends</h3>
                        <p className="text-sm text-gray-600">Operations, executions, and data transfer over time</p>
                      </div>
                      <div className="p-6">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                              <tr>
                                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Month</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Executions</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Operations</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Data Transfer</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {makeStats.monthlyUsage.map((usage, index) => {
                                const prevUsage = index > 0 ? makeStats.monthlyUsage[index - 1] : null;
                                const growth = prevUsage ? ((usage.executions - prevUsage.executions) / prevUsage.executions) * 100 : 0;

                                return (
                                  <tr
                                    key={usage.period}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => handleChartClick('makeUsage', usage)}
                                  >
                                    <td className="px-4 py-4 font-medium" style={{color: '#0a2240'}}>
                                      {new Date(usage.period + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                                    </td>
                                    <td className="px-4 py-4">{formatNumber(usage.executions)}</td>
                                    <td className="px-4 py-4">{formatNumber(usage.operations)}</td>
                                    <td className="px-4 py-4">{formatBytes(usage.dataTransferred)}</td>
                                    <td className="px-4 py-4">
                                      {prevUsage && (
                                        <span className={`font-medium ${
                                          growth > 0 ? 'text-green-600' : growth < 0 ? 'text-red-600' : 'text-gray-600'
                                        }`}>
                                          {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Conversion Funnel Tab */}
              {activeTab === 'conversion' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm border">
                    <div className="px-6 py-4 border-b">
                      <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>Lead Conversion Funnel</h3>
                    </div>
                    <div className="p-6">
                      {conversionFunnel.length === 0 ? renderEmptyState('Conversion') : (
                        <div className="space-y-4">
                          {conversionFunnel.map((step, index) => (
                            <div key={step.stage} className="relative">
                              <div
                                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleChartClick('funnel', step)}
                              >
                                <div className="flex-shrink-0">
                                  <div className="w-12 h-12 rounded-full bg-[#3dbff2] text-white flex items-center justify-center font-bold">
                                    {index + 1}
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-semibold" style={{color: '#0a2240'}}>{step.stage}</h4>
                                      <p className="text-sm text-gray-600">{step.count} leads ({step.percentage}%)</p>
                                    </div>
                                    <div className="text-right">
                                      {step.dropOffRate && step.dropOffRate > 0 && (
                                        <div className="text-sm text-red-600">
                                          -{step.dropOffRate}% drop-off
                                        </div>
                                      )}
                                      {step.avgTimeInStage && (
                                        <div className="text-sm text-gray-500">
                                          Avg: {step.avgTimeInStage} days
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="mt-2">
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                      <div
                                        className="h-3 rounded-full bg-[#3dbff2] transition-all duration-500"
                                        style={{width: `${step.percentage}%`}}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {index < conversionFunnel.length - 1 && (
                                <div className="flex justify-center">
                                  <div className="w-0.5 h-6 bg-gray-300"></div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Territories Tab */}
              {activeTab === 'territories' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {territoryData.length === 0 ? (
                      <div className="col-span-2">{renderEmptyState('Territory')}</div>
                    ) : territoryData.map((territory) => (
                      <div
                        key={territory.territory}
                        className="bg-white rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-all"
                        onClick={() => handleChartClick('territory', territory)}
                      >
                        <div className="px-6 py-4 border-b">
                          <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>{territory.territory}</h3>
                        </div>
                        <div className="p-6">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <div className="text-2xl font-bold" style={{color: '#0a2240'}}>{territory.totalLeads}</div>
                              <div className="text-sm text-gray-500">Total Leads</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold" style={{color: '#3dbff2'}}>{territory.conversionRate}%</div>
                              <div className="text-sm text-gray-500">Conversion Rate</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-green-600">{formatCurrency(territory.revenue)}</div>
                              <div className="text-sm text-gray-500">Revenue</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold" style={{color: '#f59e0b'}}>{formatCurrency(territory.avgDealSize)}</div>
                              <div className="text-sm text-gray-500">Avg Deal Size</div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Qualified Leads</span>
                              <span className="font-medium">{territory.qualifiedLeads} of {territory.totalLeads}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-[#3dbff2] transition-all duration-300"
                                style={{width: `${(territory.qualifiedLeads / territory.totalLeads) * 100}%`}}
                              ></div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Closed Deals</span>
                              <span className="font-medium">{territory.closedDeals} of {territory.qualifiedLeads}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-green-500 transition-all duration-300"
                                style={{width: `${(territory.closedDeals / territory.qualifiedLeads) * 100}%`}}
                              ></div>
                            </div>
                            {territory.topPerformers.length > 0 && (
                              <div className="pt-2">
                                <div className="text-sm text-gray-600 mb-2">Top Performers:</div>
                                <div className="flex flex-wrap gap-2">
                                  {territory.topPerformers.map((performer) => (
                                    <span key={performer} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                      {performer}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Channels Tab */}
              {activeTab === 'channels' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm border">
                    <div className="px-6 py-4 border-b">
                      <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>Marketing Channel Performance</h3>
                    </div>
                    <div className="overflow-x-auto">
                      {channelData.length === 0 ? renderEmptyState('Channel') : (
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Leads</th>
                              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Cost/Lead</th>
                              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">ROI</th>
                              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Conversion</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {channelData.map((channel) => (
                              <tr
                                key={channel.channel}
                                className="hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => handleChartClick('channel-detail', channel)}
                              >
                                <td className="px-6 py-4 font-medium" style={{color: '#0a2240'}}>{channel.channel}</td>
                                <td className="px-6 py-4">{channel.leads}</td>
                                <td className="px-6 py-4">{formatCurrency(channel.cost)}</td>
                                <td className="px-6 py-4 font-medium text-green-600">{formatCurrency(channel.revenue)}</td>
                                <td className="px-6 py-4">{formatCurrency(channel.costPerLead)}</td>
                                <td className="px-6 py-4">
                                  <span className={`font-bold ${channel.roi > 300 ? 'text-green-600' : channel.roi > 150 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {channel.roi}%
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                      <div
                                        className="h-2 rounded-full bg-[#3dbff2] transition-all duration-300"
                                        style={{width: `${Math.min(channel.conversionRate * 3, 100)}%`}}
                                      ></div>
                                    </div>
                                    <span className="text-sm">{channel.conversionRate}%</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Forecasting Tab */}
              {activeTab === 'forecasting' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm border">
                    <div className="px-6 py-4 border-b">
                      <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>Revenue Forecasting</h3>
                      <p className="text-sm text-gray-600">AI-powered revenue predictions based on current pipeline and historical performance</p>
                    </div>
                    <div className="p-6">
                      {forecastData.length === 0 ? renderEmptyState('Forecast') : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                              <tr>
                                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Period</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Conservative</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Likely</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Optimistic</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Key Factors</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {forecastData.map((forecast) => (
                                <tr
                                  key={forecast.period}
                                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                                  onClick={() => handleChartClick('forecast', forecast)}
                                >
                                  <td className="px-4 py-4 font-medium" style={{color: '#0a2240'}}>
                                    {new Date(forecast.period + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                                  </td>
                                  <td className="px-4 py-4 text-red-600">{formatCurrency(forecast.conservative)}</td>
                                  <td className="px-4 py-4 font-medium" style={{color: '#0a2240'}}>{formatCurrency(forecast.likely)}</td>
                                  <td className="px-4 py-4 text-green-600">{formatCurrency(forecast.optimistic)}</td>
                                  <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                      <div className="w-16 bg-gray-200 rounded-full h-2">
                                        <div
                                          className="h-2 rounded-full bg-[#3dbff2] transition-all duration-300"
                                          style={{width: `${forecast.confidence}%`}}
                                        ></div>
                                      </div>
                                      <span className="text-sm">{forecast.confidence}%</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className="flex flex-wrap gap-1">
                                      {forecast.factors.slice(0, 2).map((factor, index) => (
                                        <span key={index} className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                          {factor}
                                        </span>
                                      ))}
                                      {forecast.factors.length > 2 && (
                                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                          +{forecast.factors.length - 2} more
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}