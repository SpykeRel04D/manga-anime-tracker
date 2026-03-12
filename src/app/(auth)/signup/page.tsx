import type { ReactElement } from 'react'

import { db } from '@/db/drizzle'
import { users } from '@/db/schema'
import { isRegistrationAllowed } from '@/lib/env'

import { SignupForm } from './signup-form'

export const dynamic = 'force-dynamic'

export default async function SignupPage(): Promise<ReactElement> {
  const existingUsers = await db
    .select({ id: users.id })
    .from(users)
    .limit(1)

  const isRegistrationOpen = existingUsers.length === 0 || isRegistrationAllowed()

  return <SignupForm registrationOpen={isRegistrationOpen} />
}
