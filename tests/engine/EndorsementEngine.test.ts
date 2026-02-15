import { describe, it, expect } from 'vitest'
import { processEndorsements, applyEndorsementEffects, canPursueEndorsement } from '@/engine/EndorsementEngine.ts'
import type { Endorsement, DemographicData, PollState } from '@/types/game.ts'
import type { AllocatedAction } from '@/types/actions.ts'

function makeEndorsement(overrides: Partial<Endorsement> = {}): Endorsement {
  return {
    id: 'test-endorsement',
    name: 'Test Org',
    description: 'A test endorsement',
    demographic_effects: { 'suburban-families': 2, 'latino-hispanic': 1 },
    fundraising_bonus: 5000,
    credibility_bonus: 1,
    requirements: '',
    secured: false,
    pursued: false,
    turns_to_secure: 3,
    turns_pursued: 0,
    ...overrides,
  }
}

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

const dummyPolls: PollState = {
  player_support: 45,
  opponent_support: 45,
  undecided: 10,
  margin_of_error: 3,
  demographics: [],
  history: [],
}

describe('processEndorsements', () => {
  it('returns empty if no seek-endorsement actions', () => {
    const endorsements = [makeEndorsement({ pursued: true })]
    const result = processEndorsements(endorsements, [], dummyPolls)
    expect(result.secured).toEqual([])
    expect(result.progressed).toEqual([])
  })

  it('progresses a pursued endorsement', () => {
    const endorsements = [makeEndorsement({ pursued: true, turns_pursued: 0, turns_to_secure: 3 })]
    const actions: AllocatedAction[] = [{ type: 'seek-endorsement', intensity: 1 }]
    const result = processEndorsements(endorsements, actions, dummyPolls)

    expect(result.progressed.length).toBe(1)
    expect(result.secured.length).toBe(0)
    expect(endorsements[0].turns_pursued).toBe(1)
  })

  it('secures an endorsement when turns_pursued reaches turns_to_secure', () => {
    const endorsements = [makeEndorsement({ pursued: true, turns_pursued: 2, turns_to_secure: 3 })]
    const actions: AllocatedAction[] = [{ type: 'seek-endorsement', intensity: 1 }]
    const result = processEndorsements(endorsements, actions, dummyPolls)

    expect(result.secured.length).toBe(1)
    expect(result.secured[0].id).toBe('test-endorsement')
    expect(endorsements[0].secured).toBe(true)
  })

  it('ignores already-secured endorsements', () => {
    const endorsements = [makeEndorsement({ pursued: true, secured: true })]
    const actions: AllocatedAction[] = [{ type: 'seek-endorsement', intensity: 1 }]
    const result = processEndorsements(endorsements, actions, dummyPolls)

    expect(result.secured.length).toBe(0)
    expect(result.progressed.length).toBe(0)
  })

  it('ignores unpursued endorsements', () => {
    const endorsements = [makeEndorsement({ pursued: false })]
    const actions: AllocatedAction[] = [{ type: 'seek-endorsement', intensity: 1 }]
    const result = processEndorsements(endorsements, actions, dummyPolls)

    expect(result.secured.length).toBe(0)
    expect(result.progressed.length).toBe(0)
  })
})

describe('applyEndorsementEffects', () => {
  it('increases demographic support based on endorsement effects', () => {
    const endorsement = makeEndorsement({ demographic_effects: { 'suburban-families': 3 } })
    const demographics = [makeDemographic({ current_support: 45 })]

    applyEndorsementEffects(endorsement, demographics)
    expect(demographics[0].current_support).toBe(48)
  })

  it('clamps support to valid range', () => {
    const endorsement = makeEndorsement({ demographic_effects: { 'suburban-families': 60 } })
    const demographics = [makeDemographic({ current_support: 95 })]

    applyEndorsementEffects(endorsement, demographics)
    expect(demographics[0].current_support).toBe(100)
  })

  it('only affects demographics with defined effects', () => {
    const endorsement = makeEndorsement({ demographic_effects: { 'latino-hispanic': 5 } })
    const demographics = [makeDemographic({ current_support: 45 })]

    applyEndorsementEffects(endorsement, demographics)
    expect(demographics[0].current_support).toBe(45) // unchanged
  })
})

describe('canPursueEndorsement', () => {
  it('allows pursuing an unpursued, unsecured endorsement', () => {
    expect(canPursueEndorsement(makeEndorsement(), 45)).toBe(true)
  })

  it('rejects already-secured endorsements', () => {
    expect(canPursueEndorsement(makeEndorsement({ secured: true }), 45)).toBe(false)
  })

  it('rejects already-pursued endorsements', () => {
    expect(canPursueEndorsement(makeEndorsement({ pursued: true }), 45)).toBe(false)
  })

  it('rejects if 40% poll requirement not met', () => {
    expect(canPursueEndorsement(makeEndorsement({ requirements: '40%' }), 35)).toBe(false)
    expect(canPursueEndorsement(makeEndorsement({ requirements: '40%' }), 45)).toBe(true)
  })

  it('rejects if 43% poll requirement not met', () => {
    expect(canPursueEndorsement(makeEndorsement({ requirements: '43%' }), 40)).toBe(false)
    expect(canPursueEndorsement(makeEndorsement({ requirements: '43%' }), 45)).toBe(true)
  })
})
