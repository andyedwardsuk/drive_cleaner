import { Layers } from 'lucide-react'
import Hero from '@/components/Hero'
import { Button } from '@/components/ui/button'

export default function BulkActionsView() {
  return (
    <div className="space-y-6">
      <Hero
        icon={Layers}
        title="Bulk Actions"
        subtitle="Perform mass operations on multiple files at once"
        badge="Coming Soon in v0.6.0"
        illustration="🔧"
        actions={
          <Button size="lg" disabled>
            Start Bulk Operation
          </Button>
        }
      />

      <div className="p-8 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
        <p className="text-gray-400 mb-4">Bulk Actions will include:</p>
        <ul className="text-left max-w-md mx-auto space-y-2 text-gray-300">
          <li>🗑️ Bulk delete (move to trash)</li>
          <li>❌ Bulk permanent delete</li>
          <li>📁 Bulk move to folder</li>
          <li>👥 Bulk share settings</li>
          <li>⭐ Bulk star/unstar</li>
          <li>↩️ Undo functionality</li>
        </ul>
      </div>
    </div>
  )
}
