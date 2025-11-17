import { History } from 'lucide-react'
import Hero from '@/components/Hero'

export default function HistoryView() {
  return (
    <div className="space-y-6">
      <Hero
        icon={History}
        title="History"
        subtitle="View your scan and action history"
        badge="Coming Soon in v0.3.0"
        illustration="📋"
      />

      <div className="p-8 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
        <p className="text-gray-400 mb-4">History tracking will include:</p>
        <ul className="text-left max-w-md mx-auto space-y-2 text-gray-300">
          <li>📅 Scan history timeline</li>
          <li>🔄 Action history (deleted files, etc.)</li>
          <li>↩️ Restore deleted files (within undo window)</li>
          <li>📊 Export history</li>
          <li>🗑️ Clear history</li>
          <li>🎯 Filter by date range</li>
        </ul>
      </div>
    </div>
  )
}
