import { FileText, ShieldAlert, CheckCircle2, RotateCcw, AlertTriangle, Mail, ExternalLink, HelpCircle } from 'lucide-react'
import { faScaleBalanced } from '@fortawesome/pro-duotone-svg-icons'
import Hero from '@/components/Hero'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { APP_VERSION } from '@/version'

export default function TermsView() {
  return (
    <div className="space-y-6">
      <Hero
        faIcon={faScaleBalanced}
        variant="purple"
        title="Terms of Service"
        subtitle="General conditions, license terms, and safe usage guidelines for Drive Cleaner"
        actions={
          <Badge variant="outline" className="text-xs px-3 py-1 bg-purple-500/10 text-purple-300 border-purple-500/30">
            Effective Date: September 18, 2026 (v{APP_VERSION})
          </Badge>
        }
      />

      {/* Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-lg">
          <div className="p-2.5 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
            <RotateCcw className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">30-Day Recovery Guarantee</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Cleanup actions move files to Google Drive Trash rather than permanently deleting them. Items remain recoverable in your Trash for 30 days.
          </p>
        </div>

        <div className="p-5 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-lg">
          <div className="p-2.5 w-fit rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">Non-Exclusive License</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Authorized for personal, educational, non-profit, and commercial enterprise productivity and storage governance within Google Workspace.
          </p>
        </div>

        <div className="p-5 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-lg">
          <div className="p-2.5 w-fit rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">User Discretion Advised</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            While recommendations highlight redundant or stale files, you are always in complete control and must verify files before batch operations.
          </p>
        </div>
      </div>

      {/* Terms Sections */}
      <div className="space-y-4">
        {/* Section 1: Acceptance */}
        <div className="p-6 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-lg space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold font-mono">1</span>
            <h3 className="text-base font-bold text-white">Acceptance of Terms</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            By installing, accessing, or using Drive Cleaner (&quot;the Application&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, do not authorize or use the Application. If you are using the Application on behalf of an organization (such as a Google Workspace domain administrator), you represent that you have the authority to bind that organization to these Terms.
          </p>
        </div>

        {/* Section 2: Description of Service & License */}
        <div className="p-6 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-lg space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold font-mono">2</span>
            <h3 className="text-base font-bold text-white">Description of Service & License Grant</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Drive Cleaner provides automated storage analytics, file categorization, duplicate identification, and organization utilities for Google Drive. Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to use the Application for your internal personal or business storage management purposes.
          </p>
        </div>

        {/* Section 3: Safe Deletion & Trash Governance */}
        <div className="p-6 border border-amber-500/30 rounded-2xl bg-amber-950/20 backdrop-blur-sm shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h3 className="text-base font-bold text-white">Safe Deletion & Trash Governance Policy</h3>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            The safety of your files is of paramount importance. By design:
          </p>
          <ul className="text-xs text-slate-300 space-y-1.5 pl-4 list-disc">
            <li><strong className="text-white">Default to Trash:</strong> When you execute a cleanup action, files are moved to your Google Drive Trash (<code className="text-amber-300 font-mono">trash: true</code>) rather than being permanently destroyed.</li>
            <li><strong className="text-white">30-Day Grace Period:</strong> Items in Google Drive Trash remain recoverable through the native Google Drive interface for 30 days before Google automatically purges them.</li>
            <li><strong className="text-white">User Responsibility:</strong> While Drive Cleaner utilizes heuristic algorithms to detect duplicates, zero-byte stubs, and obsolete files, you bear ultimate responsibility for reviewing and confirming file selections before batch deletion or organization.</li>
          </ul>
        </div>

        {/* Section 4: Acceptable Use */}
        <div className="p-6 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-lg space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold font-mono">4</span>
            <h3 className="text-base font-bold text-white">Acceptable Use</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            You agree not to use Drive Cleaner to:
          </p>
          <ul className="text-xs text-slate-400 space-y-1 pl-4 list-disc">
            <li>Attempt to bypass, circumvent, or disable any security features or rate limits of the Google Drive API.</li>
            <li>Use the application to perform unauthorized mass modifications across Shared Drives or accounts you do not have administrative authority to manage.</li>
            <li>Reverse engineer, decompile, or disassemble the client package except to the extent permitted by applicable open-source licenses.</li>
          </ul>
        </div>

        {/* Section 5: Disclaimers & Limitation of Liability */}
        <div className="p-6 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-lg space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold font-mono">5</span>
            <h3 className="text-base font-bold text-white">Disclaimer of Warranties & Limitation of Liability</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            THE APPLICATION IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. IN NO EVENT SHALL THE DEVELOPER OR CONTRIBUTORS BE LIABLE FOR ANY CLAIM, DAMAGES, LOSS OF DATA, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM, OUT OF, OR IN CONNECTION WITH THE APPLICATION OR THE USE OR OTHER DEALINGS IN THE APPLICATION.
          </p>
        </div>

        {/* Section 6: Modifications & Termination */}
        <div className="p-6 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-lg space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold font-mono">6</span>
            <h3 className="text-base font-bold text-white">Modifications & Termination</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            We reserve the right to update these Terms from time to time to reflect functional improvements or changes in legal regulations. We will indicate the effective date at the top of this document. Continued use of the Application following any updates signifies your agreement to the modified Terms. You may terminate these Terms at any time by revoking the application&apos;s permissions in your Google Account settings.
          </p>
        </div>

        {/* Section 7: Contact & Support */}
        <div className="p-6 border border-slate-800/80 rounded-2xl bg-slate-900/60 backdrop-blur-sm shadow-lg space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold font-mono">7</span>
            <h3 className="text-base font-bold text-white">Support & Contact</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            For support requests, bug reports, or legal inquiries regarding these Terms:
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              variant="outline"
              className="h-10 rounded-xl border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-semibold"
              asChild
            >
              <a href="mailto:support@andyedwards.uk">
                <Mail className="mr-2 h-4 w-4 text-purple-400" />
                support@andyedwards.uk
              </a>
            </Button>
            <Button
              variant="outline"
              className="h-10 rounded-xl border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-semibold"
              asChild
            >
              <a href="https://github.com/andyedwardsuk/drive_cleaner" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4 text-slate-400" />
                GitHub Documentation
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
