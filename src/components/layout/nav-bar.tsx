'use client'

import Link from 'next/link'
import type { ReactElement } from 'react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { siteConfig } from '@/config/site'

export function NavBar(): ReactElement {
  return (
    <nav className="border-border bg-card sticky top-0 z-50 border-b">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-foreground text-lg font-semibold">
          {siteConfig.name}
        </Link>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            {siteConfig.navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-accent text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <Avatar>
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </nav>
  )
}
