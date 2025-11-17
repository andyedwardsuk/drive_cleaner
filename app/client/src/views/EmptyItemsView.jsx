import { FolderOpen } from 'lucide-react'
import Hero from '@/components/Hero'
import { Button } from '@/components/ui/button'

export default function EmptyItemsView() {
  return (
    <div className="space-y-6">
      <Hero
        icon={FolderOpen}
        title="Empty Items"
        subtitle="Find empty files and folders that can be safely removed"
        badge="Coming Soon in v0.5.0"
        illustration="📭"
        actions={
          <Button size="lg" disabled>
            Find Empty Items
          </Button>
        }
      />

      <div className="p-8 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
        <p className="text-gray-400 mb-4">Empty Items detection will include:</p>
        <ul className="text-left max-w-md mx-auto space-y-2 text-gray-300">
          <li>📄 Empty files (0 bytes)</li>
          <li>📁 Empty folders (no children)</li>
          <li>📃 Nearly empty files (&lt;1KB)</li>
          <li>📝 Empty Google Docs</li>
          <li>✅ Safe delete suggestions</li>
          <li>🔧 Bulk cleanup wizard</li>
        </ul>
      </div>
    </div>
  )
}
