import type { MediaSearchPort } from '@/modules/tracking/domain/ports/media-search-port'

const MAX_DEPTH = 10

export interface ComputeFranchiseRootInput {
  anilistId: number
  port: Pick<MediaSearchPort, 'getMediaRelations'>
}

export async function computeFranchiseRoot(
  input: ComputeFranchiseRootInput,
): Promise<number | null> {
  const { anilistId, port } = input
  const visited = new Set<number>([anilistId])
  let current = anilistId
  let parentFollowsLeft = 1

  for (let depth = 0; depth < MAX_DEPTH; depth++) {
    const data = await port.getMediaRelations(current)
    if (!data) {
      // Rate limited or fetch failed.
      // First call: can't determine anything → return null so caller can retry.
      // Subsequent call: return what we have (best-effort partial walk).
      return depth === 0 ? null : current
    }

    const prequel = data.relations.find(r => r.relationType === 'PREQUEL')
    if (prequel && !visited.has(prequel.id)) {
      visited.add(prequel.id)
      current = prequel.id
      continue
    }

    if (parentFollowsLeft > 0) {
      const parent = data.relations.find(r => r.relationType === 'PARENT')
      if (parent && !visited.has(parent.id)) {
        visited.add(parent.id)
        current = parent.id
        parentFollowsLeft--
        continue
      }
    }

    return current
  }

  return current
}
