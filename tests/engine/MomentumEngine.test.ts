import { describe, it, expect } from 'vitest'
import { calculateMomentum, getMomentumLabel, getMomentumColor } from '@/engine/MomentumEngine.ts'
import { GAME_CONSTANTS } from '@/engine/BalanceConstants.ts'

describe('calculateMomentum', () => {
  it('decays positive momentum toward 0', () => {
    const result = calculateMomentum(5, 0, 0, false)
    expect(result).toBeLessThan(5)
    expect(result).toBeGreaterThan(0)
  })

  it('decays negative momentum toward 0', () => {
    const result = calculateMomentum(-5, 0, 0, false)
    expect(result).toBeGreaterThan(-5)
    expect(result).toBeLessThan(0)
  })

  it('strong positive poll change adds momentum', () => {
    const result = calculateMomentum(0, 2, 0, false) // pollChange > 1
    expect(result).toBeGreaterThan(0)
  })

  it('moderate positive poll change adds less momentum', () => {
    const strong = calculateMomentum(0, 2, 0, false)
    const moderate = calculateMomentum(0, 0.7, 0, false)
    expect(strong).toBeGreaterThan(moderate)
  })

  it('negative poll change reduces momentum', () => {
    const result = calculateMomentum(0, -2, 0, false) // pollChange < -1
    expect(result).toBeLessThan(0)
  })

  it('endorsement adds 1.5 momentum', () => {
    const without = calculateMomentum(0, 0, 0, false)
    const with_ = calculateMomentum(0, 0, 0, true)
    expect(with_ - without).toBe(1.5)
  })

  it('events impact adds to momentum', () => {
    const result = calculateMomentum(0, 0, 3, false)
    expect(result).toBe(3)
  })

  it('clamps to max', () => {
    const result = calculateMomentum(9, 2, 3, true)
    expect(result).toBe(GAME_CONSTANTS.MOMENTUM_MAX)
  })

  it('clamps to min', () => {
    const result = calculateMomentum(-9, -2, -3, false)
    expect(result).toBe(GAME_CONSTANTS.MOMENTUM_MIN)
  })

  it('zero momentum stays zero with no inputs', () => {
    const result = calculateMomentum(0, 0, 0, false)
    expect(result).toBe(0)
  })
})

describe('getMomentumLabel', () => {
  it('returns Surging for high momentum', () => {
    expect(getMomentumLabel(5)).toBe('Surging')
    expect(getMomentumLabel(10)).toBe('Surging')
  })

  it('returns Building for moderate momentum', () => {
    expect(getMomentumLabel(3)).toBe('Building')
  })

  it('returns Neutral for zero', () => {
    expect(getMomentumLabel(0)).toBe('Neutral')
  })

  it('returns Collapsing for very negative momentum', () => {
    expect(getMomentumLabel(-5)).toBe('Collapsing')
    expect(getMomentumLabel(-10)).toBe('Collapsing')
  })

  it('returns Headwinds for slight negative', () => {
    expect(getMomentumLabel(-1)).toBe('Headwinds')
  })
})

describe('getMomentumColor', () => {
  it('returns green for positive momentum', () => {
    expect(getMomentumColor(5)).toContain('green')
  })

  it('returns gray for zero', () => {
    expect(getMomentumColor(0)).toContain('gray')
  })

  it('returns red for negative momentum', () => {
    expect(getMomentumColor(-5)).toContain('red')
  })
})
