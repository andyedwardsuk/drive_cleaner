import { Settings } from 'lucide-react'
import Hero from '@/components/Hero'

export default function SettingsView() {
  return (
    <div className="space-y-6">
      <Hero
        icon={Settings}
        title="Settings"
        subtitle="Customize your Drive Cleaner preferences"
        badge="Coming Soon in v0.2.0"
        illustration="⚙️"
      />

      <div className="p-8 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
        <p className="text-gray-400 mb-4">Settings will include:</p>
        <ul className="text-left max-w-md mx-auto space-y-2 text-gray-300">
          <li>🎨 Theme selection (dark/light/auto)</li>
          <li>🌈 Color scheme variants</li>
          <li>📏 File size thresholds (customize "large")</li>
          <li>📅 Age thresholds (customize "old")</li>
          <li>🔍 Default scan settings</li>
          <li>🔔 Email notifications</li>
          <li>🔐 Privacy settings</li>
        </ul>
      </div>
    </div>
  )
}
