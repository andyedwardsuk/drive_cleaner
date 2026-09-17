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
      whileHover={!disabled ? { x: 3 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-150',
        'group relative text-sm',
        isActive && !disabled && 'bg-blue-500/15 text-blue-300 font-semibold shadow-sm',
        !isActive && !disabled && 'hover:bg-slate-800/60 text-slate-300 hover:text-white',
        disabled && 'text-slate-600 cursor-not-allowed opacity-50',
        collapsed && 'justify-center px-2 py-2.5'
      )}
    >
      {/* Active indicator */}
      {isActive && !disabled && (
        <motion.div
          layoutId="activeNav"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-400 rounded-r-full"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}

      {/* Icon */}
      <Icon className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200')} />

      {/* Label and Badge */}
      {!collapsed && (
        <div className="flex items-center justify-between flex-1 min-w-0">
          <span className="font-medium text-xs md:text-sm truncate">{label}</span>
          {badge && (
            <Badge
              variant="secondary"
              className="ml-2 text-[10px] px-1.5 py-0 bg-blue-500/20 text-blue-300 border-blue-500/30"
            >
              {badge}
            </Badge>
          )}
        </div>
      )}

      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-3 py-1.5 bg-slate-900 border border-slate-800 text-white text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
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
