import React from 'react'
import WaCardBase from '@awesome.me/webawesome/dist/react/card/index.js'
import { cn } from '@/lib/utils'

/**
 * Web Awesome Card Component Wrapper
 * Delivers clean glassmorphic elevations and slot architecture.
 */
export const WaCard = React.forwardRef(
  ({ className, appearance = 'outlined', orientation = 'vertical', header, footer, children, ...props }, ref) => {
    return (
      <WaCardBase
        ref={ref}
        appearance={appearance}
        orientation={orientation}
        withHeader={Boolean(header)}
        withFooter={Boolean(footer)}
        className={cn('rounded-2xl transition-all duration-200 border-slate-800/80 bg-slate-900/60 backdrop-blur-md', className)}
        {...props}
      >
        {header && <div slot="header">{header}</div>}
        {children}
        {footer && <div slot="footer">{footer}</div>}
      </WaCardBase>
    )
  }
)

WaCard.displayName = 'WaCard'
export default WaCard
