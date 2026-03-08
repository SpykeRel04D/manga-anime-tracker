import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { APIError } from 'better-auth/api'
import { nextCookies } from 'better-auth/next-js'

import { db } from '@/db/drizzle'
import * as schema from '@/db/schema'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      ...schema,
      user: schema.users,
    },
  }),
  user: {
    modelName: 'users',
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
          if (process.env.ALLOW_REGISTRATION === 'true') return
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
