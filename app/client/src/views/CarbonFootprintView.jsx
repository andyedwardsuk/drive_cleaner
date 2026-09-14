import { useState } from 'react'
import {
  Leaf,
  Globe,
  Car,
  Smartphone,
  Trees,
  Zap,
  Award,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Info,
  RefreshCw,
  HelpCircle,
  Coffee,
  Laptop
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import Hero from '@/components/Hero'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSmartScan } from '@/hooks/useSmartScan'

/**
 * Format bytes to readable string
 */
function formatBytes(bytes) {
  if (bytes === 0 || !bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

/**
 * Tangible Equivalent Card Component
 */
function EquivalentCard({ icon: Icon, value, unit, label, color = 'emerald' }) {
  const colorMap = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  }

  return (
    <div className="p-5 rounded-xl border bg-card/50 border-glass-border backdrop-blur-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-400">{label}</span>
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-gray-100">{value}</span>
          <span className="text-xs text-gray-400 font-medium">{unit}</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Carbon Footprint View Component
 */
export default function CarbonFootprintView() {
  const { data, loading, runScan } = useSmartScan()
  const navigate = useNavigate()
  const [showInfo, setShowInfo] = useState(false)

  const carbon = data?.carbon_footprint || null

  if (loading) {
    return (
      <div className="space-y-6">
        <Hero
          icon={Leaf}
          title="Cloud Carbon Footprint"
          subtitle="Estimate emissions and transform digital cleanup into climate action"
          illustration="🌱"
        />
        <div className="p-12 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-3" />
          <p className="text-gray-300 font-medium">Calculating energy consumption & carbon emissions...</p>
        </div>
      </div>
    )
  }

  if (!carbon || carbon.storage_gb === 0) {
    return (
      <div className="space-y-6">
        <Hero
          icon={Leaf}
          title="Cloud Carbon Footprint"
          subtitle="Estimate emissions and transform digital cleanup into climate action"
          illustration="🌱"
        />
        <div className="p-12 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
          <Globe className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-100 mb-2">No Carbon Data Available</h3>
          <p className="text-gray-400 max-w-md mx-auto mb-6 text-sm">
            Run a Smart Scan on your Drive to calculate your storage volume, energy consumption (kWh), and annual carbon emissions.
          </p>
          <Button onClick={() => runScan('root', 'user')} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium hover:opacity-90">
            <RefreshCw className="w-4 h-4 mr-2" />
            Run Smart Scan Now
          </Button>
        </div>
      </div>
    )
  }

  const { storage_gb, annual_co2_kg, annual_energy_kwh, equivalents, breakdown_by_type, potential_savings, eco_rating, achievements } = carbon

  return (
    <div className="space-y-6 pb-12">
      <Hero
        icon={Leaf}
        title="Cloud Carbon Footprint & Green Impact"
        subtitle="Track the environmental cost of cloud storage and turn digital cleanup into tangible climate action."
        illustration="🌱"
      />

      {/* Main Carbon Summary Card */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-2xl border border-glass-border bg-gradient-to-br from-emerald-950/40 via-card/60 to-teal-950/30 backdrop-blur-xl">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <Globe className="w-48 h-48 text-emerald-300" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-300 border-emerald-500/30 text-xs px-2.5 py-0.5">
                {eco_rating?.icon} {eco_rating?.level}
              </Badge>
              <span className="text-xs text-gray-400">Based on {storage_gb} GB analyzed</span>
            </div>

            <div className="flex items-baseline gap-3">
              <h2 className="text-4xl font-bold tracking-tight text-white">{annual_co2_kg}</h2>
              <span className="text-lg font-medium text-emerald-300">kg CO₂e / year</span>
            </div>

            <p className="text-sm text-gray-300">
              Your cloud storage consumes approximately <span className="text-emerald-400 font-mono font-medium">{annual_energy_kwh} kWh</span> of electricity annually.
            </p>

            {/* Headline Equivalent Banner */}
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Equivalent to <strong>{equivalents?.headline}</strong></span>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
            <div className="text-xs text-gray-400">Potential Annual CO₂ Savings</div>
            <div className="text-2xl font-bold text-green-400">
              -{potential_savings?.co2_saved_kg || 0} kg CO₂
            </div>
            <p className="text-xs text-gray-400 max-w-xs text-left md:text-right">
              By removing {potential_savings?.cleanup_gb || 0} GB of redundant duplicates & obsolete ROT files.
            </p>
            <Button
              size="sm"
              onClick={() => navigate({ to: '/rot-analysis' })}
              className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
            >
              Start Green Cleanup <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Relatable Tangible Equivalents Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-100">Tangible Real-World Equivalents</h3>
          <span className="text-xs text-gray-400">Annual emission equivalents</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <EquivalentCard
            icon={Car}
            value={equivalents?.car_miles || 0}
            unit="miles"
            label="Car Driving Distance"
            color="emerald"
          />
          <EquivalentCard
            icon={Smartphone}
            value={equivalents?.smartphone_charges?.toLocaleString() || 0}
            unit="charges"
            label="Smartphone Charges"
            color="blue"
          />
          <EquivalentCard
            icon={Trees}
            value={equivalents?.tree_years || 0}
            unit="tree years"
            label="Trees to Absorb"
            color="amber"
          />
          <EquivalentCard
            icon={Laptop}
            value={equivalents?.laptop_hours?.toLocaleString() || 0}
            unit="hours"
            label="Laptop Usage"
            color="purple"
          />
        </div>
      </div>

      {/* Carbon Breakdown by Media Type */}
      <div className="p-6 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-gray-100">Carbon Footprint by File Type</h3>
            <p className="text-xs text-gray-400">Videos and high-res media typically consume the largest share of continuous storage energy.</p>
          </div>
          <span className="text-xs text-gray-400 font-mono">{storage_gb} GB total</span>
        </div>

        {/* Stacked Percentage Bar */}
        {breakdown_by_type && (
          <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-white/5 border border-white/10">
            {Object.values(breakdown_by_type).map((item, i) => (
              <div
                key={i}
                style={{ width: `${item.percentage || 0}%` }}
                className={`h-full transition-all ${
                  item.color === 'rose'
                    ? 'bg-rose-500'
                    : item.color === 'amber'
                    ? 'bg-amber-400'
                    : item.color === 'blue'
                    ? 'bg-blue-500'
                    : 'bg-purple-500'
                }`}
                title={`${item.label}: ${item.percentage}%`}
              />
            ))}
          </div>
        )}

        {/* Breakdown Cards */}
        {breakdown_by_type && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {Object.entries(breakdown_by_type).map(([key, item]) => (
              <div key={key} className="p-3.5 rounded-lg border border-white/5 bg-white/5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
                      <span>{item.icon}</span> {item.label}
                    </span>
                    <span className="text-xs font-mono font-semibold text-gray-200">{item.percentage}%</span>
                  </div>
                  <div className="text-lg font-bold text-gray-100">{item.size_gb} GB</div>
                </div>
                <div className="mt-2 pt-2 border-t border-white/5 text-[11px] text-gray-400 font-mono flex items-center justify-between">
                  <span>Emissions</span>
                  <span className="text-emerald-400">{item.annual_co2_kg} kg CO₂/yr</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Green Gamification & Climate Achievements */}
      <div className="p-6 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-semibold text-gray-100">Green Gamification & Achievements</h3>
          </div>
          <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-300 border-amber-500/30">
            🌱 Eco Action Badges
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {achievements?.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                ach.unlocked
                  ? 'bg-emerald-950/20 border-emerald-500/40 ring-1 ring-emerald-500/20'
                  : 'bg-white/5 border-white/5 opacity-85'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{ach.icon}</span>
                  {ach.unlocked ? (
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                      Unlocked
                    </Badge>
                  ) : (
                    <span className="text-[11px] text-gray-400 font-mono">{ach.progress}%</span>
                  )}
                </div>
                <h5 className="text-xs font-semibold text-gray-100 mb-1">{ach.name}</h5>
                <p className="text-[11px] text-gray-400 leading-relaxed">{ach.description}</p>
              </div>

              {!ach.unlocked && (
                <div className="mt-3 w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${ach.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Educational Banner */}
      <div className="p-5 rounded-xl border border-glass-border bg-white/5 backdrop-blur-sm flex items-start gap-4">
        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 flex-shrink-0 mt-0.5">
          <Info className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-1">
          <div className="font-semibold text-gray-200">Why does cloud storage generate carbon emissions?</div>
          <p className="text-gray-400 leading-relaxed">
            Data centers consume roughly 1% of worldwide electricity. Every gigabyte stored is mirrored across multiple redundant servers and solid-state disks that require uninterrupted electrical power and 24/7 cooling. By pruning redundant duplicates, obsolete items, and trivial files, you actively lower the long-term energy draw required to keep your data alive.
          </p>
        </div>
      </div>
    </div>
  )
}
