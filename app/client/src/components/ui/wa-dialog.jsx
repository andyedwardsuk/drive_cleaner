import React from 'react'
import WaDialogBase from '@awesome.me/webawesome/dist/react/dialog/index.js'
import { cn } from '@/lib/utils'

/**
 * Web Awesome Dialog Component Wrapper
 * Accessible, animated dialog modal with light dismiss and keyboard escape handling.
 */
export const WaDialog = React.forwardRef(
  ({ className, open, label = '', lightDismiss = true, onClose, footer, children, ...props }, ref) => {
    return (
      <WaDialogBase
        ref={ref}
        open={open}
        label={label}
        lightDismiss={lightDismiss}
        onWaHide={onClose}
        withFooter={Boolean(footer)}
        className={cn('backdrop-blur-md', className)}
        {...props}
      >
        {children}
        {footer && <div slot="footer">{footer}</div>}
      </WaDialogBase>
    )
  }
)

WaDialog.displayName = 'WaDialog'
export default WaDialog
