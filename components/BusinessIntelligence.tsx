'use client'

import { Brain, Search, FileText, TrendingUp, Clock, CheckCircle } from 'lucide-react'

const recentAudits: any[] = []

const intelligenceStats = {
  totalAudits: 0,
  auditsThisWeek: 0,
  avgROI: 0,
  completionRate: 0,
  followUpNeeded: 0
}

const statusColors = {
  'scheduled': 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  'completed': 'bg-green-100 text-green-800',
  'follow-up-needed': 'bg-red-100 text-red-800'
}

const statusIcons = {
  'scheduled': <Clock className="w-4 h-4" />,
  'in-progress': <Search className="w-4 h-4" />,
  'completed': <CheckCircle className="w-4 h-4" />,
  'follow-up-needed': <TrendingUp className="w-4 h-4" />
}

export default function BusinessIntelligence() {
  return (
    <div className="space-y-8">
      {/* Intelligence Overview Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Intelligence Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-cold-navy/10 rounded-lg">
                <Brain className="w-5 h-5 text-cold-navy" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Total Audits</h3>
                <p className="text-2xl font-bold text-cold-navy">{intelligenceStats.totalAudits}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">All time</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-cold-sky/10 rounded-lg">
                <Search className="w-5 h-5 text-cold-sky" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">This Week</h3>
                <p className="text-2xl font-bold text-cold-sky">{intelligenceStats.auditsThisWeek}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">New audits</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Avg ROI</h3>
                <p className="text-2xl font-bold text-green-500">${(intelligenceStats.avgROI / 1000).toFixed(0)}k</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">Estimated value</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Completion</h3>
                <p className="text-2xl font-bold text-purple-500">{intelligenceStats.completionRate}%</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">Success rate</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <FileText className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Follow-ups</h3>
                <p className="text-2xl font-bold text-red-500">{intelligenceStats.followUpNeeded}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">Need attention</p>
          </div>
        </div>
      </div>

      {/* Recent AI Audits */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent AI Audits</h3>
        <div className="space-y-6">
          {recentAudits.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium">No AI audits found</p>
                <p className="text-sm mt-1">Business intelligence data will appear here as audits are completed</p>
              </div>
            </div>
          ) : (
            recentAudits.map((audit) => (
            <div key={audit.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-cold-navy/10 rounded-lg">
                    <Brain className="w-5 h-5 text-cold-navy" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{audit.businessName}</h4>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm text-gray-500">{audit.industry}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-500">
                        {audit.auditDate.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[audit.status as keyof typeof statusColors]}`}>
                        {statusIcons[audit.status as keyof typeof statusIcons]}
                        <span className="ml-1 capitalize">{audit.status.replace('-', ' ')}</span>
                      </span>
                      <span className="text-sm text-gray-500">
                        Assigned to <span className="font-medium">{audit.assignedTo}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">Estimated ROI</p>
                  <p className="text-lg font-bold text-green-600">${audit.estimatedROI.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pain Points */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Pain Points Identified
                  </h5>
                  <ul className="space-y-2">
                    {audit.painPoints.map((point: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-2 mt-1">×</span>
                        <span className="text-sm text-gray-600">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    AI Solutions Recommended
                  </h5>
                  <ul className="space-y-2">
                    {audit.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2 mt-1">✓</span>
                        <span className="text-sm text-gray-600">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-cold-navy text-white text-sm rounded-md hover:bg-cold-navy/90 transition-colors">
                    View Details
                  </button>
                  {audit.status === 'completed' && (
                    <button className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors">
                      Schedule Demo
                    </button>
                  )}
                  {audit.status === 'follow-up-needed' && (
                    <button className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors">
                      Follow Up
                    </button>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  Last updated: {audit.auditDate.toLocaleDateString()}
                </div>
              </div>
            </div>
          )))
          }
        </div>
      </div>

      {/* Intelligence Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-blue-900">Scheduled</h4>
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900">3</p>
          <p className="text-sm text-blue-600">Upcoming audits</p>
        </div>

        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-yellow-900">In Progress</h4>
            <Search className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-yellow-900">2</p>
          <p className="text-sm text-yellow-600">Active audits</p>
        </div>

        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-green-900">Completed</h4>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900">18</p>
          <p className="text-sm text-green-600">This month</p>
        </div>

        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-red-900">Follow-up</h4>
            <TrendingUp className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-900">5</p>
          <p className="text-sm text-red-600">Need attention</p>
        </div>
      </div>
    </div>
  )
}