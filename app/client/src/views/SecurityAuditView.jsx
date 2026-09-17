import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldAlert,
  ShieldCheck,
  Globe,
  Users,
  Clock,
  Key,
  AlertTriangle,
  Lock,
  Unlock,
  Download,
  RefreshCw,
  Search,
  CheckCircle2,
  X,
  UserMinus,
  Maximize2,
  ExternalLink,
  ChevronRight,
  Shield,
  FileText,
  FileSpreadsheet,
  FileCode,
  ArrowRight,
  Eye,
  Edit3
} from 'lucide-react'
import Hero from '@/components/Hero'
import { useSecurityAudit } from '@/hooks/useSecurityAudit'
import { useFilePreview } from '@/hooks/useFilePreview'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

export default function SecurityAuditView() {
  const {
    loading,
    error,
    refresh,
    report,
    securityHealthScore,
    riskRating,
    summary,
    domainBreakdown,
    publicLinks,
    externalDomainShares,
    staleCollaborators,
    sensitiveFiles,
    allShared,
    filteredFiles,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    handleRevokePublic,
    handleRevokeAllPublic,
    handleRevokeCollaborator,
    handleRevokeDomain,
    handleDowngradeEditor,
    handleExportManifest,
    actionSuccessMessage,
    isRemediating
  } = useSecurityAudit()

  const { openPreview } = useFilePreview()
  const [selectedDomain, setSelectedDomain] = useState(null)

  const isAllSelected = filteredFiles.length > 0 && filteredFiles.every((f) => selectedIds.has(f.fileId))

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      clearSelection()
    } else {
      selectAll(filteredFiles.map((f) => f.fileId))
    }
  }

  // Color mapping for security score
  const getScoreColors = (score) => {
    if (score >= 85) return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' }
    if (score >= 60) return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' }
    return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' }
  }

  const scoreColors = getScoreColors(securityHealthScore)

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Header */}
      <Hero
        title="Sharing Permissions & Security Audit Hub"
        subtitle="Audit external collaborator exposure, discover unrestricted public links, and remediate permissions in 1 click."
        icon={ShieldAlert}
      >
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <Button
            variant="outline"
            onClick={refresh}
            disabled={loading || isRemediating}
            className="h-11 px-4 rounded-xl border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white"
          >
            <RefreshCw className={cn('w-4 h-4 mr-2', (loading || isRemediating) && 'animate-spin')} />
            Run Security Audit
          </Button>

          <Button
            variant="outline"
            onClick={handleExportManifest}
            disabled={loading || allShared.length === 0}
            className="h-11 px-4 rounded-xl border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Security Manifest (CSV)
          </Button>
        </div>
      </Hero>

      {/* Action Toast Feedback */}
      <AnimatePresence>
        {actionSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 backdrop-blur-md"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="text-sm font-medium">{actionSuccessMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Security Health Score Banner & KPI Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Security Health Meter Gauge */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Security Health Score</span>
            <div className={cn('p-2 rounded-lg', scoreColors.bg, scoreColors.text)}>
              <Shield className="w-5 h-5" />
            </div>
          </div>

          <div className="my-5 flex items-baseline gap-3">
            <span className={cn('text-5xl font-black tracking-tight', scoreColors.text)}>
              {securityHealthScore}
            </span>
            <span className="text-slate-400 text-sm font-medium">/ 100</span>
            <Badge
              variant="outline"
              className={cn('ml-auto text-xs font-bold px-2.5 py-0.5', scoreColors.border, scoreColors.text)}
            >
              {riskRating}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-950/80 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className={cn(
                'h-2.5 rounded-full transition-all duration-500',
                securityHealthScore >= 85 ? 'bg-emerald-500' : securityHealthScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
              )}
              style={{ width: `${securityHealthScore}%` }}
            />
          </div>

          <p className="text-xs text-slate-400 mt-4 leading-relaxed">
            {securityHealthScore < 60
              ? 'Critical security vulnerabilities detected. Revoke public links and external permissions immediately.'
              : securityHealthScore < 85
              ? 'Moderate exposure risk. Several files are accessible by external domains or dormant accounts.'
              : 'Hardened posture. No critical public links or exposed sensitive files detected.'}
          </p>
        </div>

        {/* 4 KPI Metrics */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Public Links */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Public Web Links</span>
              <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                <Globe className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-red-400 tracking-tight">
                {summary.publicLinkCount || 0} Files
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Anyone with link can access without login
              </div>
            </div>
          </div>

          {/* External Domain Collaborators */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">External Domains</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-amber-300 tracking-tight">
                {summary.externalDomainCount || 0} Domains
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {summary.externalFilesCount || 0} files shared with outside organizations
              </div>
            </div>
          </div>

          {/* Stale Shares */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Dormant Permissions</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-blue-300 tracking-tight">
                {summary.staleShareCount || 0} Files
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Shares untouched for over 180 days
              </div>
            </div>
          </div>

          {/* Sensitive Flagged Files */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Sensitive Documents</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <Key className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-purple-300 tracking-tight">
                {summary.sensitiveFileCount || 0} Flagged
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Credentials, NDAs, or financials exposed
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Tabs & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Risk Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('public_links')}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2',
              activeTab === 'public_links'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                : 'bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            )}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Public Links</span>
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-slate-950/70 text-slate-300">
              {publicLinks.length}
            </Badge>
          </button>

          <button
            onClick={() => setActiveTab('external_domains')}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2',
              activeTab === 'external_domains'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                : 'bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            )}
          >
            <Users className="w-3.5 h-3.5" />
            <span>External Domains</span>
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-slate-950/70 text-slate-300">
              {externalDomainShares.length}
            </Badge>
          </button>

          <button
            onClick={() => setActiveTab('stale_shares')}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2',
              activeTab === 'stale_shares'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            )}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Dormant Access</span>
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-slate-950/70 text-slate-300">
              {staleCollaborators.length}
            </Badge>
          </button>

          <button
            onClick={() => setActiveTab('sensitive_files')}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2',
              activeTab === 'sensitive_files'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            )}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Sensitive Files</span>
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-slate-950/70 text-slate-300">
              {sensitiveFiles.length}
            </Badge>
          </button>

          <button
            onClick={() => setActiveTab('all_shared')}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2',
              activeTab === 'all_shared'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            )}
          >
            <span>All Shared</span>
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-slate-950/70 text-slate-300">
              {allShared.length}
            </Badge>
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search files, domains, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-11 rounded-xl bg-slate-950/70 border-slate-800 text-white placeholder:text-slate-500 text-sm focus-visible:ring-primary/40"
          />
        </div>
      </div>

      {/* External Domain Cluster View (When External Domains tab is active) */}
      {activeTab === 'external_domains' && domainBreakdown.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>External Domains Breakdown</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Select an external domain to inspect all shared assets or revoke access domain-wide.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {domainBreakdown.map((item) => (
              <div
                key={item.domain}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-amber-300">@{item.domain}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{item.count} files shared</div>
                </div>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRevokeDomain(item.domain, item.fileIds)}
                  disabled={isRemediating}
                  className="h-8 rounded-lg text-[11px] bg-red-600/80 hover:bg-red-600 px-3"
                >
                  <UserMinus className="w-3 h-3 mr-1" />
                  Revoke Domain
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Public Link Banner Remediation Toolbar (When Public Links tab is active) */}
      {activeTab === 'public_links' && publicLinks.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-red-200">Unrestricted Public Access Detected</h3>
              <p className="text-xs text-red-300/80">
                {publicLinks.length} files are exposed to anyone on the internet with the link.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={handleRevokeAllPublic}
            disabled={isRemediating}
            className="bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-lg shadow-red-600/20"
          >
            <Lock className="w-3.5 h-3.5 mr-1.5" />
            Revoke All Public Links ({publicLinks.length})
          </Button>
        </div>
      )}

      {/* Table Section */}
      <div className="space-y-4">
        {/* Table Header Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <span>Audited Files</span>
              <Badge variant="outline" className="text-xs border-slate-800 text-slate-400">
                {filteredFiles.length}
              </Badge>
            </h3>
            <button
              onClick={handleToggleSelectAll}
              className="text-xs text-primary hover:underline font-medium"
            >
              {isAllSelected ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>

        {/* Audit Table */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800/80 bg-slate-950/80 text-slate-400 font-medium">
                <tr>
                  <th className="p-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleToggleSelectAll}
                      className="rounded border-slate-700 bg-slate-900 text-primary focus:ring-primary/40"
                    />
                  </th>
                  <th className="p-3.5">File & Severity</th>
                  <th className="p-3.5">Exposure Type</th>
                  <th className="p-3.5">Collaborators & Access</th>
                  <th className="p-3.5">Inactivity</th>
                  <th className="p-3.5 text-right">Remediation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredFiles.map((file) => {
                  const isSelected = selectedIds.has(file.fileId)
                  return (
                    <tr
                      key={file.fileId}
                      className={cn(
                        'transition-colors hover:bg-slate-800/40 cursor-pointer',
                        isSelected && 'bg-primary/10'
                      )}
                      onClick={() => toggleSelect(file.fileId)}
                    >
                      <td className="p-3.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(file.fileId)}
                          className="rounded border-gray-600 bg-slate-800 text-primary focus:ring-primary/40"
                        />
                      </td>

                      {/* File Name & Severity */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'p-2 rounded-lg flex-shrink-0',
                              file.riskSeverity === 'critical'
                                ? 'bg-red-500/10 text-red-400'
                                : file.riskSeverity === 'high'
                                ? 'bg-purple-500/10 text-purple-400'
                                : file.riskSeverity === 'medium'
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'bg-slate-800 text-gray-400'
                            )}
                          >
                            {file.riskSeverity === 'critical' ? (
                              <Globe className="w-4 h-4" />
                            ) : file.isSensitive ? (
                              <Key className="w-4 h-4" />
                            ) : (
                              <Users className="w-4 h-4" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white truncate max-w-xs sm:max-w-md">
                                {file.fileName}
                              </span>
                              {file.isSensitive && (
                                <Badge className="bg-purple-600/80 text-white text-[10px] px-1.5 py-0">
                                  {file.sensitiveKeyword}
                                </Badge>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-400 mt-0.5">
                              {formatBytes(file.sizeBytes)} • Owner: {file.ownerNames}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Exposure Type */}
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          {file.isPublic && (
                            <Badge className="bg-red-600/90 text-white text-[10px] font-semibold">
                              Public Link
                            </Badge>
                          )}
                          {file.externalDomains &&
                            file.externalDomains.map((dom) => (
                              <Badge
                                key={dom}
                                variant="outline"
                                className="text-[10px] border-amber-500/40 text-amber-300"
                              >
                                @{dom}
                              </Badge>
                            ))}
                          {!file.isPublic && (!file.externalDomains || file.externalDomains.length === 0) && (
                            <Badge variant="outline" className="text-[10px] border-slate-800 text-slate-400">
                              Internal Domain
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Collaborators & Access List */}
                      <td className="p-3.5">
                        <div className="space-y-1 max-w-sm">
                          {(file.collaborators || []).map((collab) => (
                            <div
                              key={collab.permissionId || collab.email}
                              className="flex items-center justify-between text-[11px] bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="text-slate-300 truncate mr-2" title={collab.email || collab.name}>
                                {collab.email || collab.name}
                              </span>

                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <Badge
                                  className={cn(
                                    'text-[9px] px-1 py-0 uppercase',
                                    collab.role === 'writer'
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                      : 'bg-slate-800 text-slate-300'
                                  )}
                                >
                                  {collab.role === 'writer' ? 'Editor' : 'Viewer'}
                                </Badge>

                                {collab.role === 'writer' && (
                                  <button
                                    onClick={() => handleDowngradeEditor(file.fileId, collab.permissionId, collab.email)}
                                    title="Downgrade to Viewer"
                                    className="p-0.5 hover:text-white text-gray-400 transition-colors"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                )}

                                <button
                                  onClick={() => handleRevokeCollaborator(file.fileId, collab.permissionId, collab.email)}
                                  title="Revoke collaborator access"
                                  className="p-0.5 hover:text-red-400 text-gray-400 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Inactivity */}
                      <td className="p-3.5 text-gray-400">
                        {file.daysSinceModified ? (
                          <span className={file.isStaleShare ? 'text-amber-400 font-medium' : ''}>
                            {file.daysSinceModified} days ago
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Remediation Actions */}
                      <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {file.isPublic && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRevokePublic(file.fileId)}
                              disabled={isRemediating}
                              className="h-7 px-2 text-[11px] bg-red-600/90 hover:bg-red-600"
                            >
                              <Lock className="w-3 h-3 mr-1" />
                              Revoke Public
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openPreview(file, allShared)}
                            className="h-7 px-2 text-[11px] text-gray-300 hover:text-white"
                            title="Preview file"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
