import { useState, useMemo } from 'react'
import { TrendingUp, HardDrive, Leaf, Trash2 } from 'lucide-react'
import { formatBytes } from '@/lib/utils'

export default function ImpactTrendsChart({ dailyLogs = [] }) {
  const [metric, setMetric] = useState('storage') // 'storage' | 'co2' | 'files'

  // Prepare chronological cumulative series
  const chartData = useMemo(() => {
    const sorted = [...dailyLogs].sort((a, b) => new Date(a.date) - new Date(b.date))

    let cumStorage = 0
    let cumCo2 = 0
    let cumFiles = 0

    return sorted.map((item) => {
      cumStorage += item.storage_saved_bytes || 0
      cumCo2 += item.co2_saved_kg || 0
      cumFiles += item.files_deleted || 0

      return {
        date: item.date,
        shortDate: new Date(item.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
        storage: cumStorage,
        co2: Number(cumCo2.toFixed(4)),
        files: cumFiles,
        dailyStorage: item.storage_saved_bytes || 0,
        dailyFiles: item.files_deleted || 0,
      }
    })
  }, [dailyLogs])

  const currentValues = chartData.map((d) => d[metric])
  const maxValue = Math.max(...currentValues, 1)

  // Generate SVG path for line and area
  const svgWidth = 700
  const svgHeight = 220
  const paddingX = 35
  const paddingY = 25

  const points = useMemo(() => {
    if (chartData.length === 0) return []
    const stepX = (svgWidth - paddingX * 2) / Math.max(1, chartData.length - 1)

    return chartData.map((d, idx) => {
      const x = paddingX + idx * stepX
      const y = svgHeight - paddingY - (d[metric] / maxValue) * (svgHeight - paddingY * 2)
      return { x, y, data: d }
    })
  }, [chartData, metric, maxValue])

  const linePath = useMemo(() => {
    if (points.length === 0) return ''
    return points.reduce((acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '')
  }, [points])

  const areaPath = useMemo(() => {
    if (points.length === 0) return ''
    const firstX = points[0].x
    const lastX = points[points.length - 1].x
    const bottomY = svgHeight - paddingY
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`
  }, [linePath, points])

  const lastPoint = chartData[chartData.length - 1]
  const totalCleaned = lastPoint ? lastPoint[metric] : 0

  return (
    <div className="p-6 border rounded-2xl bg-slate-900/60 border-slate-800/80 backdrop-blur-sm space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">30-Day Impact Trends</h3>
            <p className="text-xs text-slate-400">Cumulative cleanup momentum over the last month</p>
          </div>
        </div>

        {/* Metric Selector Pills */}
        <div className="inline-flex rounded-xl bg-slate-950/70 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setMetric('storage')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              metric === 'storage'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            Storage
          </button>
          <button
            type="button"
            onClick={() => setMetric('co2')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              metric === 'co2'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Leaf className="w-3.5 h-3.5" />
            CO₂ Avoided
          </button>
          <button
            type="button"
            onClick={() => setMetric('files')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              metric === 'files'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Files
          </button>
        </div>
      </div>

      {/* Metric Headline */}
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white">
          {metric === 'storage'
            ? formatBytes(totalCleaned)
            : metric === 'co2'
            ? `${totalCleaned} kg CO₂`
            : `${totalCleaned} Files`}
        </span>
        <span className="text-xs text-muted-foreground">reclaimed over 30 days</span>
      </div>

      {/* SVG Chart */}
      <div className="w-full overflow-x-auto custom-scrollbar">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-48 overflow-visible"
        >
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={metric === 'co2' ? '#10b981' : metric === 'files' ? '#f43f5e' : '#3b82f6'}
                stopOpacity="0.35"
              />
              <stop
                offset="100%"
                stopColor={metric === 'co2' ? '#10b981' : metric === 'files' ? '#f43f5e' : '#3b82f6'}
                stopOpacity="0.0"
              />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = svgHeight - paddingY - ratio * (svgHeight - paddingY * 2)
            return (
              <line
                key={idx}
                x1={paddingX}
                y1={y}
                x2={svgWidth - paddingX}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.08"
                strokeDasharray="4 4"
              />
            )
          })}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#trendGradient)" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke={metric === 'co2' ? '#10b981' : metric === 'files' ? '#f43f5e' : '#3b82f6'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points (sparse labels) */}
          {points.map((pt, idx) => {
            if (idx % 6 !== 0 && idx !== points.length - 1) return null
            return (
              <g key={idx}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  fill={metric === 'co2' ? '#10b981' : metric === 'files' ? '#f43f5e' : '#3b82f6'}
                  stroke="#18181b"
                  strokeWidth="1.5"
                />
                <text
                  x={pt.x}
                  y={svgHeight - 6}
                  textAnchor="middle"
                  className="text-[10px] fill-muted-foreground font-mono"
                >
                  {pt.data.shortDate}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
