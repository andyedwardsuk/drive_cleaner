import { Scan, FileText, Clock, Copy, Trash2, AlertCircle, CheckCircle, ChevronRight, FileSpreadsheet, Flame, Leaf } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import Hero from '@/components/Hero'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSmartScan } from '@/hooks/useSmartScan'

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Category summary card component
 */
function CategoryCard({ icon: Icon, title, count, size, color = 'blue', onClick }) {
  // Map colors to static Tailwind classes
  const colorClasses = {
    purple: { bg: 'bg-purple-500/10', icon: 'text-purple-400' },
    orange: { bg: 'bg-orange-500/10', icon: 'text-orange-400' },
    blue: { bg: 'bg-blue-500/10', icon: 'text-blue-400' },
    gray: { bg: 'bg-gray-500/10', icon: 'text-gray-400' },
    yellow: { bg: 'bg-yellow-500/10', icon: 'text-yellow-400' },
    rose: { bg: 'bg-rose-500/10', icon: 'text-rose-400' },
  }

  const classes = colorClasses[color] || colorClasses.blue

  return (
    <div
      className="p-6 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm hover:bg-card/70 hover:border-primary/40 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${classes.bg}`}>
          <Icon className={`w-6 h-6 ${classes.icon}`} />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{count}</Badge>
          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-300 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
      <h3 className="font-semibold text-lg mb-1 text-white">{title}</h3>
      {size !== undefined && (
        <p className="text-sm text-gray-400">{formatBytes(size)}</p>
      )}
    </div>
  )
}

/**
 * Scan results summary component
 */
function ScanResults({ data }) {
  const navigate = useNavigate()

  const categories = [
    {
      icon: FileText,
      title: 'Large Files',
      count: data.large_files?.count || 0,
      size: data.large_files?.total_size_bytes,
      color: 'purple',
      path: '/large-files',
    },
    {
      icon: Clock,
      title: 'Old Files',
      count: data.old_files?.count || 0,
      size: data.old_files?.total_size_bytes,
      color: 'orange',
      path: '/old-files',
    },
    {
      icon: Copy,
      title: 'Duplicates',
      count: data.duplicates?.count || 0,
      size: data.duplicates?.groups?.reduce(
        (acc, group) => acc + group.total_size_bytes,
        0
      ),
      color: 'blue',
      path: '/duplicates',
    },
    {
      icon: Trash2,
      title: 'Empty Items',
      count: data.empty_items?.count || 0,
      size: 0,
      color: 'gray',
      path: '/empty-items',
    },
    {
      icon: AlertCircle,
      title: 'Temp Files',
      count: data.temp_files?.count || 0,
      size: data.temp_files?.total_size_bytes,
      color: 'yellow',
      path: '/temp-files',
    },
    {
      icon: FileSpreadsheet,
      title: 'Workspace Files',
      count: data.workspace_files?.count || 0,
      size: data.workspace_files?.total_size_bytes,
      color: 'blue',
      path: '/workspace-files',
    },
    {
      icon: Flame,
      title: 'Data ROT Analysis',
      count: data.rot_analysis?.count || 0,
      size: data.rot_analysis?.total_size_bytes,
      color: 'rose',
      path: '/rot-analysis',
    },
  ]

  const totalFiles = data.total_files_scanned || 0
  const totalSpace = data.total_space_used_bytes || 0
  const potentialSavings = data.total_potential_savings_bytes || 0

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="p-6 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <h2 className="text-xl font-semibold">Scan Complete</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-400">Files Scanned</p>
            <p className="text-2xl font-bold">{totalFiles.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Space</p>
            <p className="text-2xl font-bold">{formatBytes(totalSpace)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Potential Savings</p>
            <p className="text-2xl font-bold text-green-500">
              {formatBytes(potentialSavings)}
            </p>
          </div>
        </div>
        {data.scan_date && (
          <p className="text-xs text-gray-400 mt-4">
            Scanned: {new Date(data.scan_date).toLocaleString()}
          </p>
        )}

        {data.carbon_footprint && (
          <div
            onClick={() => navigate({ to: '/carbon-footprint' })}
            className="mt-4 pt-4 border-t border-glass-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer group hover:opacity-95 transition-opacity"
          >
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <span className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
                <Leaf className="w-4 h-4" />
              </span>
              <span>
                Annual Cloud Carbon Footprint: <strong className="text-emerald-300">{data.carbon_footprint.annual_co2_kg} kg CO₂</strong> ({data.carbon_footprint.equivalents?.headline})
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium group-hover:translate-x-0.5 transition-transform">
              <span>View Eco Impact</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        )}
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category, index) => (
          <CategoryCard
            key={index}
            {...category}
            onClick={() => category.path && navigate({ to: category.path })}
          />
        ))}
      </div>

      {/* Recommendations */}
      {data.recommendations && data.recommendations.length > 0 && (
        <div className="p-6 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
          <div className="space-y-3">
            {data.recommendations.map((rec, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg bg-card/30"
              >
                <Badge
                  variant={
                    rec.priority === 'high'
                      ? 'destructive'
                      : rec.priority === 'medium'
                      ? 'default'
                      : 'secondary'
                  }
                >
                  {rec.priority}
                </Badge>
                <div className="flex-1">
                  <p className="text-sm">{rec.message}</p>
                  {rec.space_savings_bytes > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      Savings: {formatBytes(rec.space_savings_bytes)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Smart Scan View - Main component
 */
export default function SmartScanView() {
  const { data, loading, error, runScan, reset } = useSmartScan()

  const handleStartScan = () => {
    runScan('root', 'user')
  }

  const handleNewScan = () => {
    reset()
  }

  // Show results if we have data
  if (data) {
    return (
      <div className="space-y-6">
        <Hero
          icon={Scan}
          title="Smart Scan"
          subtitle={`Analyzed ${data.folder_name || 'My Drive'}`}
          illustration="✅"
          actions={
            <Button onClick={handleNewScan} size="lg">
              Run New Scan
            </Button>
          }
        />
        <ScanResults data={data} />
      </div>
    )
  }

  // Show initial state
  return (
    <div className="space-y-6">
      <Hero
        icon={Scan}
        title="Smart Scan"
        subtitle="Comprehensive scan for all issues in your Google Drive"
        illustration="🔍"
        actions={
          <Button onClick={handleStartScan} size="lg" disabled={loading}>
            {loading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Scanning...
              </>
            ) : (
              'Start Smart Scan'
            )}
          </Button>
        }
      />

      {loading && (
        <div className="p-8 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
          <div className="animate-pulse">
            <p className="text-gray-300 mb-4">Analyzing your Drive...</p>
            <p className="text-sm text-gray-400">
              This may take a few moments depending on the number of files
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-6 border rounded-xl bg-red-500/10 border-red-500/20 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-500 mb-1">Scan Failed</h3>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="p-8 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
          <p className="text-gray-400 mb-4">
            Smart Scan will comprehensively analyze your Drive for:
          </p>
          <ul className="text-left max-w-md mx-auto space-y-2 text-gray-300">
            <li>✓ Duplicate files</li>
            <li>✓ Large files (&gt;100MB, &gt;500MB, &gt;1GB)</li>
            <li>✓ Old files (&gt;1 year, &gt;2 years, &gt;5 years)</li>
            <li>✓ Empty files and folders</li>
            <li>✓ Temporary files</li>
          </ul>
        </div>
      )}
    </div>
  )
}
