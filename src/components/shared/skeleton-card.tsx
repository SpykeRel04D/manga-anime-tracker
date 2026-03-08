import type { ReactElement } from 'react'

import { Skeleton } from '@/components/ui/skeleton'

export function SkeletonCard(): ReactElement {
  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
      <Skeleton className="aspect-[3/4] w-full rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}
