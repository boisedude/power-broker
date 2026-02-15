import { describe, it, expect } from 'vitest'
import { calculatePollChanges } from '@/engine/PollingEngine.ts'
import { SeededRandom } from '@/engine/RandomUtils.ts'
import type { PollState, StaffMember, AdCampaign, DemographicData } from '@/types/game.ts'
import type { AllocatedAction } from '@/types/actions.ts'

function makeDemographic(overrides: Partial<DemographicData> = {}): DemographicData {
  return {
    id: 'suburban-families',
    name: 'Suburban Families',
    electorate_pct: 30,
    base_lean: 2,
    persuadability: 0.6,
    key_issues: ['housing-costs'],
    current_support: 45,
    opponent_support: 45,
    ...overrides,
  }
}

function makePolls(demographics?: DemographicData[]): PollState {
  const demos = demographics ?? [
    makeDemographic(),
    makeDemographic({ id: 'latino-hispanic', name: 'Latino/Hispanic', electorate_pct: 25, persuadability: 0.7, current_support: 40, opponent_support: 48 }),
  ]
  return {
    player_support: 45,
    opponent_support: 45,
    undecided: 10,
    margin_of_error: 3,
    demographics: demos,
    history: [{ turn: 0, player_support: 45, opponent_support: 45, undecided: 10 }],
  }
}

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

describe('calculatePollChanges', () => {
  it('returns unchanged polls with no actions or ads', () => {
    const polls = makePolls()
    const rng = new SeededRandom(42)
    const { changes } = calculatePollChanges(polls, [], [], 0, [], rng)
    // Only undecided decay should occur — no campaign/ad changes
    expect(changes.length).toBe(0)
  })

  it('campaign actions produce positive poll changes', () => {
    const polls = makePolls()
    const actions: AllocatedAction[] = [{ type: 'campaign', intensity: 2 }]
    const rng = new SeededRandom(42)
    const { changes, newPolls } = calculatePollChanges(polls, actions, [], 0, [], rng)

    const campaignChanges = changes.filter((c) => c.reason === 'Campaign outreach')
    expect(campaignChanges.length).toBeGreaterThan(0)
    // At least one demographic should have gained support
    expect(campaignChanges.some((c) => c.player_change > 0)).toBe(true)
  })

  it('targeted campaign action only affects the targeted demographic', () => {
    const polls = makePolls()
    const actions: AllocatedAction[] = [{ type: 'campaign', intensity: 2, target: 'suburban-families' }]
    const rng = new SeededRandom(42)
    const { changes } = calculatePollChanges(polls, actions, [], 0, [], rng)

    const campaignChanges = changes.filter((c) => c.reason === 'Campaign outreach')
    for (const change of campaignChanges) {
      expect(change.demographic).toBe('suburban-families')
    }
  })

  it('ads produce poll changes via AdvertisingEngine', () => {
    const polls = makePolls()
    const ads: AdCampaign[] = [{
      medium: 'tv',
      tone: 'positive-bio',
      budget: 50000,
      target_demographic: 'suburban-families',
    }]
    const rng = new SeededRandom(42)
    const { changes } = calculatePollChanges(polls, [], ads, 0, [], rng)

    expect(changes.some((c) => c.reason.includes('tv ad'))).toBe(true)
  })

  it('positive momentum increases player support', () => {
    const polls = makePolls()
    const rng1 = new SeededRandom(42)
    const rng2 = new SeededRandom(42)

    const { newPolls: noMomentum } = calculatePollChanges(polls, [], [], 0, [], rng1)
    const { newPolls: withMomentum } = calculatePollChanges(polls, [], [], 5, [], rng2)

    expect(withMomentum.player_support).toBeGreaterThan(noMomentum.player_support)
  })

  it('undecided decays each turn', () => {
    const polls = makePolls()
    const rng = new SeededRandom(42)
    const { newPolls } = calculatePollChanges(polls, [], [], 0, [], rng)

    expect(newPolls.undecided).toBeLessThan(polls.undecided)
    expect(newPolls.undecided).toBeGreaterThanOrEqual(2) // min clamp
  })

  it('comms director boosts ad effectiveness', () => {
    const polls = makePolls()
    const ads: AdCampaign[] = [{ medium: 'tv', tone: 'positive-bio', budget: 50000 }]

    const rng1 = new SeededRandom(42)
    const rng2 = new SeededRandom(42)

    const { changes: noDirector } = calculatePollChanges(polls, [], ads, 0, [], rng1)
    const { changes: withDirector } = calculatePollChanges(polls, [], ads, 0, makeStaff(['comms-director']), rng2)

    const noSum = noDirector.reduce((s, c) => s + c.player_change, 0)
    const withSum = withDirector.reduce((s, c) => s + c.player_change, 0)
    expect(withSum).toBeGreaterThan(noSum)
  })

  it('appends to poll history', () => {
    const polls = makePolls()
    const rng = new SeededRandom(42)
    const { newPolls } = calculatePollChanges(polls, [], [], 0, [], rng)

    expect(newPolls.history.length).toBe(polls.history.length + 1)
  })

  it('higher intensity produces larger poll changes', () => {
    const polls = makePolls()

    const rng1 = new SeededRandom(42)
    const rng2 = new SeededRandom(42)

    const { changes: low } = calculatePollChanges(polls, [{ type: 'campaign', intensity: 1 }], [], 0, [], rng1)
    const { changes: high } = calculatePollChanges(polls, [{ type: 'campaign', intensity: 3 }], [], 0, [], rng2)

    const lowSum = low.filter((c) => c.reason === 'Campaign outreach').reduce((s, c) => s + c.player_change, 0)
    const highSum = high.filter((c) => c.reason === 'Campaign outreach').reduce((s, c) => s + c.player_change, 0)
    expect(highSum).toBeGreaterThan(lowSum)
  })
})
