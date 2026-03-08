import type { ReactElement } from 'react'

import { Skeleton } from '@/components/ui/skeleton'

function SkeletonRow(): ReactElement {
  return (
    <div className="border-border bg-card flex gap-4 overflow-hidden rounded-xl border p-3">
      <Skeleton className="h-[107px] w-[80px] shrink-0 rounded-md" />
      <div className="flex min-w-0 flex-1 flex-col gap-2 py-1">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  )
}

export function SearchSkeleton(): ReactElement {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }, (_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  )
}
