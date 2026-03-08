import dotenv from 'dotenv'
import { defineConfig } from 'drizzle-kit'

dotenv.config({ path: '.env.local' })
dotenv.config()

const isProd = process.env.NODE_ENV === 'production'

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: isProd
      ? process.env.NEON_DATABASE_URL!
      : process.env.LOCAL_DATABASE_URL!,
  },
})
