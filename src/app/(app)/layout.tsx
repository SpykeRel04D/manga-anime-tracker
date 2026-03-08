import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { ReactElement, ReactNode } from 'react'

import { NavBar } from '@/components/layout/nav-bar'
import { auth } from '@/lib/auth'

export default async function AppLayout({
  children,
}: Readonly<{
  children: ReactNode
}>): Promise<ReactElement> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/login')
  }

  return (
    <>
      <NavBar />
      {children}
    </>
  )
}
