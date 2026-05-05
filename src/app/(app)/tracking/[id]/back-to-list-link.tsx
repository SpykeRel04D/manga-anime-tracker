'use client'

import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { MouseEvent, ReactElement } from 'react'
import { useEffect, useState } from 'react'

type Origin = 'list' | 'search' | 'other'

export function BackToListLink(): ReactElement {
  const router = useRouter()
  const [origin, setOrigin] = useState<Origin>('other')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const ref = document.referrer
    if (!ref) return
    try {
      const url = new URL(ref)
      if (url.origin !== window.location.origin) return
      if (url.pathname === '/search') {
        setOrigin('search')
      } else if (url.pathname === '/') {
        setOrigin('list')
      }
    } catch {
      // ignore malformed referrer
    }
  }, [])

  function handleClick(event: MouseEvent<HTMLAnchorElement>): void {
    if (origin === 'list' || origin === 'search') {
      event.preventDefault()
      router.back()
    }
  }

  const label = origin === 'search' ? 'Back to search' : 'Back to my list'
  const href = origin === 'search' ? '/search' : '/'

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors"
    >
      <ChevronLeft className="size-4" />
      {label}
    </Link>
  )
}
