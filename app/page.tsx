'use client'

import React, { useState, useEffect } from "react";
import { notionDatabases } from "../lib/notion-databases";
import { useAuth } from "../lib/auth";
import { LeadManager, Lead } from "../lib/leads";
import ProtectedRoute from "../components/ProtectedRoute";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

type TimePeriod = 'day' | 'week' | 'month';
type ChartType = 'overview' | 'outreach' | 'voice' | 'pipeline';

function ColdSolutionsDashboard() {
  const [leadsDropdownOpen, setLeadsDropdownOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');
  const [activeChart, setActiveChart] = useState<ChartType>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
  const [stats, setStats] = useState({
    newLeads: 0,
    callsThisWeek: 0,
    meetingsBooked: 0,
    conversionRate: 0
  });
  const { user, logout } = useAuth();

  // Sample data for interactive charts
  const leadsOverTimeData = [
    { date: 'Mon', leads: 12, calls: 45, emails: 23, inbound: 8 },
    { date: 'Tue', leads: 19, calls: 52, emails: 31, inbound: 12 },
    { date: 'Wed', leads: 15, calls: 38, emails: 28, inbound: 9 },
    { date: 'Thu', leads: 25, calls: 67, emails: 42, inbound: 15 },
    { date: 'Fri', leads: 22, calls: 58, emails: 35, inbound: 11 },
    { date: 'Sat', leads: 18, calls: 41, emails: 25, inbound: 7 },
    { date: 'Sun', leads: 14, calls: 32, emails: 19, inbound: 6 }
  ];

  const voiceCallsData = [
    { hour: '9AM', calls: 23, connects: 12, bookings: 4 },
    { hour: '10AM', calls: 35, connects: 19, bookings: 7 },
    { hour: '11AM', calls: 42, connects: 25, bookings: 9 },
    { hour: '12PM', calls: 28, connects: 16, bookings: 5 },
    { hour: '1PM', calls: 31, connects: 18, bookings: 6 },
    { hour: '2PM', calls: 45, connects: 28, bookings: 11 },
    { hour: '3PM', calls: 38, connects: 22, bookings: 8 },
    { hour: '4PM', calls: 33, connects: 19, bookings: 7 },
    { hour: '5PM', calls: 25, connects: 14, bookings: 4 }
  ];

  const outreachMethodsData = [
    { method: 'Cold Calls', leads: 180, converted: 40, cost: 2500, roi: 320 },
    { method: 'Email Campaigns', leads: 380, converted: 39, cost: 800, roi: 487 },
    { method: 'Social Media Ads', leads: 250, converted: 22, cost: 1200, roi: 183 },
    { method: 'Inbound Leads', leads: 120, converted: 42, cost: 500, roi: 840 }
  ];

  const leadSourcesData = [
    { name: 'Cold Calls', value: 35, color: '#0a2240' },
    { name: 'Email', value: 28, color: '#3dbff2' },
    { name: 'Inbound', value: 22, color: '#10b981' },
    { name: 'Social Media', value: 15, color: '#f59e0b' }
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Load leads and calculate stats
      const loadedLeads = LeadManager.getLeads();
      setLeads(loadedLeads);

      // Calculate real stats based on time period
      const today = new Date();
      const periodDays = timePeriod === 'day' ? 1 : timePeriod === 'week' ? 7 : 30;
      const periodAgo = new Date(today.getTime() - periodDays * 24 * 60 * 60 * 1000);

      const recentLeads = loadedLeads.filter(lead =>
        new Date(lead.createdAt) >= periodAgo
      );

      const qualifiedLeads = loadedLeads.filter(lead =>
        ['Qualified', 'Proposal', 'Won'].includes(lead.status)
      );

      const convertedLeads = loadedLeads.filter(lead => lead.status === 'Won');

      setStats({
        newLeads: recentLeads.length,
        callsThisWeek: Math.floor(recentLeads.length * 1.8), // More realistic estimate
        meetingsBooked: qualifiedLeads.length,
        conversionRate: loadedLeads.length > 0 ? Math.round((convertedLeads.length / loadedLeads.length) * 100) : 0
      });

      setIsLoading(false);
    };

    loadData();
  }, [timePeriod]);

  return (
    <div className="flex min-h-screen w-full group/design-root overflow-x-hidden bg-white" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
      {/* Standardized Sidebar */}
      <div className="flex min-h-screen w-72 flex-col justify-between text-white p-4" style={{backgroundColor: '#0a2240'}}>
          <div className="flex flex-col gap-8">
            <div className="flex flex-col p-4">
              <h1 className="text-xl font-bold leading-normal text-white">Cold Solutions</h1>
              <p className="text-sm font-normal leading-normal" style={{color: '#a0a0a0'}}>Your Business, Streamlined</p>
            </div>
            <nav className="flex flex-col gap-2">
              <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-white" style={{backgroundColor: '#3dbff2'}} href="/">
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

                <motion.div
                  initial={false}
                  animate={{ height: leadsDropdownOpen ? 'auto' : 0, opacity: leadsDropdownOpen ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="ml-4 mt-2 flex flex-col gap-1">
                    <a className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-opacity-20 hover:bg-white text-white text-sm transition-colors" href="/leads">
                      <span className="material-symbols-outlined" style={{fontSize: '16px'}}>database</span>
                      <p className="text-sm leading-normal">All Leads</p>
                    </a>
                    {notionDatabases.map((db) => (
                      <a
                        key={db.id}
                        className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-opacity-20 hover:bg-white text-white text-sm transition-colors"
                        href={`/database/${db.slug}`}
                      >
                        <span className="material-symbols-outlined" style={{fontSize: '16px'}}>{db.icon}</span>
                        <p className="text-sm leading-normal">{db.name}</p>
                      </a>
                    ))}
                  </div>
                </motion.div>
              </div>

              <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white transition-colors" href="/calls">
                <span className="material-symbols-outlined" style={{fontSize: '20px'}}>phone_in_talk</span>
                <p className="text-sm font-medium leading-normal">Calls Database</p>
              </a>
              <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white transition-colors" href="/email">
                <span className="material-symbols-outlined" style={{fontSize: '20px'}}>email</span>
                <p className="text-sm font-medium leading-normal">Email Management</p>
              </a>
              <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white transition-colors" href="/automation">
                <span className="material-symbols-outlined" style={{fontSize: '20px'}}>smart_toy</span>
                <p className="text-sm font-medium leading-normal">Automation Hub</p>
              </a>
              <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white transition-colors" href="/analytics">
                <span className="material-symbols-outlined" style={{fontSize: '20px'}}>analytics</span>
                <p className="text-sm font-medium leading-normal">Performance Analytics</p>
              </a>
              <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white transition-colors" href="/operations">
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
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white transition-colors" href="/settings">
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>settings</span>
              <p className="text-sm font-medium leading-normal">Settings</p>
            </a>
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-opacity-20 hover:bg-white text-white text-left w-full transition-colors"
            >
              <span className="material-symbols-outlined" style={{fontSize: '20px'}}>logout</span>
              <p className="text-sm font-medium leading-normal">Sign Out</p>
            </button>
          </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-h-screen" style={{backgroundColor: '#f9fafb'}}>
          <header className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold" style={{color: '#0a2240'}}>Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your business today.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-700">System Online</span>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="material-symbols-outlined text-gray-600">refresh</span>
                  <span className="text-sm font-medium text-gray-700">Refresh Data</span>
                </button>
              </div>
            </div>
          </header>
          
          <main className="flex flex-col gap-8 p-6">
            {/* Header with Time Period Filter */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold" style={{color: '#0a2240'}}>Overview</h2>
                <p className="text-sm text-gray-600">Track your business performance across all channels</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Time Period:</label>
                  <select
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3dbff2] focus:border-transparent"
                  >
                    <option value="day">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Enhanced KPI Cards with Loading States */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'New Leads', value: stats.newLeads, trend: '+12%', trendUp: true, icon: 'person_add', color: '#0a2240' },
                { label: `Calls This ${timePeriod === 'day' ? 'Day' : timePeriod === 'week' ? 'Week' : 'Month'}`, value: stats.callsThisWeek, trend: '+8%', trendUp: true, icon: 'call', color: '#3dbff2' },
                { label: 'Meetings Booked', value: stats.meetingsBooked, trend: '+24%', trendUp: true, icon: 'event', color: '#10b981' },
                { label: 'Conversion Rate', value: `${stats.conversionRate}%`, trend: '+5%', trendUp: true, icon: 'trending_up', color: '#f59e0b' }
              ].map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative overflow-hidden rounded-lg p-6 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
                  onMouseEnter={() => setHoveredMetric(metric.label)}
                  onMouseLeave={() => setHoveredMetric(null)}
                  onClick={() => console.log(`Clicked ${metric.label}`)}
                >
                  {isLoading ? (
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-gray-600 text-base font-medium">{metric.label}</p>
                          <p className="text-3xl font-bold mt-1" style={{color: metric.color}}>{metric.value}</p>
                          <div className="flex items-center gap-1 mt-2">
                            <span className={`material-symbols-outlined text-sm ${
                              metric.trendUp ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {metric.trendUp ? 'trending_up' : 'trending_down'}
                            </span>
                            <span className={`text-sm font-medium ${
                              metric.trendUp ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {metric.trend} vs last {timePeriod}
                            </span>
                          </div>
                        </div>
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{backgroundColor: `${metric.color}20`}}>
                          <span className="material-symbols-outlined" style={{color: metric.color}}>
                            {metric.icon}
                          </span>
                        </div>
                      </div>

                      {/* Hover tooltip */}
                      <AnimatePresence>
                        {hoveredMetric === metric.label && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute inset-0 bg-black bg-opacity-90 text-white p-4 rounded-lg flex items-center justify-center"
                          >
                            <div className="text-center">
                              <p className="text-sm font-medium">Click for detailed analysis</p>
                              <p className="text-xs opacity-75 mt-1">View trends and breakdown</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Interactive Charts Navigation */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { key: 'overview', label: 'Overview', icon: 'dashboard' },
                    { key: 'outreach', label: 'Outreach Methods', icon: 'campaign' },
                    { key: 'voice', label: 'Voice Agent', icon: 'record_voice_over' },
                    { key: 'pipeline', label: 'Pipeline', icon: 'funnel_chart' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveChart(tab.key as ChartType)}
                      className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeChart === tab.key
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

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {/* Overview Tab */}
                  {activeChart === 'overview' && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                      <div>
                        <h3 className="text-lg font-semibold mb-4" style={{color: '#0a2240'}}>Leads by Source</h3>
                        {isLoading ? (
                          <div className="h-64 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3dbff2]"></div>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={leadsOverTimeData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                              <XAxis dataKey="date" stroke="#64748b" />
                              <YAxis stroke="#64748b" />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'white',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '8px'
                                }}
                              />
                              <Area
                                type="monotone"
                                dataKey="leads"
                                stroke="#3dbff2"
                                strokeWidth={2}
                                fill="url(#colorLeads)"
                              />
                              <defs>
                                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3dbff2" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#3dbff2" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                            </AreaChart>
                          </ResponsiveContainer>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4" style={{color: '#0a2240'}}>Lead Sources</h3>
                        {isLoading ? (
                          <div className="h-64 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3dbff2]"></div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <ResponsiveContainer width="60%" height={250}>
                              <PieChart>
                                <Pie
                                  data={leadSourcesData}
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                  label={({value}) => `${value}%`}
                                >
                                  {leadSourcesData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-2">
                              {leadSourcesData.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-sm text-gray-600">{item.name}</span>
                                  </div>
                                  <span className="text-sm font-medium">{item.value}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Outreach Methods Tab */}
                  {activeChart === 'outreach' && (
                    <motion.div
                      key="outreach"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-lg font-semibold mb-4" style={{color: '#0a2240'}}>Outreach Method Performance</h3>
                        {isLoading ? (
                          <div className="h-64 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3dbff2]"></div>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={outreachMethodsData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                              <XAxis dataKey="method" stroke="#64748b" />
                              <YAxis stroke="#64748b" />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'white',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '8px'
                                }}
                                formatter={(value, name) => [
                                  name === 'leads' ? `${value} leads` :
                                  name === 'converted' ? `${value} converted` :
                                  name === 'roi' ? `${value}% ROI` : value,
                                  name === 'leads' ? 'Total Leads' :
                                  name === 'converted' ? 'Converted' :
                                  name === 'roi' ? 'ROI' : name
                                ]}
                              />
                              <Bar dataKey="leads" fill="#3dbff2" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="converted" fill="#0a2240" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {outreachMethodsData.map((method, index) => {
                          const conversionRate = ((method.converted / method.leads) * 100).toFixed(1);
                          return (
                            <div
                              key={method.method}
                              className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                              onClick={() => console.log(`Clicked ${method.method}`)}
                            >
                              <h4 className="font-medium" style={{color: '#0a2240'}}>{method.method}</h4>
                              <div className="mt-2 space-y-1">
                                <div className="text-sm text-gray-600">
                                  <span className="font-medium">{method.leads}</span> leads
                                </div>
                                <div className="text-sm text-gray-600">
                                  <span className="font-medium text-green-600">{conversionRate}%</span> conversion
                                </div>
                                <div className="text-sm text-gray-600">
                                  <span className="font-medium text-purple-600">{method.roi}%</span> ROI
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Voice Agent Tab */}
                  {activeChart === 'voice' && (
                    <motion.div
                      key="voice"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-lg font-semibold mb-4" style={{color: '#0a2240'}}>Voice Agent Call Performance</h3>
                        {isLoading ? (
                          <div className="h-64 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3dbff2]"></div>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={voiceCallsData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                              <XAxis dataKey="hour" stroke="#64748b" />
                              <YAxis stroke="#64748b" />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'white',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '8px'
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="calls"
                                stroke="#3dbff2"
                                strokeWidth={3}
                                dot={{ fill: '#3dbff2', strokeWidth: 2, r: 4 }}
                                name="Total Calls"
                              />
                              <Line
                                type="monotone"
                                dataKey="connects"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                                name="Connected"
                              />
                              <Line
                                type="monotone"
                                dataKey="bookings"
                                stroke="#0a2240"
                                strokeWidth={2}
                                dot={{ fill: '#0a2240', strokeWidth: 2, r: 4 }}
                                name="Bookings"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <span className="material-symbols-outlined text-blue-600">call</span>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Total Calls Today</p>
                              <p className="text-2xl font-bold text-blue-600">287</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                              <span className="material-symbols-outlined text-green-600">check_circle</span>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Connection Rate</p>
                              <p className="text-2xl font-bold text-green-600">64%</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                              <span className="material-symbols-outlined text-purple-600">event</span>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Meetings Booked</p>
                              <p className="text-2xl font-bold text-purple-600">58</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Pipeline Tab */}
                  {activeChart === 'pipeline' && (
                    <motion.div
                      key="pipeline"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-lg font-semibold mb-4" style={{color: '#0a2240'}}>Sales Pipeline</h3>
                        <div className="space-y-4">
                          {[
                            { stage: 'Prospects', count: 450, percentage: 100, color: '#0a2240' },
                            { stage: 'Qualified', count: 338, percentage: 75, color: '#3dbff2' },
                            { stage: 'Contacted', count: 225, percentage: 50, color: '#10b981' },
                            { stage: 'Proposal', count: 113, percentage: 25, color: '#f59e0b' },
                            { stage: 'Won', count: 45, percentage: 10, color: '#8b5cf6' }
                          ].map((stage, index) => (
                            <motion.div
                              key={stage.stage}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                              onClick={() => console.log(`Clicked ${stage.stage}`)}
                            >
                              <div className="w-4 h-4 rounded-full" style={{backgroundColor: stage.color}}></div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium" style={{color: '#0a2240'}}>{stage.stage}</span>
                                  <span className="text-sm text-gray-600">{stage.count} leads</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stage.percentage}%` }}
                                    transition={{ duration: 1, delay: index * 0.2 }}
                                    className="h-3 rounded-full transition-all duration-500"
                                    style={{backgroundColor: stage.color}}
                                  ></motion.div>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-lg font-bold" style={{color: stage.color}}>{stage.percentage}%</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Bottom Section - Recent Activity and Quick Actions */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold" style={{color: '#0a2240'}}>Recent Activity</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Last updated:</span>
                  <span className="text-sm font-medium" style={{color: '#3dbff2'}}>
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>

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
                      {leads.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center">
                            <div className="text-gray-500">
                              <p className="text-sm">No leads found</p>
                              <p className="text-xs mt-1">Add leads manually or sync from Notion to see data here</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        leads.slice(0, 5).map((lead) => {
                          const getStatusColor = (status: string) => {
                            switch (status) {
                              case 'New': return 'bg-blue-100 text-blue-800';
                              case 'Contacted': return 'bg-yellow-100 text-yellow-800';
                              case 'Qualified': return 'bg-green-100 text-green-800';
                              case 'Proposal': return 'bg-purple-100 text-purple-800';
                              case 'Won': return 'bg-emerald-100 text-emerald-800';
                              case 'Lost': return 'bg-red-100 text-red-800';
                              default: return 'bg-gray-100 text-gray-800';
                            }
                          };

                          const getRelativeTime = (dateString: string) => {
                            const date = new Date(dateString);
                            const now = new Date();
                            const diffTime = Math.abs(now.getTime() - date.getTime());
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
                          };

                          return (
                            <tr key={lead.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.source}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                                  {lead.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.score}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getRelativeTime(lead.createdAt)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <a href={`/leads/${lead.id}`} className="hover:underline" style={{color: '#3dbff2'}}>Open</a>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

                {/* Quick Actions & Activity */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Quick Actions */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4" style={{color: '#0a2240'}}>Quick Actions</h3>
                    <div className="space-y-3">
                      <button className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-sm">add</span>
                          </div>
                          <span className="font-medium text-blue-700">Add New Lead</span>
                        </div>
                        <span className="material-symbols-outlined text-blue-500 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </button>

                      <button className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-sm">campaign</span>
                          </div>
                          <span className="font-medium text-green-700">Start Campaign</span>
                        </div>
                        <span className="material-symbols-outlined text-green-500 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </button>

                      <button className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-sm">analytics</span>
                          </div>
                          <span className="font-medium text-purple-700">View Reports</span>
                        </div>
                        <span className="material-symbols-outlined text-purple-500 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </button>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4" style={{color: '#0a2240'}}>Live Activity Feed</h3>
                    {leads.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-gray-500">
                          <span className="material-symbols-outlined text-4xl mb-2 block">timeline</span>
                          <p className="text-sm">No recent activity</p>
                          <p className="text-xs mt-1">Activity will appear here as you interact with leads</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {leads.slice(0, 5).map((lead, index) => {
                          const getActivityIcon = (index: number) => {
                            const icons = ['phone_in_talk', 'videocam', 'email', 'person_add', 'update'];
                            return icons[index % icons.length];
                          };

                          const getActivityText = (lead: Lead, index: number) => {
                            const activities = [
                              `New lead added: ${lead.name}`,
                              `Follow-up scheduled with ${lead.name}`,
                              `Email sent to ${lead.name}`,
                              `Status updated for ${lead.name}`,
                              `Call completed with ${lead.name}`
                            ];
                            return activities[index % activities.length];
                          };

                          const getRelativeTime = (dateString: string) => {
                            const date = new Date(dateString);
                            const now = new Date();
                            const diffTime = Math.abs(now.getTime() - date.getTime());
                            const diffMins = Math.floor(diffTime / (1000 * 60));
                            if (diffMins < 60) return `${diffMins}m ago`;
                            const diffHours = Math.floor(diffMins / 60);
                            if (diffHours < 24) return `${diffHours}h ago`;
                            const diffDays = Math.floor(diffHours / 24);
                            return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
                          };

                          const getActivityColor = (index: number) => {
                            const colors = ['#3dbff2', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
                            return colors[index % colors.length];
                          };

                          return (
                            <motion.div
                              key={lead.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                              onClick={() => console.log(`Clicked activity for ${lead.name}`)}
                            >
                              <div className="rounded-full p-2 mt-0.5" style={{backgroundColor: `${getActivityColor(index)}20`}}>
                                <span className="material-symbols-outlined text-sm" style={{color: getActivityColor(index)}}>
                                  {getActivityIcon(index)}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 text-sm truncate">{getActivityText(lead, index)}</p>
                                <p className="text-xs text-gray-500">{getRelativeTime(lead.createdAt)}</p>
                              </div>
                              <div className="w-2 h-2 rounded-full mt-2" style={{backgroundColor: getActivityColor(index)}}></div>
                            </motion.div>
                          );
                        })}

                        <div className="pt-3 border-t border-gray-100">
                          <a href="/activity" className="flex items-center justify-center gap-2 text-sm font-medium hover:underline" style={{color: '#3dbff2'}}>
                            View all activity
                            <span className="material-symbols-outlined text-base">arrow_forward</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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