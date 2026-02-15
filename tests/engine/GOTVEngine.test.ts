import { describe, it, expect } from 'vitest'
import { calculateGOTV, isGOTVAvailable } from '@/engine/GOTVEngine.ts'
import { GAME_CONSTANTS } from '@/engine/BalanceConstants.ts'
import type { StaffMember } from '@/types/game.ts'
import type { AllocatedAction } from '@/types/actions.ts'

function makeStaff(roles: string[] = []): StaffMember[] {
  return roles.map((role) => ({
    id: role,
    role: role as StaffMember['role'],
    name: role,
    cost: 5000,
    description: '',
    hired: true,
    available_turn: 1,
  }))
}

describe('calculateGOTV', () => {
  it('returns zero investment before available turn', () => {
    const actions: AllocatedAction[] = [{ type: 'gotv', intensity: 2 }]
    const result = calculateGOTV(0, actions, [], GAME_CONSTANTS.GOTV_AVAILABLE_TURN - 1)

    expect(result.investment_added).toBe(0)
    expect(result.total_investment).toBe(0)
    expect(result.estimated_turnout_bonus).toBe(0)
  })

  it('calculates investment from gotv actions', () => {
    const actions: AllocatedAction[] = [{ type: 'gotv', intensity: 2 }]
    const result = calculateGOTV(0, actions, [], GAME_CONSTANTS.GOTV_AVAILABLE_TURN)

    expect(result.investment_added).toBe(GAME_CONSTANTS.GOTV_BASE_INVESTMENT * 2)
    expect(result.total_investment).toBe(result.investment_added)
  })

  it('accumulates with existing investment', () => {
    const existing = 50000
    const actions: AllocatedAction[] = [{ type: 'gotv', intensity: 1 }]
    const result = calculateGOTV(existing, actions, [], GAME_CONSTANTS.GOTV_AVAILABLE_TURN)

    expect(result.total_investment).toBe(existing + result.investment_added)
  })

  it('field director provides GOTV bonus', () => {
    const actions: AllocatedAction[] = [{ type: 'gotv', intensity: 2 }]

    const without = calculateGOTV(0, actions, [], GAME_CONSTANTS.GOTV_AVAILABLE_TURN)
    const with_ = calculateGOTV(0, actions, makeStaff(['field-director']), GAME_CONSTANTS.GOTV_AVAILABLE_TURN)

    expect(with_.investment_added).toBeGreaterThan(without.investment_added)
  })

  it('ignores non-gotv actions', () => {
    const actions: AllocatedAction[] = [
      { type: 'fundraise', intensity: 3 },
      { type: 'campaign', intensity: 2 },
    ]
    const result = calculateGOTV(0, actions, [], GAME_CONSTANTS.GOTV_AVAILABLE_TURN)

    expect(result.investment_added).toBe(0)
  })

  it('caps estimated turnout bonus at GOTV_FINAL_EFFECT_MAX', () => {
    const actions: AllocatedAction[] = [{ type: 'gotv', intensity: 3 }]
    // Start with huge existing investment to exceed cap
    const result = calculateGOTV(500000, actions, [], GAME_CONSTANTS.GOTV_AVAILABLE_TURN)

    expect(result.estimated_turnout_bonus).toBeLessThanOrEqual(GAME_CONSTANTS.GOTV_FINAL_EFFECT_MAX)
  })

  it('multiple gotv actions stack', () => {
    const single: AllocatedAction[] = [{ type: 'gotv', intensity: 1 }]
    const double: AllocatedAction[] = [{ type: 'gotv', intensity: 1 }, { type: 'gotv', intensity: 1 }]

    const r1 = calculateGOTV(0, single, [], GAME_CONSTANTS.GOTV_AVAILABLE_TURN)
    const r2 = calculateGOTV(0, double, [], GAME_CONSTANTS.GOTV_AVAILABLE_TURN)

    expect(r2.investment_added).toBe(r1.investment_added * 2)
  })
})

describe('isGOTVAvailable', () => {
  it('returns false before available turn', () => {
    expect(isGOTVAvailable(GAME_CONSTANTS.GOTV_AVAILABLE_TURN - 1)).toBe(false)
    expect(isGOTVAvailable(1)).toBe(false)
  })

  it('returns true on and after available turn', () => {
    expect(isGOTVAvailable(GAME_CONSTANTS.GOTV_AVAILABLE_TURN)).toBe(true)
    expect(isGOTVAvailable(GAME_CONSTANTS.GOTV_AVAILABLE_TURN + 5)).toBe(true)
  })
})
