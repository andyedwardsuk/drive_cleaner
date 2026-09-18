import React from 'react'
import WaSkeletonBase from '@awesome.me/webawesome/dist/react/skeleton/index.js'
import { cn } from '@/lib/utils'

/**
 * Web Awesome Skeleton Component Wrapper
 * Delivers sleek, shimmering placeholders with zero Cumulative Layout Shift (CLS).
 *
 * @param {'sheen' | 'pulse' | 'none'} effect - Animation effect (default: 'sheen')
 * @param {string} className - Additional classes (e.g. h-4 w-32 rounded-lg)
 */
export const WaSkeleton = React.forwardRef(
  ({ className, effect = 'sheen', ...props }, ref) => {
    return (
      <WaSkeletonBase
        ref={ref}
        effect={effect}
        className={cn(
          'inline-flex overflow-hidden rounded-md [--color:rgba(30,41,59,0.8)] [--sheen-color:rgba(51,65,85,0.9)]',
          className
        )}
        {...props}
      />
    )
  }
)

WaSkeleton.displayName = 'WaSkeleton'
export default WaSkeleton
