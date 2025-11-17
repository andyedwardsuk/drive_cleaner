import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * SidebarSection - Groups navigation items under a section heading
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {React.ReactNode} props.children - Navigation items
 * @param {boolean} props.collapsed - Whether sidebar is collapsed
 */
export default function SidebarSection({ title, children, collapsed = false }) {
  return (
    <div className="mb-6">
      {/* Section Title */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500"
        >
          {title}
        </motion.div>
      )}

      {/* Section Items */}
      <div className={cn('space-y-1', collapsed && 'mt-2')}>{children}</div>

      {/* Divider */}
      {collapsed && <div className="h-px bg-gray-700 my-4 mx-4" />}
    </div>
  )
}
