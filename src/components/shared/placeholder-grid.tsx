import type { ReactElement } from 'react'

import { SkeletonCard } from '@/components/shared/skeleton-card'

export function PlaceholderGrid(): ReactElement {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
