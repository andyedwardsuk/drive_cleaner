import { Info, Github, Bug, Mail, Shield, CheckCircle2, Cpu, HardDrive } from 'lucide-react'
import { faCircleInfo } from '@fortawesome/pro-duotone-svg-icons'
import Hero from '@/components/Hero'
import { Button } from '@/components/ui/button'
import { APP_VERSION, BUILD_TIMESTAMP, FEATURES } from '@/version'

export default function AboutView() {
  return (
    <div className="space-y-6">
      <Hero
        faIcon={faCircleInfo}
        variant="cyan"
        title="About Drive Cleaner"
        subtitle="Version specifications, architecture summary, and privacy standards"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Version Info */}
        <div className="p-6 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Version Specifications</h3>
          </div>
          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Release Version:</span>
              <span className="font-mono font-bold text-emerald-400">v{APP_VERSION} (Production)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Build Timestamp:</span>
              <span className="font-mono text-slate-300">{new Date(BUILD_TIMESTAMP).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Platform:</span>
              <span className="text-slate-200">Google Apps Script V8 Engine</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Drive API:</span>
              <span className="text-slate-200">Google Drive API v2 (Advanced Service)</span>
            </div>
          </div>
        </div>

        {/* Features Catalog Summary */}
        <div className="p-6 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <HardDrive className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Active Core Hubs</h3>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {FEATURES.slice(0, 7).map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{f}</span>
              </li>
            ))}
            <li className="text-slate-500 text-[11px] pt-1">+ 20 additional enterprise governance modules</li>
          </ul>
        </div>

        {/* Credits */}
        <div className="p-6 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-lg">
          <h3 className="text-base font-bold text-white mb-4">Engineering & Architecture</h3>
          <div className="space-y-2.5 text-xs text-slate-300">
            <p>
              <span className="text-slate-400">Architect:</span> Andy Edwards
            </p>
            <p>
              <span className="text-slate-400">Frontend Stack:</span> React 18, Web Awesome Pro, Font Awesome Pro Duotone, TanStack Router, Tailwind CSS, Framer Motion
            </p>
            <p>
              <span className="text-slate-400">Storage & Caching:</span> Browser IndexedDB (Zero-Memory Leaks) + Google Apps Script CacheService
            </p>
            <p>
              <span className="text-slate-400">Deployment Pipeline:</span> Clasp + Vite Singlefile Bundler
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="p-6 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-lg">
          <h3 className="text-base font-bold text-white mb-4">Support & Documentation</h3>
          <div className="space-y-2.5">
            <Button
              variant="outline"
              className="w-full justify-start h-11 rounded-xl border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-semibold"
              asChild
            >
              <a href="https://github.com/andyedwardsuk/drive_cleaner" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4 text-slate-400" />
                GitHub Repository
              </a>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-11 rounded-xl border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-semibold"
              asChild
            >
              <a href="mailto:support@andyedwards.uk">
                <Mail className="mr-2 h-4 w-4 text-slate-400" />
                Contact Developer
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Privacy & Security Card */}
      <div className="p-6 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Privacy & Security Guarantees</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Drive Cleaner runs directly within your authorised Google Workspace domain and browser session:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">Client-Side Execution</strong>
              <span className="text-slate-400">All file metadata and delta processing executes directly in your browser.</span>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">Zero Third-Party Relays</strong>
              <span className="text-slate-400">No telemetry, file content, or credentials ever leave your Google account.</span>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">OAuth Google Managed</strong>
              <span className="text-slate-400">Permissions are strictly scoped through Google Apps Script OAuth2.</span>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">Accidental Deletion Protection</strong>
              <span className="text-slate-400">Safe undo windows and double-confirmation protection for permanent purges.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
