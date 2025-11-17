import { HardDrive } from 'lucide-react'
import Hero from '@/components/Hero'
import { Button } from '@/components/ui/button'

export default function LargeFilesView() {
  return (
    <div className="space-y-6">
      <Hero
        icon={HardDrive}
        title="Large Files"
        subtitle="Find and manage files taking up the most space"
        badge="Coming Soon in v0.2.0"
        illustration="📦"
        actions={
          <Button size="lg" disabled>
            Find Large Files
          </Button>
        }
      />

      <div className="p-8 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
        <p className="text-gray-400 mb-4">Large Files detection will include:</p>
        <ul className="text-left max-w-md mx-auto space-y-2 text-gray-300">
          <li>💾 Files &gt;100MB</li>
          <li>💿 Files &gt;500MB</li>
          <li>📀 Files &gt;1GB</li>
          <li>🎯 Custom size range filter</li>
          <li>📊 File type breakdown</li>
          <li>👁️ Preview files</li>
        </ul>
      </div>
    </div>
  )
}
