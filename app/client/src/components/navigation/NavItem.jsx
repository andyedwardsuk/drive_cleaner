import { Link, useRouterState } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/**
 * NavItem - Individual navigation item component
 * @param {Object} props
 * @param {React.Component} props.icon - Lucide icon component
 * @param {string} props.label - Display label
 * @param {string} props.path - Route path
 * @param {boolean} props.disabled - Whether the item is disabled
 * @param {string} props.badge - Badge text (e.g., "Coming Soon")
 * @param {boolean} props.collapsed - Whether sidebar is collapsed
 */
export default function NavItem({ icon: Icon, label, path, disabled = false, badge = null, collapsed = false }) {
  const router = useRouterState()
  const isActive = router.location.pathname === path

  const itemContent = (
    <motion.div
      whileHover={!disabled ? { x: 4 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
        'group relative',
        isActive && !disabled && 'bg-blue-500/20 text-blue-300 shadow-lg shadow-blue-500/10',
        !isActive && !disabled && 'hover:bg-glass-surface text-gray-300 hover:text-white',
        disabled && 'text-gray-500 cursor-not-allowed opacity-60',
        collapsed && 'justify-center px-3'
      )}
    >
      {/* Active indicator */}
      {isActive && !disabled && (
        <motion.div
          layoutId="activeNav"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-400 rounded-r-full"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}

      {/* Icon */}
      <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-blue-400')} />

      {/* Label and Badge */}
      {!collapsed && (
        <div className="flex items-center justify-between flex-1 min-w-0">
          <span className="font-medium truncate">{label}</span>
          {badge && (
            <Badge
              variant="secondary"
              className="ml-2 text-xs bg-blue-500/20 text-blue-300 border-blue-500/30"
            >
              {badge}
            </Badge>
          )}
        </div>
      )}

      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
          {label}
          {badge && <span className="ml-2 text-blue-300">({badge})</span>}
        </div>
      )}
    </motion.div>
  )

  if (disabled) {
    return <div className="cursor-not-allowed">{itemContent}</div>
  }

  return (
    <Link to={path} className="block">
      {itemContent}
    </Link>
  )
}
