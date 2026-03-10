import { Inbox } from 'lucide-react'
import Link from 'next/link'
import type { ReactElement } from 'react'

import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps): ReactElement {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <Inbox className="text-muted-foreground/30" size={48} />
      <div className="space-y-1">
        <p className="text-lg font-semibold">{title}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      {actionLabel && actionHref && (
        <Button
          variant="secondary"
          render={<Link href={actionHref}>{actionLabel}</Link>}
        />
      )}
    </div>
  )
}
