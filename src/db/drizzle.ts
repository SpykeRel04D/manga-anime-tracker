import { neon } from '@neondatabase/serverless'
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http'
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres'

import { getDatabaseUrl, isProduction } from '@/lib/env'

import * as schema from './schema'

function createDb(): ReturnType<typeof drizzleNeon> | ReturnType<typeof drizzlePg> {
  const url = getDatabaseUrl()

  if (isProduction()) {
    const sql = neon(url)
    return drizzleNeon({ client: sql, schema })
  }

  return drizzlePg({ connection: url, schema })
}

export const db = createDb()
