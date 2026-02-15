import { describe, it, expect } from 'vitest'
import { createInitialGameState, processTurn, applyTurnResult } from '@/engine/GameEngine.ts'

describe('createInitialGameState', () => {
  it('creates a valid game state for toss-up difficulty', () => {
    const state = createInitialGameState('toss-up')
    expect(state.difficulty).toBe('toss-up')
    expect(state.current_turn).toBe(1)
    expect(state.max_turns).toBe(26)
    expect(state.phase).toBe('primary')
    expect(state.finances.cash_on_hand).toBe(200000)
    expect(state.polls.demographics.length).toBe(7)
    expect(state.staff.length).toBe(6)
    expect(state.endorsements.length).toBe(10)
    expect(state.opponent.name).toBe('Susie Lee')
  })

  it('safe-seat has more starting cash', () => {
    const state = createInitialGameState('safe-seat')
    expect(state.finances.cash_on_hand).toBe(500000)
    expect(state.polls.player_support).toBe(52)
  })

  it('hostile has less starting cash', () => {
    const state = createInitialGameState('hostile')
    expect(state.finances.cash_on_hand).toBe(100000)
    expect(state.polls.player_support).toBe(38)
  })

  it('demographics have valid support values', () => {
    const state = createInitialGameState('toss-up')
    for (const demo of state.polls.demographics) {
      expect(demo.current_support).toBeGreaterThan(0)
      expect(demo.current_support).toBeLessThan(100)
      expect(demo.opponent_support).toBeGreaterThan(0)
      expect(demo.opponent_support).toBeLessThan(100)
    }
  })
})

describe('processTurn', () => {
  it('produces a valid turn result', () => {
    const state = createInitialGameState('toss-up')
    const actions = [{ type: 'fundraise' as const, intensity: 2 }, { type: 'campaign' as const, intensity: 2 }]
    const result = processTurn(state, actions)

    expect(result.turn).toBe(1)
    expect(result.financial_summary.income).toBeGreaterThan(0)
    expect(result.notifications).toBeDefined()
  })

  it('fundraising increases income', () => {
    const state = createInitialGameState('toss-up')
    const noFundraise = processTurn(state, [])
    const withFundraise = processTurn(state, [{ type: 'fundraise' as const, intensity: 3 }])

    expect(withFundraise.financial_summary.income).toBeGreaterThan(noFundraise.financial_summary.income)
  })
})

describe('applyTurnResult', () => {
  it('advances the turn counter', () => {
    const state = createInitialGameState('toss-up')
    const actions = [{ type: 'fundraise' as const, intensity: 2 }]
    const result = processTurn(state, actions)
    const newState = applyTurnResult(state, result, actions)

    expect(newState.current_turn).toBe(2)
    expect(newState.actions_taken_this_turn).toEqual([])
  })

  it('updates finances', () => {
    const state = createInitialGameState('toss-up')
    const actions = [{ type: 'fundraise' as const, intensity: 3 }]
    const result = processTurn(state, actions)
    const newState = applyTurnResult(state, result, actions)

    expect(newState.finances.total_raised).toBeGreaterThan(state.finances.total_raised)
    expect(newState.finances.fundraising_history.length).toBe(1)
  })
})
