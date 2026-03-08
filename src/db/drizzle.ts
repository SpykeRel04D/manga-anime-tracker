import { neon } from '@neondatabase/serverless'
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http'
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres'

import * as schema from './schema'

function createDb(): ReturnType<typeof drizzleNeon> | ReturnType<typeof drizzlePg> {
  if (process.env.NODE_ENV === 'production') {
    const url = process.env.NEON_DATABASE_URL
    if (!url) {
      throw new Error('NEON_DATABASE_URL is required in production')
    }
    const sql = neon(url)
    return drizzleNeon({ client: sql, schema })
  }

  const url = process.env.LOCAL_DATABASE_URL
  if (!url) {
    throw new Error('LOCAL_DATABASE_URL is required for local development')
  }
  return drizzlePg({ connection: url, schema })
}

export const db = createDb()
