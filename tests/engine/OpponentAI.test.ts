import { describe, it, expect } from 'vitest'
import { processOpponentTurn, getOpponentPollEffect } from '@/engine/OpponentAI.ts'
import { GAME_CONSTANTS } from '@/engine/BalanceConstants.ts'
import { SeededRandom } from '@/engine/RandomUtils.ts'
import type { OpponentState } from '@/types/game.ts'

function makeOpponent(overrides: Partial<OpponentState> = {}): OpponentState {
  return {
    name: 'Susie Lee',
    party: 'Democrat',
    cash_on_hand: 500000,
    total_spent: 0,
    approval_rating: 50,
    attack_mode: false,
    endorsements_secured: [],
    staff_level: 3,
    ad_spending: 30000,
    gotv_investment: 0,
    strategy: 'establishment',
    ...overrides,
  }
}

describe('processOpponentTurn', () => {
  it('always fundraises', () => {
    const opponent = makeOpponent()
    const rng = new SeededRandom(42)
    const result = processOpponentTurn(opponent, 45, 45, 5, rng)

    expect(result.actions.some((a) => a.includes('raised'))).toBe(true)
    expect(opponent.cash_on_hand).toBeGreaterThan(500000 - result.cash_spent)
  })

  it('uses establishment strategy when leading comfortably', () => {
    const opponent = makeOpponent()
    const rng = new SeededRandom(42)
    const result = processOpponentTurn(opponent, 40, 50, 5, rng)

    expect(result.new_strategy).toBe('establishment')
  })

  it('goes aggressive when significantly behind', () => {
    const opponent = makeOpponent()
    const rng = new SeededRandom(42)
    // Opponent at 40, player at 50 => margin = -10, well below -5 threshold
    const result = processOpponentTurn(opponent, 50, 40, 15, rng)

    expect(result.new_strategy).toBe('aggressive')
  })

  it('enters attack mode when margin crosses threshold', () => {
    const opponent = makeOpponent({ attack_mode: false })
    const rng = new SeededRandom(42)
    // margin = 40 - 50 = -10, below OPPONENT_ADAPTATION_THRESHOLD (-5)
    processOpponentTurn(opponent, 50, 40, 15, rng)
    expect(opponent.attack_mode).toBe(true)
  })

  it('exits attack mode when leading by 3+', () => {
    const opponent = makeOpponent({ attack_mode: true })
    const rng = new SeededRandom(42)
    // margin = 50 - 45 = 5, > 3
    processOpponentTurn(opponent, 45, 50, 10, rng)
    expect(opponent.attack_mode).toBe(false)
  })

  it('invests in GOTV during late game', () => {
    const opponent = makeOpponent()
    const rng = new SeededRandom(42)
    const result = processOpponentTurn(opponent, 45, 45, GAME_CONSTANTS.GOTV_AVAILABLE_TURN, rng)

    expect(result.gotv_added).toBeGreaterThan(0)
    expect(result.actions.some((a) => a.includes('GOTV'))).toBe(true)
  })

  it('does not invest in GOTV before available turn', () => {
    const opponent = makeOpponent()
    const rng = new SeededRandom(42)
    const result = processOpponentTurn(opponent, 45, 45, GAME_CONSTANTS.GOTV_AVAILABLE_TURN - 1, rng)

    expect(result.gotv_added).toBe(0)
  })

  it('campaigns less frequently in early game (primary)', () => {
    // In primary phase (turn <= 6), campaign chance is 0.5 vs 0.85 late
    // Statistical test: run many seeds and check rate
    let campaigns = 0
    const runs = 200
    for (let seed = 0; seed < runs; seed++) {
      const opponent = makeOpponent()
      const rng = new SeededRandom(seed)
      const result = processOpponentTurn(opponent, 45, 45, 3, rng) // primary
      if (result.actions.some((a) => a.includes('campaigned'))) campaigns++
    }
    const rate = campaigns / runs
    // Should be around 0.5 (±0.15 for randomness)
    expect(rate).toBeGreaterThan(0.3)
    expect(rate).toBeLessThan(0.7)
  })

  it('uses establishment strategy early even when slightly behind', () => {
    const opponent = makeOpponent()
    const rng = new SeededRandom(42)
    // Turn 5 (early), margin = -3 (slightly behind)
    const result = processOpponentTurn(opponent, 48, 45, 5, rng)
    expect(result.new_strategy).toBe('establishment')
  })

  it('opponent endorsement chance is reduced to 10%', () => {
    // Statistical test over many seeds
    let endorsements = 0
    const runs = 500
    for (let seed = 0; seed < runs; seed++) {
      const opponent = makeOpponent()
      const rng = new SeededRandom(seed)
      const result = processOpponentTurn(opponent, 45, 45, 10, rng)
      if (result.actions.some((a) => a.includes('endorsement'))) endorsements++
    }
    const rate = endorsements / runs
    // Should be around 0.10 (±0.05)
    expect(rate).toBeLessThan(0.2)
  })
})

describe('getOpponentPollEffect', () => {
  it('clamps poll effect to [-2, 2]', () => {
    const result = { actions: [], cash_spent: 0, poll_effect: 5, new_strategy: 'aggressive' as const, gotv_added: 0 }
    expect(getOpponentPollEffect(result, 50)).toBe(2)

    result.poll_effect = -5
    expect(getOpponentPollEffect(result, 50)).toBe(-2)
  })

  it('passes through values within range', () => {
    const result = { actions: [], cash_spent: 0, poll_effect: 1.2, new_strategy: 'establishment' as const, gotv_added: 0 }
    expect(getOpponentPollEffect(result, 50)).toBe(1.2)
  })
})
