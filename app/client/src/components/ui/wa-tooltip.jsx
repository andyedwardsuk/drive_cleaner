import React from 'react'
import WaTooltipBase from '@awesome.me/webawesome/dist/react/tooltip/index.js'
import { cn } from '@/lib/utils'

/**
 * Web Awesome Tooltip Component Wrapper
 */
export const WaTooltip = React.forwardRef(
  ({ className, content, placement = 'top', distance = 8, disabled = false, children, ...props }, ref) => {
    return (
      <WaTooltipBase
        ref={ref}
        placement={placement}
        distance={distance}
        disabled={disabled}
        className={cn('inline-block', className)}
        {...props}
      >
        <span slot="content">{content}</span>
        {children}
      </WaTooltipBase>
    )
  }
)

WaTooltip.displayName = 'WaTooltip'
export default WaTooltip
