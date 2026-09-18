import React from 'react'
import WaSwitchBase from '@awesome.me/webawesome/dist/react/switch/index.js'
import { cn } from '@/lib/utils'

/**
 * Web Awesome Switch Component Wrapper
 * Provides smooth accessible toggles with zero layout shift.
 */
export const WaSwitch = React.forwardRef(
  ({ className, checked, disabled, size = 'medium', onCheckedChange, onChange, children, ...props }, ref) => {
    const handleChange = (e) => {
      const isChecked = e.target.checked
      if (onCheckedChange) {
        onCheckedChange(isChecked)
      }
      if (onChange) {
        onChange(e)
      }
    }

    return (
      <WaSwitchBase
        ref={ref}
        checked={checked}
        disabled={disabled}
        size={size}
        onChange={handleChange}
        className={cn('inline-flex items-center text-sm font-medium text-slate-200 cursor-pointer', className)}
        {...props}
      >
        {children}
      </WaSwitchBase>
    )
  }
)

WaSwitch.displayName = 'WaSwitch'
export default WaSwitch
