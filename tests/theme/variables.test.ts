import { readFileSync } from 'fs'
import { resolve } from 'path'
import { describe, expect, it } from 'vitest'

const cssPath = resolve(__dirname, '../../src/app/globals.css')
const css = readFileSync(cssPath, 'utf-8')

describe('Theme CSS variables', () => {
  it('imports Tailwind CSS', () => {
    expect(css).toContain("@import 'tailwindcss'")
  })

  it('uses Tailwind v4 custom-variant dark', () => {
    expect(css).toContain('@custom-variant dark')
  })

  it('uses oklch color format (not hsl)', () => {
    expect(css).toContain('oklch')
    expect(css).not.toMatch(/--background:\s*hsl/)
  })

  it('defines --background CSS variable', () => {
    expect(css).toContain('--background:')
  })

  it('defines --foreground CSS variable', () => {
    expect(css).toContain('--foreground:')
  })

  it('defines --primary CSS variable', () => {
    expect(css).toContain('--primary:')
  })

  it('defines --accent CSS variable', () => {
    expect(css).toContain('--accent:')
  })

  it('defines --card CSS variable', () => {
    expect(css).toContain('--card:')
  })

  it('defines --border CSS variable', () => {
    expect(css).toContain('--border:')
  })

  it('defines --ring CSS variable', () => {
    expect(css).toContain('--ring:')
  })

  it('has a .dark selector with same warm values', () => {
    expect(css).toMatch(/\.dark\s*\{/)
  })

  it('maps CSS vars to Tailwind tokens via @theme inline', () => {
    expect(css).toContain('@theme inline')
    expect(css).toContain('--color-background: var(--background)')
    expect(css).toContain('--color-primary: var(--primary)')
    expect(css).toContain('--color-accent: var(--accent)')
  })

  it('uses warm dark background (lightness ~0.17)', () => {
    const bgMatch = css.match(/--background:\s*oklch\(([^)]+)\)/)
    expect(bgMatch).not.toBeNull()
    const lightness = parseFloat(bgMatch![1])
    expect(lightness).toBeGreaterThan(0.1)
    expect(lightness).toBeLessThan(0.25)
  })

  it('uses amber primary (hue ~75)', () => {
    const primaryMatch = css.match(/--primary:\s*oklch\(([^)]+)\)/)
    expect(primaryMatch).not.toBeNull()
    const parts = primaryMatch![1].split(/\s+/)
    const hue = parseFloat(parts[2])
    expect(hue).toBeGreaterThan(60)
    expect(hue).toBeLessThan(90)
  })

  it('sets --radius to 0.75rem for soft rounded cards', () => {
    expect(css).toContain('--radius: 0.75rem')
  })
})
