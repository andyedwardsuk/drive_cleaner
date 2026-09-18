import { cn } from '@/lib/utils'
import IconBadge from '@/components/common/IconBadge'

/**
 * Hero - Reusable hero section with glassmorphism and specular vector badges
 * @param {Object} props
 * @param {React.Component|Object} props.icon - Lucide or FontAwesome icon
 * @param {Object} props.faIcon - FontAwesome Pro icon object
 * @param {string} props.variant - Color variant for the badge (primary, emerald, amber, rose, purple, cyan)
 * @param {string} props.title - Hero title
 * @param {string} props.subtitle - Hero subtitle/description
 * @param {React.ReactNode} props.actions - Optional action buttons
 * @param {string} props.badge - Optional badge text (e.g., "Coming Soon")
 * @param {string|React.ReactNode} props.illustration - Optional vector illustration/icon
 */
export default function Hero({
  icon: Icon,
  faIcon,
  variant = 'primary',
  title,
  subtitle,
  actions,
  children,
  badge,
  illustration,
  className,
}) {
  const activeIcon = faIcon || Icon || (typeof illustration === 'object' ? illustration : null)

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 md:p-8',
        'bg-gradient-to-b from-slate-900/85 via-slate-900/60 to-slate-950/70',
        'border border-slate-800/80 border-t-white/10',
        'backdrop-blur-xl shadow-xl shadow-black/20',
        className
      )}
    >
      {/* Subtle ambient accent aura */}
      <div className="absolute -top-16 -right-16 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5 min-w-0">
          {/* Icon/Illustration Emblem */}
          <div className="flex-shrink-0">
            {activeIcon ? (
              <IconBadge icon={activeIcon} variant={variant} size="xl" />
            ) : typeof illustration === 'string' ? (
              <div className="text-4xl md:text-5xl select-none">{illustration}</div>
            ) : null}
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{title}</h1>
              {badge && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-sm md:text-base text-slate-300 max-w-2xl leading-relaxed">{subtitle}</p>
          </div>
        </div>

        {/* Actions on same line (desktop) */}
        {(actions || children) && (
          <div className="flex-shrink-0 flex flex-wrap items-center gap-3">
            {actions}
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
