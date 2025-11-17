import { Trash2 } from 'lucide-react'
import Hero from '@/components/Hero'
import { Button } from '@/components/ui/button'

export default function TempFilesView() {
  return (
    <div className="space-y-6">
      <Hero
        icon={Trash2}
        title="Temporary Files"
        subtitle="Find and remove temporary and cache files"
        badge="Coming Soon in v0.5.0"
        illustration="🗑️"
        actions={
          <Button size="lg" disabled>
            Find Temp Files
          </Button>
        }
      />

      <div className="p-8 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
        <p className="text-gray-400 mb-4">Temporary Files detection will include:</p>
        <ul className="text-left max-w-md mx-auto space-y-2 text-gray-300">
          <li>📝 Office temp files (.tmp, ~$)</li>
          <li>💾 Cache files</li>
          <li>📋 Backup files (.bak)</li>
          <li>💿 Auto-save files</li>
          <li>🌐 Browser temp files</li>
          <li>✅ Safe cleanup suggestions</li>
        </ul>
      </div>
    </div>
  )
}
