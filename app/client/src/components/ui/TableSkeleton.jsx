import React from 'react'
import { WaSkeleton } from './wa-skeleton'
import { TableRow, TableCell } from '@/components/ui/table'
import { cn } from '@/lib/utils'

/**
 * Reusable Table Skeleton Rows
 * Renders realistic shimmering placeholders inside any TableBody,
 * preventing Cumulative Layout Shift (CLS) while data fetches.
 */
export function TableSkeleton({ rows = 5, columnWidths = ['w-6', 'w-6', 'w-48', 'w-20', 'w-24', 'w-28', 'w-24', 'w-20', 'w-8'] }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow
          key={`skeleton-row-${rowIndex}`}
          className="border-b border-slate-800/70 hover:bg-transparent h-14"
        >
          {columnWidths.map((width, colIndex) => (
            <TableCell key={`skeleton-cell-${rowIndex}-${colIndex}`} className="py-3 px-4">
              <WaSkeleton
                effect="sheen"
                className={cn('h-4 rounded-md', width)}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

export default TableSkeleton
