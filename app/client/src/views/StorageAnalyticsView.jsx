import { BarChart3 } from 'lucide-react'
import Hero from '@/components/Hero'

export default function StorageAnalyticsView() {
  return (
    <div className="space-y-6">
      <Hero
        icon={BarChart3}
        title="Storage Analytics"
        subtitle="Visual breakdown of your Drive storage usage"
        badge="Coming Soon in v0.3.0"
        illustration="📊"
      />

      <div className="p-8 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
        <p className="text-gray-400 mb-4">Storage Analytics will provide:</p>
        <ul className="text-left max-w-md mx-auto space-y-2 text-gray-300">
          <li>📈 Visual folder size breakdown (tree map / sunburst chart)</li>
          <li>📊 File type distribution</li>
          <li>📉 Storage trends over time</li>
          <li>📁 Largest folders list</li>
          <li>🔍 Interactive drill-down</li>
        </ul>
      </div>
    </div>
  )
}
