import React from 'react'
import WaProgressBarBase from '@awesome.me/webawesome/dist/react/progress-bar/index.js'
import WaProgressRingBase from '@awesome.me/webawesome/dist/react/progress-ring/index.js'
import { cn } from '@/lib/utils'

export const WaProgressBar = React.forwardRef(
  ({ className, value = 0, indeterminate = false, label = '', children, ...props }, ref) => {
    return (
      <WaProgressBarBase
        ref={ref}
        value={value}
        indeterminate={indeterminate}
        label={label}
        className={cn('w-full rounded-full overflow-hidden', className)}
        {...props}
      >
        {children}
      </WaProgressBarBase>
    )
  }
)
WaProgressBar.displayName = 'WaProgressBar'

export const WaProgressRing = React.forwardRef(
  ({ className, value = 0, label = '', children, ...props }, ref) => {
    return (
      <WaProgressRingBase
        ref={ref}
        value={value}
        label={label}
        className={cn('inline-flex items-center justify-center font-semibold', className)}
        {...props}
      >
        {children}
      </WaProgressRingBase>
    )
  }
)
WaProgressRing.displayName = 'WaProgressRing'

export default WaProgressBar
