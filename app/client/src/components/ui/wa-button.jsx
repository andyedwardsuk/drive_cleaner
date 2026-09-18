import React from 'react'
import WaButtonBase from '@awesome.me/webawesome/dist/react/button/index.js'
import { cn } from '@/lib/utils'

/**
 * Web Awesome Button Component Wrapper
 * Provides variants, appearance modes, loading spinners, and start/end icon slots.
 */
export const WaButton = React.forwardRef(
  (
    {
      className,
      variant = 'neutral',
      appearance = 'filled',
      size = 'medium',
      loading = false,
      disabled = false,
      pill = false,
      startIcon,
      endIcon,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <WaButtonBase
        ref={ref}
        variant={variant}
        appearance={appearance}
        size={size}
        loading={loading}
        disabled={disabled}
        pill={pill}
        withStart={Boolean(startIcon)}
        withEnd={Boolean(endIcon)}
        className={cn('inline-flex items-center font-medium', className)}
        {...props}
      >
        {startIcon && <span slot="start" className="inline-flex items-center mr-1.5">{startIcon}</span>}
        {children}
        {endIcon && <span slot="end" className="inline-flex items-center ml-1.5">{endIcon}</span>}
      </WaButtonBase>
    )
  }
)

WaButton.displayName = 'WaButton'
export default WaButton
