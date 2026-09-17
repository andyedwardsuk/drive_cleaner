import { BarChart3, HardDrive, Database, Trash2, RefreshCw, ArrowRight } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import Hero from '@/components/Hero'
import { Button } from '@/components/ui/button'
import { useQuota } from '@/hooks/useQuota'
import { useNavigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 Bytes'
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
    blue: { text: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    green: { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    orange: { text: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    red: { text: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    purple: { text: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
  }

  const theme = colorClasses[color] || colorClasses.blue

  return (
    <div className="p-6 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-lg">
      <div className="flex items-start gap-4">
        <div className={`p-3.5 rounded-xl border ${theme.bg}`}>
          <Icon className={`w-6 h-6 ${theme.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-white tracking-tight mb-1">{value}</p>
          {subValue && <p className="text-xs text-slate-400">{subValue}</p>}
        </div>
      </div>
    </div>
  )
}

/**
 * Storage Analytics View Component
 */
export default function StorageAnalyticsView() {
  const navigate = useNavigate()
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
        <div className="p-16 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm text-center shadow-lg">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-slate-300 text-sm">Loading Google Drive storage metrics...</p>
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
        <div className="p-10 border border-red-500/30 rounded-2xl bg-slate-900/60 backdrop-blur-sm text-center shadow-lg">
          <p className="text-red-400 font-bold mb-2">Error loading storage analytics</p>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <Button
            onClick={fetchQuota}
            className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
          >
            Retry
          </Button>
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
        <div className="p-12 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm text-center shadow-lg">
          <p className="text-slate-400 text-sm">No storage quota data available</p>
        </div>
      </div>
    )
  }

  const quota = data.data

  const usedData = quota.usage || 0
  const availableData = quota.available || 0
  const limitData = quota.limit || 0

  const chartData = [
    { name: 'Used Storage', value: usedData, color: '#3b82f6' },
    { name: 'Available Space', value: availableData, color: '#10b981' },
  ]

  const driveBreakdownData = [
    { name: 'Active Files', value: quota.usageInDrive || 0, color: '#3b82f6' },
    { name: 'Trash Bin', value: quota.usageInDriveTrash || 0, color: '#f59e0b' },
  ]

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
        className="text-xs font-bold"
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
        subtitle="Visual breakdown of your Google Drive storage quota and allocation"
        illustration="📊"
        actions={
          <Button
            onClick={fetchQuota}
            className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-900/40"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Quota
          </Button>
        }
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={HardDrive}
          label="Total Google Storage"
          value={formatBytes(limitData)}
          color="blue"
        />
        <MetricCard
          icon={Database}
          label="Used Space"
          value={formatBytes(usedData)}
          subValue={`${quota.percentUsed}% of total`}
          color={quota.percentUsed > 80 ? 'red' : quota.percentUsed > 60 ? 'orange' : 'green'}
        />
        <MetricCard
          icon={HardDrive}
          label="Available Space"
          value={formatBytes(availableData)}
          color="green"
        />
        <MetricCard
          icon={Database}
          label="Active Drive Files"
          value={formatBytes(quota.usageInDrive)}
          subValue={quota.usageInDriveTrash > 0 ? `${formatBytes(quota.usageInDriveTrash)} in trash` : 'Trash is empty'}
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overall Storage Chart */}
        <div className="p-6 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-xl">
          <h3 className="text-base font-semibold text-white mb-4">Overall Storage Allocation</h3>
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
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Legend
                  formatter={(value, entry) => `${value}: ${formatBytes(entry.payload.value)}`}
                  wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Drive Breakdown Chart */}
        <div className="p-6 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Active vs Trash Space</h3>
            {quota.usageInDriveTrash > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/trash-governance' })}
                className="h-8 px-2.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-950/40 text-xs"
              >
                <span>Govern Trash</span>
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
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
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                  <Legend
                    formatter={(value, entry) => `${value}: ${formatBytes(entry.payload.value)}`}
                    wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <Trash2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-300 font-medium">No items in trash</p>
                  <p className="text-xs text-slate-500 mt-1">All your Drive storage is allocated to active files</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Info / Storage Tips */}
      <div className="p-6 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-xl">
        <h3 className="text-base font-semibold text-white mb-4">Storage Optimization Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="flex gap-3 p-4 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <div className="text-xl">💡</div>
            <div>
              <h4 className="font-semibold text-slate-200 mb-0.5">Find Large Files</h4>
              <p className="text-slate-400 leading-relaxed">
                Use Smart Scan to identify massive video recordings, archives, and datasets consuming quota.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-4 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <div className="text-xl">🗑️</div>
            <div>
              <h4 className="font-semibold text-slate-200 mb-0.5">Govern Trash Lifecycle</h4>
              <p className="text-slate-400 leading-relaxed">
                {quota.usageInDriveTrash > 0
                  ? `You have ${formatBytes(quota.usageInDriveTrash)} trapped in trash. Emptying it immediately frees storage.`
                  : 'Your trash bin is empty. Excellent job keeping your storage footprint tidy!'}
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-4 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <div className="text-xl">📦</div>
            <div>
              <h4 className="font-semibold text-slate-200 mb-0.5">Purge Redundant Duplicates</h4>
              <p className="text-slate-400 leading-relaxed">
                Duplicate files waste precious cloud space. Run a Duplicates Scan to eliminate redundant copies.
              </p>
            </div>
          </div>
          <div className="flex gap-3 p-4 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <div className="text-xl">⏰</div>
            <div>
              <h4 className="font-semibold text-slate-200 mb-0.5">Archive Inactive Documents</h4>
              <p className="text-slate-400 leading-relaxed">
                Move files unused for over 1-2 years into organized year-based archives using the Auto-Archive Engine.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
