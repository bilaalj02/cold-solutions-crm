'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { Phone, Clock, Target, TrendingUp } from 'lucide-react'

const callVolumeData = [
  { time: '6AM', calls: 12 },
  { time: '8AM', calls: 28 },
  { time: '10AM', calls: 45 },
  { time: '12PM', calls: 67 },
  { time: '2PM', calls: 52 },
  { time: '4PM', calls: 38 },
  { time: '6PM', calls: 25 },
  { time: '8PM', calls: 15 },
  { time: '10PM', calls: 8 }
]

const industryData = [
  { industry: 'Real Estate', calls: 89, conversions: 31 },
  { industry: 'Home Services', calls: 67, conversions: 28 },
  { industry: 'Healthcare', calls: 45, conversions: 19 },
  { industry: 'Legal', calls: 32, conversions: 16 },
  { industry: 'Other', calls: 28, conversions: 8 }
]

const outcomeData = [
  { name: 'Demo Booked', value: 156, color: '#1E3A57' },
  { name: 'Follow Up', value: 89, color: '#38BDF8' },
  { name: 'Not Interested', value: 45, color: '#EF4444' },
  { name: 'Callback Requested', value: 32, color: '#10B981' }
]

export default function VoiceAgentAnalytics() {
  return (
    <div className="space-y-8">
      {/* Voice Agent Key Metrics */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Voice Agent Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-cold-navy/10 rounded-lg">
                <Phone className="w-5 h-5 text-cold-navy" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Total Calls</h3>
                <p className="text-2xl font-bold text-cold-navy">1,234</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">+23% vs last week</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-cold-sky/10 rounded-lg">
                <Clock className="w-5 h-5 text-cold-sky" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Avg Duration</h3>
                <p className="text-2xl font-bold text-cold-sky">4:32</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">2 min longer than avg</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Target className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Conversion</h3>
                <p className="text-2xl font-bold text-green-500">34.2%</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">+5.7% this month</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Demo Bookings</h3>
                <p className="text-2xl font-bold text-purple-500">156</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">This week</p>
          </div>
        </div>
      </div>

      {/* Call Volume by Hour */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Call Volume by Hour</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={callVolumeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="time" stroke="#64748b" />
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
              stroke="#1E3A57" 
              strokeWidth={3}
              dot={{ fill: '#1E3A57', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: '#1E3A57', strokeWidth: 2, fill: 'white' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Industry Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Calls by Industry</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={industryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="industry" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="calls" fill="#38BDF8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="conversions" fill="#1E3A57" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Call Outcomes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Call Outcomes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={outcomeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {outcomeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {outcomeData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}