import { useState, useEffect } from 'react'
import { Outlet } from '@tanstack/react-router'
import Sidebar from '@/components/navigation/Sidebar'
import TopHeader from '@/components/navigation/TopHeader'
import CommandPalette from '@/components/navigation/CommandPalette'
import FilePreviewModal from '@/components/preview/FilePreviewModal'
import SafetyVaultBanner from '@/components/actions/SafetyVaultBanner'
import UpgradeModal from '@/components/licensing/UpgradeModal'

/**
 * RootLayout - 2026 Spatial Glassmorphism Layout
 * Features atmospheric living ambient glow, TopHeader, and global ⌘K Command Palette
 */
export default function RootLayout() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)

  // Global ⌘K / Ctrl+K keyboard shortcut listener & Upgrade Modal listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandPaletteOpen((prev) => !prev)
      }
    }

    const handleOpenUpgrade = () => setUpgradeModalOpen(true)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('drive_cleaner_open_upgrade_modal', handleOpenUpgrade)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('drive_cleaner_open_upgrade_modal', handleOpenUpgrade)
    }
  }, [])

  return (
    <div className="relative flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      {/* 2026 ATMOSPHERIC LIVING MESH BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Deep Slate Ambient Base */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#060913] via-[#091124] to-[#0c1630]" />

        {/* Floating Living Mesh Orbs */}
        <div className="absolute -top-48 -right-48 w-[650px] h-[650px] bg-blue-600/10 rounded-full blur-[140px] animate-atmospheric pointer-events-none" />
        <div className="absolute -bottom-48 -left-48 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[130px] animate-atmospheric pointer-events-none [animation-delay:4s]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[160px] pointer-events-none" />
      </div>

      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Primary Workspace Column */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Workspace Header Bar */}
        <TopHeader
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenUpgrade={() => setUpgradeModalOpen(true)}
        />

        {/* Persistent Safety Vault Multi-Session Undo Banner */}
        <SafetyVaultBanner />

        {/* Viewport Canvas */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="container mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Raycast / Linear Command Palette (⌘K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Global File Preview & Details Modal */}
      <FilePreviewModal />

      {/* Global Pro Upgrade & Licensing Modal */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
      />
    </div>
  )
}
