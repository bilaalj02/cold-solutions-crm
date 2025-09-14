'use client'

import React, { useState, useEffect } from "react";
import { AdvancedAnalytics, KPIMetric, TerritoryPerformance, ChannelPerformance, ConversionFunnelStep, RevenueData, ForecastData } from "../../lib/advanced-analytics";
import { LeadManager } from "../../lib/leads";
import { EmailManager } from "../../lib/email-system";

export default function AdvancedAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'conversion' | 'territories' | 'channels' | 'forecasting'>('overview');
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetric[]>([]);
  const [territoryData, setTerritoryData] = useState<TerritoryPerformance[]>([]);
  const [channelData, setChannelData] = useState<ChannelPerformance[]>([]);
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnelStep[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);

  useEffect(() => {
    const leads = LeadManager.getLeads();
    setKpiMetrics(AdvancedAnalytics.getKPIMetrics(leads));
    setTerritoryData(AdvancedAnalytics.getTerritoryPerformance());
    setChannelData(AdvancedAnalytics.getChannelPerformance());
    setConversionFunnel(AdvancedAnalytics.getConversionFunnel(leads));
    setRevenueData(AdvancedAnalytics.getRevenueData());
    setForecastData(AdvancedAnalytics.getRevenueForecast());
  }, []);

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

  return (
    <div className="flex min-h-screen bg-white" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
      {/* Sidebar */}
      <aside className="min-h-screen w-72 flex flex-col justify-between text-white p-4" style={{backgroundColor: '#0a2240'}}>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col p-4">
            <h1 className="text-xl font-bold leading-normal text-white">Cold Solutions</h1>
            <p className="text-sm font-normal leading-normal" style={{color: '#a0a0a0'}}>Advanced Analytics</p>
          </div>
          <nav className="flex flex-col gap-2">
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>dashboard</span>
              <p className="text-sm font-medium leading-normal">Dashboard</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/leads">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>group</span>
              <p className="text-sm font-medium leading-normal">Leads Database</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/calls">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>phone_in_talk</span>
              <p className="text-sm font-medium leading-normal">Calls Database</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/email">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>email</span>
              <p className="text-sm font-medium leading-normal">Email Management</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-white" style={{backgroundColor: '#3dbff2'}} href="/analytics">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>analytics</span>
              <p className="text-sm font-medium leading-normal">Performance Analytics</p>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white" href="/operations">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>dvr</span>
              <p className="text-sm font-medium leading-normal">Operations Console</p>
            </a>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen" style={{backgroundColor: '#f9fafb'}}>
        {/* Header */}
        <header className="p-6 bg-white border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{color: '#0a2240'}}>Advanced Analytics</h1>
              <p className="text-sm text-gray-600 mt-1">Revenue forecasting, conversion analysis, and performance insights</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-lg border p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{color: '#0a2240'}}>
                    {formatCurrency(revenueData.reduce((acc, r) => acc + r.actual, 0))}
                  </div>
                  <div className="text-xs text-gray-500">YTD Revenue</div>
                </div>
              </div>
              <div className="bg-white rounded-lg border p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{color: '#3dbff2'}}>
                    {kpiMetrics.find(k => k.name === 'Lead Conversion Rate')?.value || 0}%
                  </div>
                  <div className="text-xs text-gray-500">Conversion Rate</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="bg-white border-b">
          <div className="px-6">
            <nav className="flex space-x-8">
              {[
                { key: 'overview', label: 'Overview', icon: 'dashboard' },
                { key: 'revenue', label: 'Revenue', icon: 'trending_up' },
                { key: 'conversion', label: 'Conversion Funnel', icon: 'funnel_chart' },
                { key: 'territories', label: 'Territories', icon: 'map' },
                { key: 'channels', label: 'Channels', icon: 'campaign' },
                { key: 'forecasting', label: 'Forecasting', icon: 'preview' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-[#3dbff2] text-[#3dbff2]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* KPI Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kpiMetrics.map((metric, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg border shadow-sm">
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
                            className="h-2 rounded-full bg-[#3dbff2]" 
                            style={{width: `${Math.min((metric.value / metric.target) * 100, 100)}%`}}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Top Performing Channels */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold" style={{color: '#0a2240'}}>Top Performing Channels (ROI)</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {channelData.sort((a, b) => b.roi - a.roi).slice(0, 5).map((channel, index) => (
                      <div key={channel.channel} className="flex items-center justify-between">
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
                          <tr key={data.period} className="hover:bg-gray-50">
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
                                    className={`h-2 rounded-full ${data.actual >= data.target ? 'bg-green-500' : data.actual >= data.target * 0.8 ? 'bg-yellow-500' : 'bg-red-500'}`}
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
                </div>
              </div>
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
                  <div className="space-y-4">
                    {conversionFunnel.map((step, index) => (
                      <div key={step.stage} className="relative">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
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
                                  className="h-3 rounded-full bg-[#3dbff2]" 
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
                </div>
              </div>
            </div>
          )}

          {/* Territories Tab */}
          {activeTab === 'territories' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {territoryData.map((territory) => (
                  <div key={territory.territory} className="bg-white rounded-lg shadow-sm border">
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
                            className="h-2 rounded-full bg-[#3dbff2]" 
                            style={{width: `${(territory.qualifiedLeads / territory.totalLeads) * 100}%`}}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Closed Deals</span>
                          <span className="font-medium">{territory.closedDeals} of {territory.qualifiedLeads}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-green-500" 
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
                        <tr key={channel.channel} className="hover:bg-gray-50">
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
                                  className="h-2 rounded-full bg-[#3dbff2]" 
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
                          <tr key={forecast.period} className="hover:bg-gray-50">
                            <td className="px-4 py-4 font-medium" style={{color: '#0a2240'}}>
                              {new Date(forecast.period + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                            </td>
                            <td className="px-4 py-4 text-red-600 font-medium">{formatCurrency(forecast.conservative)}</td>
                            <td className="px-4 py-4 font-bold" style={{color: '#3dbff2'}}>{formatCurrency(forecast.likely)}</td>
                            <td className="px-4 py-4 text-green-600 font-medium">{formatCurrency(forecast.optimistic)}</td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${forecast.confidence >= 80 ? 'bg-green-500' : forecast.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                    style={{width: `${forecast.confidence}%`}}
                                  ></div>
                                </div>
                                <span className="text-sm">{forecast.confidence}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-wrap gap-1">
                                {forecast.factors.slice(0, 2).map((factor) => (
                                  <span key={factor} className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                                    {factor}
                                  </span>
                                ))}
                                {forecast.factors.length > 2 && (
                                  <span className="text-xs text-gray-500">+{forecast.factors.length - 2} more</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Forecast Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">6-Month Conservative</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(forecastData.reduce((acc, f) => acc + f.conservative, 0))}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-red-100">
                      <span className="material-symbols-outlined text-red-600">trending_down</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">6-Month Likely</p>
                      <p className="text-2xl font-bold" style={{color: '#3dbff2'}}>
                        {formatCurrency(forecastData.reduce((acc, f) => acc + f.likely, 0))}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100">
                      <span className="material-symbols-outlined" style={{color: '#3dbff2'}}>trending_up</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">6-Month Optimistic</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(forecastData.reduce((acc, f) => acc + f.optimistic, 0))}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100">
                      <span className="material-symbols-outlined text-green-600">rocket_launch</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}