import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Hero - Reusable hero section with glassmorphism
 * @param {Object} props
 * @param {React.Component} props.icon - Lucide icon component
 * @param {string} props.title - Hero title
 * @param {string} props.subtitle - Hero subtitle/description
 * @param {React.ReactNode} props.actions - Optional action buttons
 * @param {string} props.badge - Optional badge text (e.g., "Coming Soon")
 * @param {string} props.illustration - Optional illustration/emoji
 */
export default function Hero({
  icon: Icon,
  title,
  subtitle,
  actions,
  children,
  badge,
  illustration,
  className,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 md:p-8 mb-6',
        'bg-gradient-to-b from-slate-900/85 via-slate-900/60 to-slate-950/70',
        'border border-slate-800/80 border-t-white/10',
        'backdrop-blur-xl shadow-xl shadow-black/20',
        className
      )}
    >
      {/* Subtle ambient accent aura */}
      <div className="absolute -top-16 -right-16 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
        {/* Icon/Illustration */}
        <div className="flex-shrink-0">
          {illustration ? (
            <div className="text-5xl md:text-6xl">{illustration}</div>
          ) : Icon ? (
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/20">
              <Icon className="h-7 w-7 md:h-8 md:w-8 text-white" />
            </div>
          ) : null}
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1.5">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{title}</h1>
            {badge && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl leading-relaxed">{subtitle}</p>

          {/* Actions & Children */}
          {(actions || children) && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {actions}
              {children}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
