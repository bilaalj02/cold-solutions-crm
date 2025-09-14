'use client'

import { Users, Target, TrendingUp, Award } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const teamMembers = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Senior Sales Rep',
    avatar: 'SJ',
    leadsAssigned: 45,
    leadsContacted: 38,
    demoBookings: 12,
    closedDeals: 8,
    revenue: 24000,
    conversionRate: 26.7
  },
  {
    id: '2',
    name: 'Mike Chen',
    role: 'Sales Rep',
    avatar: 'MC',
    leadsAssigned: 52,
    leadsContacted: 41,
    demoBookings: 15,
    closedDeals: 6,
    revenue: 18000,
    conversionRate: 28.8
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'Sales Rep',
    avatar: 'ER',
    leadsAssigned: 39,
    leadsContacted: 35,
    demoBookings: 11,
    closedDeals: 7,
    revenue: 21000,
    conversionRate: 28.2
  },
  {
    id: '4',
    name: 'David Park',
    role: 'Senior Sales Rep',
    avatar: 'DP',
    leadsAssigned: 48,
    leadsContacted: 44,
    demoBookings: 18,
    closedDeals: 10,
    revenue: 30000,
    conversionRate: 37.5
  }
]

const weeklyPerformance = [
  { week: 'Week 1', Sarah: 6000, Mike: 4500, Emily: 5250, David: 7500 },
  { week: 'Week 2', Sarah: 5500, Mike: 4800, Emily: 5100, David: 8200 },
  { week: 'Week 3', Sarah: 6200, Mike: 4200, Emily: 5400, David: 7800 },
  { week: 'Week 4', Sarah: 6300, Mike: 4500, Emily: 5250, David: 6500 }
]

export default function TeamPerformance() {
  return (
    <div className="space-y-8">
      {/* Team Overview Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-cold-navy/10 rounded-lg">
                <Users className="w-5 h-5 text-cold-navy" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Active Reps</h3>
                <p className="text-2xl font-bold text-cold-navy">4</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">All team members active</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-cold-sky/10 rounded-lg">
                <Target className="w-5 h-5 text-cold-sky" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Total Leads</h3>
                <p className="text-2xl font-bold text-cold-sky">184</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">Assigned this month</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Team Revenue</h3>
                <p className="text-2xl font-bold text-green-500">$93k</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">This month</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Award className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Avg Conversion</h3>
                <p className="text-2xl font-bold text-purple-500">30.3%</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">Team average</p>
          </div>
        </div>
      </div>

      {/* Individual Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Individual Performance</h3>
        <div className="space-y-4">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-cold-navy rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{member.avatar}</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{member.name}</h4>
                  <p className="text-sm text-gray-500">{member.role}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-5 gap-8 text-center">
                <div>
                  <p className="text-sm text-gray-500">Assigned</p>
                  <p className="font-semibold text-gray-900">{member.leadsAssigned}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contacted</p>
                  <p className="font-semibold text-gray-900">{member.leadsContacted}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Demos</p>
                  <p className="font-semibold text-cold-navy">{member.demoBookings}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Closed</p>
                  <p className="font-semibold text-green-600">{member.closedDeals}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Revenue</p>
                  <p className="font-semibold text-green-600">${(member.revenue / 1000).toFixed(0)}k</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500">Conversion</p>
                <div className="flex items-center space-x-2">
                  <div className="w-12 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        member.conversionRate > 35 ? 'bg-green-500' : 
                        member.conversionRate > 25 ? 'bg-cold-sky' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(member.conversionRate * 2.5, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{member.conversionRate}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Performance Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly Revenue Performance</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={weeklyPerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="week" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="Sarah" fill="#1E3A57" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Mike" fill="#38BDF8" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Emily" fill="#10B981" radius={[2, 2, 0, 0]} />
            <Bar dataKey="David" fill="#8B5CF6" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-cold-navy rounded-full" />
            <span className="text-sm text-gray-600">Sarah Johnson</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-cold-sky rounded-full" />
            <span className="text-sm text-gray-600">Mike Chen</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-sm text-gray-600">Emily Rodriguez</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full" />
            <span className="text-sm text-gray-600">David Park</span>
          </div>
        </div>
      </div>
    </div>
  )
}