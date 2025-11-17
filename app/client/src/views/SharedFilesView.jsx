import { Star } from 'lucide-react'
import Hero from '@/components/Hero'
import { Button } from '@/components/ui/button'

export default function SharedFilesView() {
  return (
    <div className="space-y-6">
      <Hero
        icon={Star}
        title="Shared Files"
        subtitle="Manage files shared with you or by you"
        badge="Coming Soon in v0.2.0"
        illustration="⭐"
        actions={
          <Button size="lg" disabled>
            View Shared Files
          </Button>
        }
      />

      <div className="p-8 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
        <p className="text-gray-400 mb-4">Shared Files management will include:</p>
        <ul className="text-left max-w-md mx-auto space-y-2 text-gray-300">
          <li>📥 Files shared with me</li>
          <li>📤 Files shared by me</li>
          <li>🌐 Publicly shared files</li>
          <li>👥 Shared drive files</li>
          <li>🔐 Permission level filter</li>
          <li>🔧 Revoke sharing actions</li>
        </ul>
      </div>
    </div>
  )
}
