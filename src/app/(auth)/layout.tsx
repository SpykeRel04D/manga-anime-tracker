import type { ReactElement, ReactNode } from 'react'

export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode
}>): ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-foreground">
          My Anime Tracker
        </h1>
        {children}
      </div>
    </div>
  )
}
