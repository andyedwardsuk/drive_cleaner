import React from 'react'
import WaBadgeBase from '@awesome.me/webawesome/dist/react/badge/index.js'
import { cn } from '@/lib/utils'

/**
 * Web Awesome Badge Component Wrapper
 */
export const WaBadge = React.forwardRef(
  (
    {
      className,
      variant = 'brand',
      appearance = 'filled',
      pill = false,
      attention = 'none',
      startIcon,
      endIcon,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <WaBadgeBase
        ref={ref}
        variant={variant}
        appearance={appearance}
        pill={pill}
        attention={attention}
        className={cn('inline-flex items-center text-xs font-semibold', className)}
        {...props}
      >
        {startIcon && <span slot="start" className="inline-flex items-center mr-1">{startIcon}</span>}
        {children}
        {endIcon && <span slot="end" className="inline-flex items-center ml-1">{endIcon}</span>}
      </WaBadgeBase>
    )
  }
)

WaBadge.displayName = 'WaBadge'
export default WaBadge
