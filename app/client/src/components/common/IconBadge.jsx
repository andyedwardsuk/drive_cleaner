import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { cn } from '@/lib/utils'

const VARIANT_STYLES = {
  primary: {
    badge: 'bg-gradient-to-br from-blue-600/90 to-indigo-700/90 text-white shadow-blue-500/25 border-blue-400/30',
    glow: 'bg-blue-500/15',
    duotonePrimary: '#ffffff',
    duotoneSecondary: '#93c5fd'
  },
  emerald: {
    badge: 'bg-gradient-to-br from-emerald-600/90 to-teal-700/90 text-white shadow-emerald-500/25 border-emerald-400/30',
    glow: 'bg-emerald-500/15',
    duotonePrimary: '#ffffff',
    duotoneSecondary: '#a7f3d0'
  },
  amber: {
    badge: 'bg-gradient-to-br from-amber-600/90 to-orange-700/90 text-white shadow-amber-500/25 border-amber-400/30',
    glow: 'bg-amber-500/15',
    duotonePrimary: '#ffffff',
    duotoneSecondary: '#fde68a'
  },
  rose: {
    badge: 'bg-gradient-to-br from-rose-600/90 to-red-700/90 text-white shadow-rose-500/25 border-rose-400/30',
    glow: 'bg-rose-500/15',
    duotonePrimary: '#ffffff',
    duotoneSecondary: '#fecdd3'
  },
  purple: {
    badge: 'bg-gradient-to-br from-purple-600/90 to-indigo-700/90 text-white shadow-purple-500/25 border-purple-400/30',
    glow: 'bg-purple-500/15',
    duotonePrimary: '#ffffff',
    duotoneSecondary: '#e9d5ff'
  },
  cyan: {
    badge: 'bg-gradient-to-br from-cyan-600/90 to-blue-700/90 text-white shadow-cyan-500/25 border-cyan-400/30',
    glow: 'bg-cyan-500/15',
    duotonePrimary: '#ffffff',
    duotoneSecondary: '#bae6fd'
  },
  slate: {
    badge: 'bg-gradient-to-br from-slate-700/90 to-slate-800/90 text-slate-200 shadow-black/30 border-slate-600/40',
    glow: 'bg-slate-500/10',
    duotonePrimary: '#f8fafc',
    duotoneSecondary: '#94a3b8'
  }
}

const SIZE_STYLES = {
  sm: {
    container: 'w-8 h-8 rounded-xl',
    icon: 'text-sm w-4 h-4'
  },
  md: {
    container: 'w-11 h-11 rounded-xl',
    icon: 'text-lg w-5 h-5'
  },
  lg: {
    container: 'w-14 h-14 rounded-2xl',
    icon: 'text-2xl w-7 h-7'
  },
  xl: {
    container: 'w-16 h-16 md:w-18 md:h-18 rounded-2xl',
    icon: 'text-3xl w-8 h-8 md:w-9 md:h-9'
  }
}

/**
 * IconBadge - Specular 2026 glass icon emblem for Font Awesome Pro & Lucide vectors
 * Replaces amateur emojis with precision dual-tone vectors
 */
export default function IconBadge({
  icon: Icon,
  variant = 'primary',
  size = 'lg',
  className,
  glow = true
}) {
  const vStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.primary
  const sStyle = SIZE_STYLES[size] || SIZE_STYLES.lg

  if (!Icon) return null

  // Check if it is a FontAwesome icon object (has prefix and iconName)
  const isFontAwesome = typeof Icon === 'object' && Icon.prefix && Icon.iconName

  return (
    <div className="relative inline-flex items-center justify-center flex-shrink-0">
      {/* Specular ambient background glow aura */}
      {glow && (
        <div
          className={cn(
            'absolute inset-0 rounded-full blur-xl pointer-events-none opacity-60',
            vStyle.glow
          )}
        />
      )}

      {/* Main glass badge */}
      <div
        className={cn(
          'relative z-10 flex items-center justify-center shadow-lg border backdrop-blur-md transition-all duration-300',
          'box-border',
          vStyle.badge,
          sStyle.container,
          className
        )}
        style={{
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 8px 24px -4px rgba(0, 0, 0, 0.3)'
        }}
      >
        {isFontAwesome ? (
          <FontAwesomeIcon
            icon={Icon}
            className={sStyle.icon}
            style={{
              '--fa-primary-color': vStyle.duotonePrimary,
              '--fa-secondary-color': vStyle.duotoneSecondary,
              '--fa-secondary-opacity': '0.6'
            }}
          />
        ) : React.isValidElement(Icon) ? (
          Icon
        ) : (typeof Icon === 'function' || (typeof Icon === 'object' && Icon?.$$typeof)) ? (
          <Icon className={sStyle.icon} />
        ) : null}
      </div>
    </div>
  )
}
