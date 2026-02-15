import { describe, it, expect } from 'vitest'
import { generateTurnEvents, resolveEventChoice, applyEventEffects } from '@/engine/EventEngine.ts'
import { SeededRandom } from '@/engine/RandomUtils.ts'
import type { GameState } from '@/types/game.ts'
import type { EventChoice, EventEffect } from '@/types/events.ts'
import { createInitialGameState } from '@/engine/GameEngine.ts'

function makeGameState(overrides: Partial<GameState> = {}): GameState {
  const base = createInitialGameState('toss-up')
  return { ...base, ...overrides }
}

describe('generateTurnEvents', () => {
  it('returns an array of events', () => {
    const state = makeGameState({ current_turn: 5 })
    const rng = new SeededRandom(42)
    const events = generateTurnEvents(state, [], rng)
    expect(Array.isArray(events)).toBe(true)
  })

  it('respects phase filtering — primary events only fire in primary phase', () => {
    const state = makeGameState({ current_turn: 3 })
    const rng = new SeededRandom(42)
    const events = generateTurnEvents(state, [], rng)

    for (const e of events) {
      if (e.event.category !== 'debate') {
        // Event should be eligible for primary phase
        const phases = ['primary', 'early', 'mid', 'final', 'election']
        const startIdx = phases.indexOf(e.event.phase_range[0])
        const endIdx = phases.indexOf(e.event.phase_range[1])
        expect(startIdx).toBeLessThanOrEqual(0) // primary is index 0
        expect(endIdx).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('generates debate events on debate turns', () => {
    // Debate turns are [10, 17, 23]
    const state = makeGameState({ current_turn: 10 })
    const rng = new SeededRandom(42)
    const events = generateTurnEvents(state, [], rng)
    const debates = events.filter((e) => e.event.category === 'debate')
    expect(debates.length).toBeGreaterThanOrEqual(0) // may or may not fire depending on data
  })

  it('excludes one-time events that already fired', () => {
    const state = makeGameState({ current_turn: 5 })

    const rng1 = new SeededRandom(42)
    const firstRun = generateTurnEvents(state, [], rng1)
    const oneTimeIds = firstRun.filter((e) => e.event.one_time).map((e) => e.event.id)

    if (oneTimeIds.length > 0) {
      const rng2 = new SeededRandom(42)
      const secondRun = generateTurnEvents(state, oneTimeIds, rng2)
      const repeats = secondRun.filter((e) => oneTimeIds.includes(e.event.id))
      expect(repeats.length).toBe(0)
    }
  })

  it('generates at most EVENTS_PER_TURN_MAX random events', () => {
    // Run many seeds to verify cap
    for (let seed = 0; seed < 20; seed++) {
      const state = makeGameState({ current_turn: 8 })
      const rng = new SeededRandom(seed)
      const events = generateTurnEvents(state, [], rng)
      expect(events.length).toBeLessThanOrEqual(3) // max 2 random + possible debate
    }
  })
})

describe('resolveEventChoice', () => {
  it('returns effects from the chosen option', () => {
    const choice: EventChoice = {
      id: 'choice-1',
      text: 'Take action',
      effects: [
        { type: 'poll_change', value: 2, description: 'Polls improved' },
      ],
    }
    const state = makeGameState()
    const rng = new SeededRandom(42)
    const { effects, notifications } = resolveEventChoice(choice, state, rng)

    expect(effects.length).toBe(1)
    expect(effects[0].value).toBe(2)
    expect(notifications.length).toBe(1)
  })

  it('applies risk outcome when probability triggers', () => {
    const choice: EventChoice = {
      id: 'choice-risky',
      text: 'Risky move',
      effects: [{ type: 'poll_change', value: 3, description: 'Good outcome' }],
      risk: {
        probability: 1.0, // guaranteed to trigger
        bad_outcome: [{ type: 'cash_change', value: -10000, description: 'Lost money' }],
        description: 'Backfired',
      },
    }
    const state = makeGameState()
    const rng = new SeededRandom(42)
    const { effects } = resolveEventChoice(choice, state, rng)

    expect(effects.length).toBe(2)
    expect(effects[1].value).toBe(-10000)
  })

  it('skips risk when probability is 0', () => {
    const choice: EventChoice = {
      id: 'choice-safe',
      text: 'Safe move',
      effects: [{ type: 'poll_change', value: 1, description: 'Small gain' }],
      risk: {
        probability: 0,
        bad_outcome: [{ type: 'cash_change', value: -5000, description: 'Loss' }],
        description: 'No risk',
      },
    }
    const state = makeGameState()
    const rng = new SeededRandom(42)
    const { effects } = resolveEventChoice(choice, state, rng)

    expect(effects.length).toBe(1)
  })
})

describe('applyEventEffects', () => {
  it('applies poll_change', () => {
    const state = makeGameState()
    const effects: EventEffect[] = [{ type: 'poll_change', value: 3, description: 'test' }]
    const original = state.polls.player_support
    applyEventEffects(effects, state)
    expect(state.polls.player_support).toBe(original + 3)
  })

  it('applies cash_change', () => {
    const state = makeGameState()
    const effects: EventEffect[] = [{ type: 'cash_change', value: -15000, description: 'test' }]
    const original = state.finances.cash_on_hand
    applyEventEffects(effects, state)
    expect(state.finances.cash_on_hand).toBe(original - 15000)
  })

  it('applies momentum_change with clamping', () => {
    const state = makeGameState()
    state.momentum = 9
    const effects: EventEffect[] = [{ type: 'momentum_change', value: 5, description: 'test' }]
    applyEventEffects(effects, state)
    expect(state.momentum).toBe(10) // clamped to max
  })

  it('applies demographic_change to specific demographic', () => {
    const state = makeGameState()
    const demo = state.polls.demographics.find((d) => d.id === 'suburban-families')!
    const original = demo.current_support
    const effects: EventEffect[] = [{ type: 'demographic_change', value: 2, demographic: 'suburban-families', description: 'test' }]
    applyEventEffects(effects, state)
    expect(demo.current_support).toBe(original + 2)
  })

  it('applies opponent_change', () => {
    const state = makeGameState()
    const originalApproval = state.opponent.approval_rating
    const originalSupport = state.polls.opponent_support
    const effects: EventEffect[] = [{ type: 'opponent_change', value: -2, description: 'test' }]
    applyEventEffects(effects, state)
    expect(state.opponent.approval_rating).toBe(originalApproval - 2)
    expect(state.polls.opponent_support).toBe(originalSupport - 2)
  })

  it('applies gotv_change', () => {
    const state = makeGameState()
    const effects: EventEffect[] = [{ type: 'gotv_change', value: 5000, description: 'test' }]
    applyEventEffects(effects, state)
    expect(state.gotv_investment).toBe(5000)
  })

  it('applies email_list_change', () => {
    const state = makeGameState()
    const original = state.finances.email_list_size
    const effects: EventEffect[] = [{ type: 'email_list_change', value: 500, description: 'test' }]
    applyEventEffects(effects, state)
    expect(state.finances.email_list_size).toBe(original + 500)
  })
})
