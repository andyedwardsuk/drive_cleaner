import { Shield, Lock, EyeOff, ServerOff, Database, CheckCircle2, Mail, FileText, AlertCircle } from 'lucide-react'
import { faShieldCheck } from '@fortawesome/pro-duotone-svg-icons'
import Hero from '@/components/Hero'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { APP_VERSION } from '@/version'

export default function PrivacyView() {
  return (
    <div className="space-y-6">
      <Hero
        faIcon={faShieldCheck}
        variant="emerald"
        title="Privacy Policy"
        subtitle="How Drive Cleaner accesses, processes, and protects your Google Drive metadata"
        actions={
          <Badge variant="outline" className="text-xs px-3 py-1 bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
            Effective Date: September 18, 2026 (v{APP_VERSION})
          </Badge>
        }
      />

      {/* Core Privacy Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-lg">
          <div className="p-2.5 w-fit rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-3">
            <ServerOff className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">Zero External Servers</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Drive Cleaner operates 100% within Google Apps Script and your local browser session. No data is ever transmitted to outside servers or databases.
          </p>
        </div>

        <div className="p-5 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-lg">
          <div className="p-2.5 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">Metadata Only — No Content</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            We only inspect file attributes (names, sizes, dates, MIME types). We never read, copy, parse, or download your documents, photos, or confidential content.
          </p>
        </div>

        <div className="p-5 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-lg">
          <div className="p-2.5 w-fit rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">Never Sold or Monetized</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            We do not sell, rent, license, or share your data with third parties, ad networks, data brokers, or AI model trainers under any circumstances.
          </p>
        </div>
      </div>

      {/* Detailed Legal Sections */}
      <div className="space-y-4">
        {/* Section 1: Introduction & Scope */}
        <div className="p-6 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-lg space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold font-mono">1</span>
            <h3 className="text-base font-bold text-white">Introduction & Scope</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Drive Cleaner (&quot;the Application&quot;, &quot;we&quot;, &quot;our&quot;) is a Google Workspace add-on and web application designed to help individuals and enterprise administrators analyse storage utilization, detect duplicate and stale files, and organize Google Drive storage. This Privacy Policy governs the manner in which Drive Cleaner accesses, collects, uses, and protects information gathered during your authorized use of the application.
          </p>
        </div>

        {/* Section 2: Data We Access */}
        <div className="p-6 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-lg space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold font-mono">2</span>
            <h3 className="text-base font-bold text-white">Data We Access</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            To provide storage analytics and file governance, Drive Cleaner requests access to your Google account through Google&apos;s standard OAuth 2.0 protocol. The application accesses only the following items:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60 space-y-1">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                Accessed File Metadata
              </span>
              <ul className="text-slate-400 space-y-1 pl-5 list-disc">
                <li>File ID and Name</li>
                <li>File Size (bytes) and MIME Type</li>
                <li>Created, Modified, and Last Viewed Timestamps</li>
                <li>Parent Folder IDs and Folder Hierarchy Paths</li>
                <li>File MD5 Checksum (for exact duplicate matching)</li>
                <li>Sharing Status (Shared / Private / Domain flags)</li>
              </ul>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60 space-y-1">
              <span className="font-semibold text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Never Accessed or Read
              </span>
              <ul className="text-slate-400 space-y-1 pl-5 list-disc">
                <li>Actual contents of your documents, sheets, or presentations</li>
                <li>Image, video, or audio binary data</li>
                <li>Private emails, contacts, calendars, or messages</li>
                <li>Credentials, passwords, or payment cards</li>
                <li>Any data residing outside your designated Drive target</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 3: Google API Services User Data Policy (Limited Use) */}
        <div className="p-6 border border-blue-500/30 rounded-2xl bg-blue-950/20 backdrop-blur-sm shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-blue-400">
            <Shield className="w-5 h-5 shrink-0" />
            <h3 className="text-base font-bold text-white">Google API Services User Data Policy Compliance</h3>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            Drive Cleaner strictly adheres to the{' '}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </p>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-blue-500/20 text-xs text-blue-200/90 leading-relaxed font-mono">
            &quot;Drive Cleaner&apos;s use and transfer to any other app of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements.&quot;
          </div>
          <ul className="text-xs text-slate-300 space-y-1.5 pl-4 list-disc">
            <li>We do not transfer Google user data to any external advertising platforms, data brokers, or information resellers.</li>
            <li>We do not use Google user data to build, train, or improve generalized Artificial Intelligence (AI) or Machine Learning (ML) models.</li>
            <li>Humans are not permitted to read your data unless you have given explicit affirmative permission for resolving a specific diagnostic issue.</li>
          </ul>
        </div>

        {/* Section 4: Data Storage, Caching, and Architecture */}
        <div className="p-6 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-lg space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold font-mono">4</span>
            <h3 className="text-base font-bold text-white">Data Storage & Security Architecture</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Drive Cleaner utilizes a serverless client-centric architecture. When you perform an audit or Smart Scan:
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 pl-4 list-disc">
            <li><strong className="text-white">Transient Memory:</strong> File metadata chunks are processed in the user&apos;s local browser memory and discarded upon session close.</li>
            <li><strong className="text-white">Google Properties Store:</strong> User preferences (e.g. active folder target, scan checkpoint counters) are saved in your personal <code className="text-slate-300 bg-slate-800 px-1 py-0.5 rounded">PropertiesService.getUserProperties()</code> storage, which is private to your Google account.</li>
            <li><strong className="text-white">Encryption in Transit:</strong> All communication between your browser and Google Apps Script occurs over secure HTTPS encrypted with TLS 1.3.</li>
          </ul>
        </div>

        {/* Section 5: User Control, Data Retention & Deletion */}
        <div className="p-6 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-lg space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold font-mono">5</span>
            <h3 className="text-base font-bold text-white">Data Retention & Revocation of Access</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Because Drive Cleaner does not maintain external databases, we do not retain your file records once you close or reset the application. You maintain full ownership and control:
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 pl-4 list-disc">
            <li><strong className="text-white">Instant Cache Wipe:</strong> You can clear all cached scan data and local configurations at any time from <code className="text-slate-300 bg-slate-800 px-1 py-0.5 rounded">Settings &gt; Reset Application Data</code>.</li>
            <li><strong className="text-white">Revoke Permissions:</strong> You can revoke Drive Cleaner&apos;s authorization instantly by visiting your{' '}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Google Account Third-Party Access Settings
              </a>.
            </li>
          </ul>
        </div>

        {/* Section 6: Contact Information */}
        <div className="p-6 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-lg space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold font-mono">6</span>
            <h3 className="text-base font-bold text-white">Contact & Inquiries</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            If you have questions, concerns, or requests regarding this Privacy Policy or your data, please contact the developer:
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              variant="outline"
              className="h-10 rounded-xl border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-semibold"
              asChild
            >
              <a href="mailto:support@andyedwards.uk">
                <Mail className="mr-2 h-4 w-4 text-blue-400" />
                support@andyedwards.uk
              </a>
            </Button>
            <Button
              variant="outline"
              className="h-10 rounded-xl border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-semibold"
              asChild
            >
              <a href="https://github.com/andyedwardsuk/drive_cleaner/issues" target="_blank" rel="noopener noreferrer">
                <FileText className="mr-2 h-4 w-4 text-slate-400" />
                GitHub Security Issues
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
