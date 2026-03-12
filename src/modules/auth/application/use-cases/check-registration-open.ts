import { isRegistrationAllowed } from '@/lib/env'

/**
 * Check whether new user registration is currently allowed.
 *
 * Registration is open when:
 * - The ALLOW_REGISTRATION env var is "true" (escape hatch), OR
 * - No users exist in the database yet (single-user app: first user only)
 *
 * @param queryExistingUsers - Injected dependency that returns an array of user
 *   records (empty if none exist). Accepts any function returning a promise of
 *   an array with at least an `id` field.
 * @returns true if registration should be allowed, false otherwise
 */
export async function checkRegistrationOpen(
  queryExistingUsers: () => Promise<{ id: string }[]>,
): Promise<boolean> {
  if (isRegistrationAllowed()) {
    return true
  }

  const existingUsers = await queryExistingUsers()
  return existingUsers.length === 0
}
