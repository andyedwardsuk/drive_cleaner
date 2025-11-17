import { Scan } from 'lucide-react'
import Hero from '@/components/Hero'
import { Button } from '@/components/ui/button'

export default function SmartScanView() {
  return (
    <div className="space-y-6">
      <Hero
        icon={Scan}
        title="Smart Scan"
        subtitle="Comprehensive scan for all issues in your Google Drive"
        badge="Coming Soon in v0.2.0"
        illustration="🔍"
        actions={
          <Button size="lg" disabled>
            Start Smart Scan
          </Button>
        }
      />

      <div className="p-8 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm text-center">
        <p className="text-gray-400 mb-4">
          Smart Scan will comprehensively analyze your Drive for:
        </p>
        <ul className="text-left max-w-md mx-auto space-y-2 text-gray-300">
          <li>✓ Duplicate files</li>
          <li>✓ Large files (&gt;100MB, &gt;500MB, &gt;1GB)</li>
          <li>✓ Old files (&gt;1 year, &gt;2 years)</li>
          <li>✓ Empty files and folders</li>
          <li>✓ Temporary files</li>
          <li>✓ Unusual storage patterns</li>
        </ul>
      </div>
    </div>
  )
}
