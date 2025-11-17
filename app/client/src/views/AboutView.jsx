import { Info, Github, Bug, Mail } from 'lucide-react'
import Hero from '@/components/Hero'
import { Button } from '@/components/ui/button'

export default function AboutView() {
  return (
    <div className="space-y-6">
      <Hero
        icon={Info}
        title="About Drive Cleaner"
        subtitle="Version information and credits"
        illustration="ℹ️"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Version Info */}
        <div className="p-6 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm">
          <h3 className="text-xl font-semibold text-white mb-4">Version Info</h3>
          <div className="space-y-2 text-gray-300">
            <p>
              <span className="text-gray-400">Version:</span> 0.1.0
            </p>
            <p>
              <span className="text-gray-400">Release Date:</span> November 2024
            </p>
            <p>
              <span className="text-gray-400">Build:</span> Development
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="p-6 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm">
          <h3 className="text-xl font-semibold text-white mb-4">Current Features</h3>
          <ul className="space-y-2 text-gray-300">
            <li>✓ Dashboard with file listing</li>
            <li>✓ Folder browsing</li>
            <li>✓ Search and filter</li>
            <li>✓ Export to CSV/JSON</li>
          </ul>
        </div>

        {/* Links */}
        <div className="p-6 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm">
          <h3 className="text-xl font-semibold text-white mb-4">Links</h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                GitHub Repository
              </a>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <Bug className="mr-2 h-4 w-4" />
                Report Bug
              </a>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <Mail className="mr-2 h-4 w-4" />
                Contact Developer
              </a>
            </Button>
          </div>
        </div>

        {/* Credits */}
        <div className="p-6 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm">
          <h3 className="text-xl font-semibold text-white mb-4">Credits</h3>
          <div className="space-y-2 text-gray-300">
            <p>
              <span className="text-gray-400">Developed by:</span> Andy Edwards
            </p>
            <p>
              <span className="text-gray-400">Built with:</span> React, TanStack, Tailwind CSS
            </p>
            <p>
              <span className="text-gray-400">Powered by:</span> Google Apps Script
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Made with Claude Code
            </p>
          </div>
        </div>
      </div>

      {/* Privacy */}
      <div className="p-6 border rounded-xl bg-card/50 border-glass-border backdrop-blur-sm">
        <h3 className="text-xl font-semibold text-white mb-4">Privacy & Security</h3>
        <p className="text-gray-300 mb-4">
          Drive Cleaner respects your privacy and security:
        </p>
        <ul className="space-y-2 text-gray-300">
          <li>✓ All data processing happens in your browser</li>
          <li>✓ No data is sent to external servers</li>
          <li>✓ OAuth tokens are managed by Google</li>
          <li>✓ You maintain full control of your data</li>
        </ul>
      </div>
    </div>
  )
}
