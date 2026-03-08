import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TokenBucket } from '@/lib/anilist/rate-limiter'

describe('TokenBucket rate limiter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts at full capacity', () => {
    const bucket = new TokenBucket(25, 25 / 60)
    // Should be able to consume 25 times
    for (let i = 0; i < 25; i++) {
      expect(bucket.tryConsume()).toBe(true)
    }
  })

  it('rejects when empty', () => {
    const bucket = new TokenBucket(5, 5 / 60)
    // Drain the bucket
    for (let i = 0; i < 5; i++) {
      bucket.tryConsume()
    }
    expect(bucket.tryConsume()).toBe(false)
  })

  it('refills over time', () => {
    const bucket = new TokenBucket(5, 5 / 60)
    // Drain the bucket
    for (let i = 0; i < 5; i++) {
      bucket.tryConsume()
    }
    expect(bucket.tryConsume()).toBe(false)

    // Advance time by 60 seconds (should refill 5 tokens at 5/60 rate)
    vi.advanceTimersByTime(60_000)
    expect(bucket.tryConsume()).toBe(true)
  })

  it('never exceeds capacity', () => {
    const bucket = new TokenBucket(5, 5 / 60)
    // Wait a long time without consuming
    vi.advanceTimersByTime(300_000) // 5 minutes

    // Should still only be able to consume 5 times (capacity)
    let consumed = 0
    while (bucket.tryConsume()) {
      consumed++
      if (consumed > 10) break // Safety guard
    }
    expect(consumed).toBe(5)
  })

  it('partially refills after partial time', () => {
    const bucket = new TokenBucket(25, 25 / 60)
    // Drain the bucket
    for (let i = 0; i < 25; i++) {
      bucket.tryConsume()
    }

    // Advance 12 seconds (should refill ~5 tokens: 25/60 * 12 = 5)
    vi.advanceTimersByTime(12_000)
    // Should be able to consume at least 4 times (accounting for float math)
    let consumed = 0
    while (bucket.tryConsume()) {
      consumed++
    }
    expect(consumed).toBeGreaterThanOrEqual(4)
    expect(consumed).toBeLessThanOrEqual(5)
  })
})
