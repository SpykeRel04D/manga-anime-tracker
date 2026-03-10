'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { ReactElement } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { StatusCounts } from '@/modules/tracking/application/use-cases/get-status-counts'

interface FilterBarProps {
  statusCounts: StatusCounts
}

const STATUS_TABS = [
  { label: 'All', value: 'all' },
  { label: 'Watching', value: 'watching' },
  { label: 'Completed', value: 'completed' },
  { label: 'On Hold', value: 'on_hold' },
  { label: 'Dropped', value: 'dropped' },
  { label: 'Plan to Watch', value: 'plan_to_watch' },
] as const

const TYPE_TABS = [
  { label: 'All', value: 'all' },
  { label: 'Anime', value: 'anime' },
  { label: 'Manga', value: 'manga' },
] as const

const SORT_OPTIONS = [
  { label: 'Date Added', value: 'date_added' },
  { label: 'Rating', value: 'rating' },
  { label: 'Title', value: 'title' },
] as const

export function FilterBar({ statusCounts }: FilterBarProps): ReactElement {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const currentStatus = searchParams.get('status') ?? 'all'
  const currentType = searchParams.get('type') ?? 'all'
  const currentSort = searchParams.get('sort') ?? 'date_added'

  function updateParam(key: string, value: string): void {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const totalCount = Object.values(statusCounts).reduce((sum, n) => sum + n, 0)

  function getStatusCount(value: string): number {
    if (value === 'all') return totalCount
    return statusCounts[value] ?? 0
  }

  return (
    <div className="space-y-2 px-4 pt-4 pb-2">
      {/* Status tab bar */}
      <div className="flex gap-1 overflow-x-auto pb-2">
        {STATUS_TABS.map(tab => {
          const isActive = currentStatus === tab.value
          const tabCount = getStatusCount(tab.value)
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => updateParam('status', tab.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tab.label} ({tabCount})
            </button>
          )
        })}
      </div>

      {/* Second row: type toggle + sort dropdown */}
      <div className="flex items-center justify-between gap-2">
        {/* Type toggle */}
        <div className="flex gap-1">
          {TYPE_TABS.map(tab => {
            const isActive = currentType === tab.value
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => updateParam('type', tab.value)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Sort dropdown */}
        <Select
          value={currentSort}
          onValueChange={(value: string | null) => { if (value !== null) updateParam('sort', value) }}
        >
          <SelectTrigger size="sm" className="w-auto min-w-[120px]">
            <SelectValue>
              {SORT_OPTIONS.find(o => o.value === currentSort)?.label ?? 'Sort'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="end">
            {SORT_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
