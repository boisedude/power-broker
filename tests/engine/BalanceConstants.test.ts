import { describe, it, expect } from 'vitest'
import { DIFFICULTY_CONFIGS, GAME_CONSTANTS, getPhaseForTurn, getTurnDate } from '@/engine/BalanceConstants.ts'

describe('DIFFICULTY_CONFIGS', () => {
  it('has all five difficulty levels', () => {
    expect(Object.keys(DIFFICULTY_CONFIGS)).toHaveLength(5)
    expect(DIFFICULTY_CONFIGS['toss-up']).toBeDefined()
  })

  it('toss-up starts even', () => {
    const tossUp = DIFFICULTY_CONFIGS['toss-up']
    expect(tossUp.player_starting_support).toBe(45)
    expect(tossUp.opponent_starting_support).toBe(45)
    expect(tossUp.starting_cash).toBe(200000)
  })

  it('difficulty increases with lower starting support', () => {
    const levels = ['safe-seat', 'lean', 'toss-up', 'lean-away', 'hostile'] as const
    for (let i = 1; i < levels.length; i++) {
      expect(DIFFICULTY_CONFIGS[levels[i]].starting_cash)
        .toBeLessThanOrEqual(DIFFICULTY_CONFIGS[levels[i - 1]].starting_cash)
    }
  })
})

describe('getPhaseForTurn', () => {
  it('returns correct phases', () => {
    expect(getPhaseForTurn(1)).toBe('primary')
    expect(getPhaseForTurn(6)).toBe('primary')
    expect(getPhaseForTurn(7)).toBe('early')
    expect(getPhaseForTurn(14)).toBe('early')
    expect(getPhaseForTurn(15)).toBe('mid')
    expect(getPhaseForTurn(20)).toBe('mid')
    expect(getPhaseForTurn(21)).toBe('final')
    expect(getPhaseForTurn(26)).toBe('final')
    expect(getPhaseForTurn(27)).toBe('election')
  })
})

describe('getTurnDate', () => {
  it('returns formatted date strings', () => {
    const date1 = getTurnDate(1)
    expect(date1).toContain('Jun')
    const date26 = getTurnDate(26)
    expect(date26).toContain('Nov')
  })
})

describe('GAME_CONSTANTS', () => {
  it('has 26 max turns', () => {
    expect(GAME_CONSTANTS.MAX_TURNS).toBe(26)
  })

  it('has 5 base action points', () => {
    expect(GAME_CONSTANTS.BASE_ACTION_POINTS).toBe(5)
  })
})
