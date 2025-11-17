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
  badge,
  illustration,
  className,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-8 mb-8',
        'bg-gradient-to-br from-blue-900/40 via-indigo-900/40 to-purple-900/40',
        'border border-glass-border',
        'backdrop-blur-xl',
        className
      )}
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-glass-surface backdrop-blur-sm" />

      {/* Gradient orbs for depth */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 flex items-center gap-8">
        {/* Icon/Illustration */}
        <div className="flex-shrink-0">
          {illustration ? (
            <div className="text-7xl">{illustration}</div>
          ) : Icon ? (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
              <Icon className="h-10 w-10 text-white" />
            </div>
          ) : null}
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-white">{title}</h1>
            {badge && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {badge}
              </span>
            )}
          </div>
          <p className="text-lg text-gray-300 max-w-2xl">{subtitle}</p>

          {/* Actions */}
          {actions && <div className="mt-6 flex items-center gap-4">{actions}</div>}
        </div>
      </div>

      {/* Animated sparkles */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute bottom-8 right-16 w-1.5 h-1.5 bg-indigo-400 rounded-full"
      />
    </motion.div>
  )
}
