'use client'

import { Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { ReactElement } from 'react'
import { useDebouncedCallback } from 'use-debounce'

import { Input } from '@/components/ui/input'

export function SearchInput(): ReactElement {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (term) {
      params.set('q', term)
    } else {
      params.delete('q')
    }
    router.replace(`${pathname}?${params.toString()}`)
  }, 300)

  return (
    <div className="relative">
      <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        placeholder="Search anime or manga..."
        defaultValue={searchParams.get('q') ?? ''}
        onChange={e => handleSearch(e.target.value)}
        className="h-10 pl-10"
      />
    </div>
  )
}
