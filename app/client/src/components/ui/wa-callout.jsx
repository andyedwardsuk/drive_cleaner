import React from 'react'
import WaCalloutBase from '@awesome.me/webawesome/dist/react/callout/index.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleInfo,
  faTriangleExclamation,
  faCircleCheck,
  faShieldExclamation,
  faSparkles
} from '@fortawesome/pro-duotone-svg-icons'
import { cn } from '@/lib/utils'

const defaultIcons = {
  brand: faCircleInfo,
  neutral: faCircleInfo,
  warning: faTriangleExclamation,
  danger: faShieldExclamation,
  success: faCircleCheck,
}

/**
 * Web Awesome Callout Wrapper
 * Features high-contrast atmospheric borders and Font Awesome Pro duotone icons.
 */
export const WaCallout = React.forwardRef(
  (
    {
      className,
      variant = 'brand',
      appearance = 'outlined',
      size = 'medium',
      faIcon,
      title,
      children,
      ...props
    },
    ref
  ) => {
    const iconToUse = faIcon || defaultIcons[variant] || faSparkles

    return (
      <WaCalloutBase
        ref={ref}
        variant={variant}
        appearance={appearance}
        size={size}
        className={cn('rounded-xl backdrop-blur-sm', className)}
        {...props}
      >
        <span slot="icon" className="inline-flex items-center justify-center">
          <FontAwesomeIcon icon={iconToUse} className="w-5 h-5 text-inherit" />
        </span>
        {title && <div className="font-semibold text-sm mb-1">{title}</div>}
        <div className="text-sm opacity-90 leading-relaxed">{children}</div>
      </WaCalloutBase>
    )
  }
)

WaCallout.displayName = 'WaCallout'
export default WaCallout
