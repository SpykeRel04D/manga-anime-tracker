import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { APIError } from 'better-auth/api'
import { nextCookies } from 'better-auth/next-js'

import { db } from '@/db/drizzle'
import * as schema from '@/db/schema'
import { getAuthBaseUrl, getAuthSecret, isRegistrationAllowed } from '@/lib/env'

export const auth = betterAuth({
  baseURL: getAuthBaseUrl(),
  secret: getAuthSecret(),
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      ...schema,
      user: schema.users,
      account: schema.accounts,
      session: schema.sessions,
      verification: schema.verifications,
    },
  }),
  user: {
    modelName: 'users',
  },
  advanced: {
    database: {
      generateId: (options) => {
        if (options.model === 'user' || options.model === 'users') {
          return false // Let PostgreSQL generate UUID via defaultRandom()
        }
        return crypto.randomUUID()
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // 1 day sliding window
  },
  databaseHooks: {
    user: {
      create: {
        before: async () => {
          if (isRegistrationAllowed()) return
          const existingUsers = await db
            .select({ id: schema.users.id })
            .from(schema.users)
            .limit(1)
          if (existingUsers.length > 0) {
            throw new APIError('FORBIDDEN', {
              message: 'Registration is closed',
            })
          }
        },
      },
    },
  },
  plugins: [nextCookies()],
})
