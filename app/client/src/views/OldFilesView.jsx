import { Clock } from 'lucide-react'
import Hero from '@/components/Hero'
import { Button } from '@/components/ui/button'

export default function OldFilesView() {
  return (
    <div className="space-y-6">
      <Hero
        icon={Clock}
        title="Old Files"
        subtitle="Find files that haven't been accessed in a long time"
        badge="Coming Soon in v0.2.0"
        illustration="⏰"
        actions={
          <Button size="lg" disabled>
            Find Old Files
          </Button>
        }
      />

      <div className="p-8 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
        <p className="text-gray-400 mb-4">Old Files detection will include:</p>
        <ul className="text-left max-w-md mx-auto space-y-2 text-gray-300">
          <li>📅 Files not accessed in &gt;1 year</li>
          <li>📆 Files not accessed in &gt;2 years</li>
          <li>🗓️ Files not accessed in &gt;5 years</li>
          <li>🎯 Custom date range</li>
          <li>📊 File age breakdown</li>
          <li>💡 Archive suggestions</li>
        </ul>
      </div>
    </div>
  )
}
