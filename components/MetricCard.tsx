interface MetricCardProps {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
  trend: 'up' | 'down' | 'neutral'
  color: 'cold-navy' | 'cold-sky' | 'green' | 'purple' | 'red'
}

const colorClasses = {
  'cold-navy': 'bg-cold-navy text-white',
  'cold-sky': 'bg-cold-sky text-white',
  'green': 'bg-green-500 text-white',
  'purple': 'bg-purple-500 text-white',
  'red': 'bg-red-500 text-white'
}

export default function MetricCard({ title, value, subtitle, icon, trend, color }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend === 'up' && (
          <span className="text-green-500 text-sm font-medium">↗</span>
        )}
        {trend === 'down' && (
          <span className="text-red-500 text-sm font-medium">↘</span>
        )}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>
    </div>
  )
}