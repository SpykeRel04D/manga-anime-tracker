import type { ReactElement } from 'react'

import { NavBar } from '@/components/layout/nav-bar'
import { PlaceholderGrid } from '@/components/shared/placeholder-grid'

export default function Home(): ReactElement {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-7xl">
        <PlaceholderGrid />
      </main>
    </>
  )
}
