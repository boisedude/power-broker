import { describe, it, expect } from 'vitest'
import { SeededRandom, createSeed } from '@/engine/RandomUtils.ts'

describe('SeededRandom', () => {
  it('produces deterministic results with same seed', () => {
    const rng1 = new SeededRandom(42)
    const rng2 = new SeededRandom(42)
    const results1 = Array.from({ length: 10 }, () => rng1.next())
    const results2 = Array.from({ length: 10 }, () => rng2.next())
    expect(results1).toEqual(results2)
  })

  it('produces different results with different seeds', () => {
    const rng1 = new SeededRandom(42)
    const rng2 = new SeededRandom(99)
    expect(rng1.next()).not.toEqual(rng2.next())
  })

  it('nextInt returns values in range', () => {
    const rng = new SeededRandom(42)
    for (let i = 0; i < 100; i++) {
      const val = rng.nextInt(1, 10)
      expect(val).toBeGreaterThanOrEqual(1)
      expect(val).toBeLessThanOrEqual(10)
    }
  })

  it('chance returns boolean based on probability', () => {
    const rng = new SeededRandom(42)
    let trueCount = 0
    const iterations = 1000
    for (let i = 0; i < iterations; i++) {
      if (rng.chance(0.5)) trueCount++
    }
    expect(trueCount).toBeGreaterThan(400)
    expect(trueCount).toBeLessThan(600)
  })

  it('pick selects from array', () => {
    const rng = new SeededRandom(42)
    const arr = ['a', 'b', 'c']
    const picked = rng.pick(arr)
    expect(arr).toContain(picked)
  })

  it('shuffle returns all elements', () => {
    const rng = new SeededRandom(42)
    const arr = [1, 2, 3, 4, 5]
    const shuffled = rng.shuffle(arr)
    expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5])
  })
})

describe('createSeed', () => {
  it('returns a number', () => {
    const seed = createSeed()
    expect(typeof seed).toBe('number')
  })
})
