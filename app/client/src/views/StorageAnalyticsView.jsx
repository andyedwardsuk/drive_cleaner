import { BarChart3, HardDrive, Database, Trash2, RefreshCw } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import Hero from '@/components/Hero'
import { useQuota } from '@/hooks/useQuota'

/**
 * Format bytes to human readable string
 * @param {number} bytes - Bytes to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted string
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Metric Card Component
 */
function MetricCard({ icon: Icon, label, value, subValue, color = 'blue' }) {
  const colorClasses = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    orange: 'text-orange-400',
    red: 'text-red-400',
    purple: 'text-purple-400',
  }

  return (
    <div className="p-6 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg bg-${color}-500/10`}>
          <Icon className={`w-6 h-6 ${colorClasses[color]}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-semibold text-gray-100 mb-1">{value}</p>
          {subValue && <p className="text-sm text-gray-500">{subValue}</p>}
        </div>
      </div>
    </div>
  )
}

/**
 * Storage Analytics View Component
 */
export default function StorageAnalyticsView() {
  const { data, loading, error, fetchQuota } = useQuota()

  if (loading) {
    return (
      <div className="space-y-6">
        <Hero
          icon={BarChart3}
          title="Storage Analytics"
          subtitle="Visual breakdown of your Drive storage usage"
          illustration="📊"
        />
        <div className="p-12 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
          <div className="flex items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
            <p className="text-gray-300">Loading storage analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Hero
          icon={BarChart3}
          title="Storage Analytics"
          subtitle="Visual breakdown of your Drive storage usage"
          illustration="📊"
        />
        <div className="p-8 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
          <p className="text-red-400 mb-4">Error loading storage analytics</p>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchQuota}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!data?.success || !data?.data) {
    return (
      <div className="space-y-6">
        <Hero
          icon={BarChart3}
          title="Storage Analytics"
          subtitle="Visual breakdown of your Drive storage usage"
          illustration="📊"
        />
        <div className="p-8 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
          <p className="text-gray-400">No storage data available</p>
        </div>
      </div>
    )
  }

  const quota = data.data

  // Prepare chart data
  const usedData = quota.usage || 0
  const availableData = quota.available || 0
  const limitData = quota.limit || 0

  const chartData = [
    { name: 'Used', value: usedData, color: '#3b82f6' },
    { name: 'Available', value: availableData, color: '#22c55e' },
  ]

  const driveBreakdownData = [
    { name: 'Drive Files', value: quota.usageInDrive || 0, color: '#3b82f6' },
    { name: 'Trash', value: quota.usageInDriveTrash || 0, color: '#f59e0b' },
  ]

  // Custom label for pie chart
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180))
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180))

    if (percent < 0.05) return null

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="space-y-6">
      <Hero
        icon={BarChart3}
        title="Storage Analytics"
        subtitle="Visual breakdown of your Drive storage usage"
        illustration="📊"
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={HardDrive}
          label="Total Storage"
          value={formatBytes(limitData)}
          color="blue"
        />
        <MetricCard
          icon={Database}
          label="Used Storage"
          value={formatBytes(usedData)}
          subValue={`${quota.percentUsed}% of total`}
          color={quota.percentUsed > 80 ? 'red' : quota.percentUsed > 60 ? 'orange' : 'green'}
        />
        <MetricCard
          icon={HardDrive}
          label="Available Storage"
          value={formatBytes(availableData)}
          color="green"
        />
        <MetricCard
          icon={Database}
          label="Drive Files"
          value={formatBytes(quota.usageInDrive)}
          subValue={quota.usageInDriveTrash > 0 ? `${formatBytes(quota.usageInDriveTrash)} in trash` : 'No items in trash'}
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overall Storage Chart */}
        <div className="p-6 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Overall Storage Usage</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatBytes(value)}
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend
                  formatter={(value, entry) => `${value}: ${formatBytes(entry.payload.value)}`}
                  wrapperStyle={{ color: '#9ca3af' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Drive Breakdown Chart */}
        <div className="p-6 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Drive Storage Breakdown</h3>
          <div className="h-64">
            {quota.usageInDriveTrash > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={driveBreakdownData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {driveBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatBytes(value)}
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Legend
                    formatter={(value, entry) => `${value}: ${formatBytes(entry.payload.value)}`}
                    wrapperStyle={{ color: '#9ca3af' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <Trash2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No items in trash</p>
                  <p className="text-sm text-gray-500 mt-2">All your Drive storage is active files</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="p-6 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Storage Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <h4 className="font-medium text-gray-200 mb-1">Find Large Files</h4>
              <p className="text-sm text-gray-400">
                Use Smart Scan to identify large files that may be consuming significant storage space.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-2xl">🗑️</div>
            <div>
              <h4 className="font-medium text-gray-200 mb-1">Empty Your Trash</h4>
              <p className="text-sm text-gray-400">
                {quota.usageInDriveTrash > 0
                  ? `You have ${formatBytes(quota.usageInDriveTrash)} in your trash. Emptying it will free up space.`
                  : 'Your trash is empty. Good job keeping your Drive clean!'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-2xl">📦</div>
            <div>
              <h4 className="font-medium text-gray-200 mb-1">Remove Duplicates</h4>
              <p className="text-sm text-gray-400">
                Duplicate files can waste storage. Use Smart Scan to find and remove duplicates.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="text-2xl">⏰</div>
            <div>
              <h4 className="font-medium text-gray-200 mb-1">Archive Old Files</h4>
              <p className="text-sm text-gray-400">
                Files you haven't accessed in years may be good candidates for archiving or deletion.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={fetchQuota}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Storage Data
        </button>
      </div>
    </div>
  )
}
