const LOCAL_AUTH_URL = 'http://localhost:3000'

function getRequiredEnv(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} is required in production`)
  }

  return value
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

export function isRegistrationAllowed(): boolean {
  return process.env.ALLOW_REGISTRATION === 'true'
}

export function getAuthBaseUrl(): string {
  if (!isProduction()) {
    return process.env.BETTER_AUTH_URL ?? LOCAL_AUTH_URL
  }

  return getRequiredEnv('BETTER_AUTH_URL')
}

export function getAuthSecret(): string | undefined {
  if (!isProduction()) {
    return process.env.BETTER_AUTH_SECRET
  }

  return getRequiredEnv('BETTER_AUTH_SECRET')
}

export function getDatabaseUrl(): string {
  if (isProduction()) {
    return getRequiredEnv('NEON_DATABASE_URL')
  }

  const value = process.env.LOCAL_DATABASE_URL
  if (!value) {
    throw new Error('LOCAL_DATABASE_URL is required for local development')
  }

  return value
}
