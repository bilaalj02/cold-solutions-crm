import { Database, TrendingUp, TrendingDown, Clock } from 'lucide-react'
import { DatabaseStats } from '@/types'

interface DatabaseCardProps {
  database: DatabaseStats
}

export default function DatabaseCard({ database }: DatabaseCardProps) {
  const isPositiveTrend = database.conversionRate > 25

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:scale-105">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cold-navy/10 rounded-lg">
            <Database className="w-5 h-5 text-cold-navy" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{database.name}</h3>
            <p className="text-xs text-gray-500">{database.description}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Lead Count */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Total Leads</span>
          <span className="font-semibold text-gray-900">{database.leadCount}</span>
        </div>

        {/* New Leads Today */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">New Today</span>
          <span className="font-semibold text-cold-navy">+{database.newLeadsToday}</span>
        </div>

        {/* Conversion Rate */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Conversion</span>
          <div className="flex items-center space-x-1">
            {isPositiveTrend ? (
              <TrendingUp className="w-3 h-3 text-green-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-500" />
            )}
            <span className={`font-semibold text-sm ${
              isPositiveTrend ? 'text-green-600' : 'text-red-600'
            }`}>
              {database.conversionRate}%
            </span>
          </div>
        </div>

        {/* Last Updated */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span>Updated {database.lastUpdated.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              database.conversionRate > 50 ? 'bg-green-500' : 
              database.conversionRate > 25 ? 'bg-cold-sky' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(database.conversionRate, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}