import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * SidebarSection - Groups navigation items under a collapsible section heading
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {number} [props.count] - Optional item count badge
 * @param {boolean} [props.collapsible=true] - Whether section can be collapsed
 * @param {boolean} [props.isOpen=true] - Expanded state
 * @param {Function} [props.onToggle] - Callback when toggling section
 * @param {boolean} [props.hasActiveItem=false] - Whether an active route is inside
 * @param {boolean} [props.collapsed=false] - Whether sidebar itself is mini (5rem)
 * @param {React.ReactNode} props.children - Navigation items
 */
export default function SidebarSection({
  title,
  count,
  collapsible = true,
  isOpen = true,
  onToggle,
  hasActiveItem = false,
  collapsed = false,
  children,
}) {
  if (collapsed) {
    return (
      <div className="mb-2">
        <div className="space-y-1">{children}</div>
        <div className="h-px bg-slate-800/80 my-2 mx-2" />
      </div>
    )
  }

  return (
    <div className="mb-2">
      {/* Section Header */}
      {collapsible ? (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          className={cn(
            'w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors select-none group',
            hasActiveItem && !isOpen
              ? 'text-blue-300 bg-blue-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          )}
        >
          <span className="flex items-center gap-1.5">
            <span>{title}</span>
            {count !== undefined && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-normal bg-slate-800/90 text-slate-400 group-hover:text-slate-300">
                {count}
              </span>
            )}
            {hasActiveItem && !isOpen && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            )}
          </span>
          <ChevronDown
            className={cn(
              'w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform duration-200 ease-in-out',
              isOpen && 'rotate-180 text-slate-300'
            )}
          />
        </button>
      ) : (
        <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>{title}</span>
          {count !== undefined && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-normal bg-slate-800/90 text-slate-400">
              {count}
            </span>
          )}
        </div>
      )}

      {/* Accordion Content */}
      <AnimatePresence initial={false}>
        {(isOpen || !collapsible) && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden space-y-0.5 mt-1"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

