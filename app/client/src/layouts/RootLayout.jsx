import { Outlet } from '@tanstack/react-router'
import Sidebar from '@/components/navigation/Sidebar'
import FilePreviewModal from '@/components/preview/FilePreviewModal'

/**
 * RootLayout - Main layout with sidebar navigation
 */
export default function RootLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-app-bg-start via-app-bg-mid to-app-bg-end">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-7xl p-8">
          <Outlet />
        </div>
      </main>

      {/* Global File Preview & Details Modal */}
      <FilePreviewModal />
    </div>
  )
}
