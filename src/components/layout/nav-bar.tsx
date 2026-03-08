'use client'

import Link from 'next/link'
import type { ReactElement } from 'react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { siteConfig } from '@/config/site'
import { authClient } from '@/lib/auth-client'

export function NavBar(): ReactElement {
  const { data: session, isPending } = authClient.useSession()

  const userEmail = session?.user?.email
  const avatarInitial = userEmail ? userEmail[0].toUpperCase() : 'U'

  async function handleLogout(): Promise<void> {
    await authClient.signOut()
    window.location.href = '/login'
  }

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

          <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer rounded-full outline-none">
              <Avatar>
                <AvatarFallback>
                  {isPending ? 'U' : avatarInitial}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8}>
              <DropdownMenuLabel>
                {userEmail ?? 'User'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
