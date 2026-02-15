import { describe, it, expect } from 'vitest'
import { calculateAdCost, getAdCostPerWeek, calculateAdEffects } from '@/engine/AdvertisingEngine.ts'
import { GAME_CONSTANTS } from '@/engine/BalanceConstants.ts'
import { SeededRandom } from '@/engine/RandomUtils.ts'
import type { AdCampaign, StaffMember, DemographicData } from '@/types/game.ts'

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

describe('calculateAdCost', () => {
  it('sums budgets of all ad allocations', () => {
    const ads = [
      { medium: 'tv' as const, tone: 'positive-bio' as const, budget: 50000 },
      { medium: 'digital' as const, tone: 'contrast' as const, budget: 15000 },
    ]
    expect(calculateAdCost(ads)).toBe(65000)
  })

  it('returns 0 for empty ads', () => {
    expect(calculateAdCost([])).toBe(0)
  })
})

describe('getAdCostPerWeek', () => {
  it('returns correct cost for tv', () => {
    expect(getAdCostPerWeek('tv')).toBe(GAME_CONSTANTS.TV_COST_PER_WEEK)
  })

  it('returns correct cost for digital', () => {
    expect(getAdCostPerWeek('digital')).toBe(GAME_CONSTANTS.DIGITAL_COST_PER_WEEK)
  })

  it('returns correct cost for mailers', () => {
    expect(getAdCostPerWeek('mailers')).toBe(GAME_CONSTANTS.MAILER_COST_PER_WEEK)
  })

  it('returns correct cost for radio', () => {
    expect(getAdCostPerWeek('radio')).toBe(GAME_CONSTANTS.RADIO_COST_PER_WEEK)
  })
})

describe('calculateAdEffects', () => {
  const demos = [makeDemographic(), makeDemographic({ id: 'latino-hispanic', name: 'Latino/Hispanic', persuadability: 0.7 })]

  it('produces effects for each ad-demographic combination', () => {
    const ads: AdCampaign[] = [{ medium: 'tv', tone: 'positive-bio', budget: 50000 }]
    const effects = calculateAdEffects(ads, demos, [], new SeededRandom(42))
    expect(effects.length).toBeGreaterThan(0)
  })

  it('targeted ads only affect the targeted demographic', () => {
    const ads: AdCampaign[] = [{ medium: 'digital', tone: 'positive-issue', budget: 15000, target_demographic: 'suburban-families' }]
    const effects = calculateAdEffects(ads, demos, [], new SeededRandom(42))
    for (const effect of effects) {
      expect(effect.demographic).toBe('suburban-families')
    }
  })

  it('attack ads can cause backlash', () => {
    const ads: AdCampaign[] = [{ medium: 'tv', tone: 'attack', budget: 50000 }]
    // Run many seeds to find one with backlash
    let foundBacklash = false
    for (let seed = 0; seed < 100; seed++) {
      const effects = calculateAdEffects(ads, demos, [], new SeededRandom(seed))
      if (effects.some((e) => e.reason.includes('backlash'))) {
        foundBacklash = true
        const backlashEffect = effects.find((e) => e.reason.includes('backlash'))!
        expect(backlashEffect.player_change).toBeLessThan(0)
        break
      }
    }
    expect(foundBacklash).toBe(true)
  })

  it('contrast ads have higher effectiveness than positive', () => {
    const rng1 = new SeededRandom(42)
    const rng2 = new SeededRandom(42)

    const positive = calculateAdEffects(
      [{ medium: 'tv', tone: 'positive-bio', budget: 50000 }],
      [makeDemographic()], [], rng1,
    )
    const contrast = calculateAdEffects(
      [{ medium: 'tv', tone: 'contrast', budget: 50000 }],
      [makeDemographic()], [], rng2,
    )

    const posSum = positive.reduce((s, e) => s + Math.abs(e.player_change), 0)
    const conSum = contrast.reduce((s, e) => s + Math.abs(e.player_change), 0)
    expect(conSum).toBeGreaterThan(posSum)
  })

  it('budget multiplier scales effectiveness', () => {
    const rng1 = new SeededRandom(42)
    const rng2 = new SeededRandom(42)

    const low = calculateAdEffects(
      [{ medium: 'tv', tone: 'positive-bio', budget: 25000 }],
      [makeDemographic()], [], rng1,
    )
    const high = calculateAdEffects(
      [{ medium: 'tv', tone: 'positive-bio', budget: 100000 }],
      [makeDemographic()], [], rng2,
    )

    const lowSum = low.reduce((s, e) => s + e.player_change, 0)
    const highSum = high.reduce((s, e) => s + e.player_change, 0)
    expect(highSum).toBeGreaterThan(lowSum)
  })

  it('comms director increases ad reach', () => {
    const ads: AdCampaign[] = [{ medium: 'tv', tone: 'positive-bio', budget: 50000 }]
    const rng1 = new SeededRandom(42)
    const rng2 = new SeededRandom(42)

    const without = calculateAdEffects(ads, [makeDemographic()], [], rng1)
    const with_ = calculateAdEffects(ads, [makeDemographic()], makeStaff(['comms-director']), rng2)

    const noSum = without.reduce((s, e) => s + e.player_change, 0)
    const withSum = with_.reduce((s, e) => s + e.player_change, 0)
    expect(withSum).toBeGreaterThan(noSum)
  })

  it('digital director boosts digital ad targeting', () => {
    const ads: AdCampaign[] = [{ medium: 'digital', tone: 'positive-bio', budget: 15000 }]
    const rng1 = new SeededRandom(42)
    const rng2 = new SeededRandom(42)

    const without = calculateAdEffects(ads, [makeDemographic()], [], rng1)
    const with_ = calculateAdEffects(ads, [makeDemographic()], makeStaff(['digital-director']), rng2)

    const noSum = without.reduce((s, e) => s + e.player_change, 0)
    const withSum = with_.reduce((s, e) => s + e.player_change, 0)
    expect(withSum).toBeGreaterThan(noSum)
  })

  it('attack/contrast ads reduce opponent support', () => {
    const ads: AdCampaign[] = [{ medium: 'tv', tone: 'contrast', budget: 50000 }]
    const effects = calculateAdEffects(ads, [makeDemographic()], [], new SeededRandom(42))

    const nonBacklash = effects.filter((e) => !e.reason.includes('backlash'))
    expect(nonBacklash.some((e) => e.opponent_change < 0)).toBe(true)
  })
})
