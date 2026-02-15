import { describe, it, expect } from 'vitest'
import { calculateFundraising } from '@/engine/FundraisingEngine.ts'
import { SeededRandom } from '@/engine/RandomUtils.ts'
import type { CampaignFinances, StaffMember } from '@/types/game.ts'
import type { AllocatedAction } from '@/types/actions.ts'

function makeFinances(overrides: Partial<CampaignFinances> = {}): CampaignFinances {
  return {
    cash_on_hand: 200000,
    total_raised: 200000,
    total_spent: 0,
    small_donors: 0,
    large_donors: 0,
    pac_money: 0,
    online_income_rate: 2000,
    email_list_size: 1000,
    weekly_burn_rate: 0,
    fundraising_history: [],
    ...overrides,
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

describe('calculateFundraising', () => {
  it('returns online income even with no fundraise actions', () => {
    const result = calculateFundraising(makeFinances(), [], [], 0, 1, new SeededRandom(42))
    expect(result.online_income).toBeGreaterThan(0)
    expect(result.small_donors).toBe(0)
    expect(result.large_donors).toBe(0)
    expect(result.total_raised).toBe(result.online_income)
  })

  it('fundraise actions generate small and large donor income', () => {
    const actions: AllocatedAction[] = [{ type: 'fundraise', intensity: 2 }]
    const result = calculateFundraising(makeFinances(), actions, [], 0, 1, new SeededRandom(42))

    expect(result.small_donors).toBeGreaterThan(0)
    expect(result.large_donors).toBeGreaterThan(0)
    expect(result.total_raised).toBeGreaterThan(result.online_income)
  })

  it('finance director provides bonus to fundraising', () => {
    const actions: AllocatedAction[] = [{ type: 'fundraise', intensity: 2 }]
    const rng1 = new SeededRandom(42)
    const rng2 = new SeededRandom(42)

    const without = calculateFundraising(makeFinances(), actions, [], 0, 1, rng1)
    const with_ = calculateFundraising(makeFinances(), actions, makeStaff(['finance-director']), 0, 1, rng2)

    expect(with_.total_raised).toBeGreaterThan(without.total_raised)
  })

  it('digital director boosts online income', () => {
    const rng1 = new SeededRandom(42)
    const rng2 = new SeededRandom(42)

    const without = calculateFundraising(makeFinances(), [], [], 0, 1, rng1)
    const with_ = calculateFundraising(makeFinances(), [], makeStaff(['digital-director']), 0, 1, rng2)

    expect(with_.online_income).toBeGreaterThan(without.online_income)
  })

  it('positive momentum boosts fundraising', () => {
    const actions: AllocatedAction[] = [{ type: 'fundraise', intensity: 2 }]
    const rng1 = new SeededRandom(42)
    const rng2 = new SeededRandom(42)

    const noMomentum = calculateFundraising(makeFinances(), actions, [], 0, 1, rng1)
    const withMomentum = calculateFundraising(makeFinances(), actions, [], 5, 1, rng2)

    expect(withMomentum.total_raised).toBeGreaterThan(noMomentum.total_raised)
  })

  it('email list grows with each fundraise action', () => {
    const actions: AllocatedAction[] = [
      { type: 'fundraise', intensity: 1 },
      { type: 'fundraise', intensity: 1 },
    ]
    const result = calculateFundraising(makeFinances(), actions, [], 0, 1, new SeededRandom(42))
    expect(result.email_list_growth).toBe(1000) // 500 per action * 2
  })

  it('PAC money unlocks at 2+ endorsements', () => {
    const rng1 = new SeededRandom(42)
    const rng2 = new SeededRandom(42)

    const noPAC = calculateFundraising(makeFinances(), [], [], 0, 1, rng1, 1)
    const withPAC = calculateFundraising(makeFinances(), [], [], 0, 1, rng2, 2)

    expect(noPAC.pac_money).toBe(0)
    expect(withPAC.pac_money).toBeGreaterThan(0)
  })

  it('PAC money scales up to 5 endorsements', () => {
    const rng1 = new SeededRandom(42)
    const rng2 = new SeededRandom(42)

    const at3 = calculateFundraising(makeFinances(), [], [], 0, 1, rng1, 3)
    const at5 = calculateFundraising(makeFinances(), [], [], 0, 1, rng2, 5)

    expect(at5.pac_money).toBeGreaterThan(at3.pac_money)
  })

  it('large donors have diminishing returns', () => {
    const actions: AllocatedAction[] = [{ type: 'fundraise', intensity: 2 }]
    const rng1 = new SeededRandom(42)
    const rng2 = new SeededRandom(42)

    const fresh = calculateFundraising(makeFinances(), actions, [], 0, 1, rng1)
    const saturated = calculateFundraising(makeFinances({ large_donors: 500000 }), actions, [], 0, 1, rng2)

    expect(saturated.large_donors).toBeLessThan(fresh.large_donors)
  })
})
