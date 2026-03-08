import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import './globals.css'
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'My Anime Tracker',
  description: 'Track your anime and manga progress',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>): ReactNode {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
