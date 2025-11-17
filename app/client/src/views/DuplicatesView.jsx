import { RefreshCw } from 'lucide-react'
import Hero from '@/components/Hero'
import { Button } from '@/components/ui/button'

export default function DuplicatesView() {
  return (
    <div className="space-y-6">
      <Hero
        icon={RefreshCw}
        title="Duplicate Files"
        subtitle="Find and remove duplicate files to free up space"
        badge="Coming Soon in v0.4.0"
        illustration="🔄"
        actions={
          <Button size="lg" disabled>
            Scan for Duplicates
          </Button>
        }
      />

      <div className="p-8 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
        <p className="text-gray-400 mb-4">Duplicate detection will include:</p>
        <ul className="text-left max-w-md mx-auto space-y-2 text-gray-300">
          <li>🔍 Exact name match</li>
          <li>📏 Name + size match</li>
          <li>🔐 MD5 checksum match</li>
          <li>👀 Side-by-side comparison</li>
          <li>💡 Smart suggestions (keep newest, largest, etc.)</li>
          <li>💾 Show potential space savings</li>
        </ul>
      </div>
    </div>
  )
}
