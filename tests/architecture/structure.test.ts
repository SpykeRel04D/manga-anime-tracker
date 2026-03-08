import { existsSync } from 'fs'
import { resolve } from 'path'
import { describe, expect, it } from 'vitest'

const rootDir = resolve(__dirname, '../../src/modules')

const boundedContexts = ['auth', 'tracking']
const hexagonalDirs = [
  'domain/entities',
  'domain/ports',
  'application/use-cases',
  'infrastructure/adapters',
]

describe('Hexagonal DDD folder structure', () => {
  for (const context of boundedContexts) {
    describe(`${context} bounded context`, () => {
      for (const dir of hexagonalDirs) {
        it(`has ${dir} directory`, () => {
          const fullPath = resolve(rootDir, context, dir)
          expect(existsSync(fullPath)).toBe(true)
        })
      }
    })
  }

  it('has auth bounded context root', () => {
    expect(existsSync(resolve(rootDir, 'auth'))).toBe(true)
  })

  it('has tracking bounded context root', () => {
    expect(existsSync(resolve(rootDir, 'tracking'))).toBe(true)
  })
})
