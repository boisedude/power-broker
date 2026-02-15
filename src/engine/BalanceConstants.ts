import type { DifficultyLevel, DifficultyConfig } from '@/types/game.ts';

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  'safe-seat': {
    starting_cash: 500000,
    player_starting_support: 52,
    opponent_starting_support: 40,
    label: 'Safe Seat',
    description: 'Tutorial mode — comfortable lead',
  },
  'lean': {
    starting_cash: 300000,
    player_starting_support: 48,
    opponent_starting_support: 44,
    label: 'Lean',
    description: 'Standard difficulty — slight edge',
  },
  'toss-up': {
    starting_cash: 200000,
    player_starting_support: 45,
    opponent_starting_support: 45,
    label: 'Toss-Up',
    description: 'Fair fight — dead even',
  },
  'lean-away': {
    starting_cash: 150000,
    player_starting_support: 42,
    opponent_starting_support: 48,
    label: 'Lean Away',
    description: 'Uphill battle — trailing from the start',
  },
  'hostile': {
    starting_cash: 100000,
    player_starting_support: 38,
    opponent_starting_support: 50,
    label: 'Hostile',
    description: 'Near-impossible — for experts only',
  },
};

export const GAME_CONSTANTS = {
  MAX_TURNS: 26,
  BASE_ACTION_POINTS: 5,
  CAMPAIGN_MANAGER_BONUS_AP: 1,

  // Polling
  BASE_MARGIN_OF_ERROR: 3,
  POLLSTER_MARGIN_OF_ERROR: 1.5,
  MAX_POLL_SWING_PER_TURN: 3,
  UNDECIDED_DECAY_RATE: 0.02, // undecideds shrink each turn

  // Fundraising
  FUNDRAISE_BASE_AMOUNT: 25000,
  SMALL_DONOR_BASE: 5000,
  LARGE_DONOR_BASE: 15000,
  LARGE_DONOR_DIMINISHING_FACTOR: 0.85,
  PAC_MONEY_BASE: 30000,
  ONLINE_INCOME_BASE_RATE: 2000,
  EMAIL_LIST_GROWTH_PER_FUNDRAISE: 500,
  FINANCE_DIRECTOR_BONUS: 0.3,
  DIGITAL_DIRECTOR_ONLINE_BONUS: 0.2,

  // Advertising
  TV_COST_PER_WEEK: 50000,
  DIGITAL_COST_PER_WEEK: 15000,
  MAILER_COST_PER_WEEK: 8000,
  RADIO_COST_PER_WEEK: 12000,
  TV_REACH: 0.4,
  DIGITAL_REACH: 0.25,
  MAILER_REACH: 0.15,
  RADIO_REACH: 0.2,
  COMMS_DIRECTOR_AD_BONUS: 0.25,
  DIGITAL_DIRECTOR_TARGETING_BONUS: 0.35,
  ATTACK_AD_BACKLASH_CHANCE: 0.3,
  ATTACK_AD_BACKLASH_PENALTY: -1,

  // Campaigning
  CAMPAIGN_BASE_POLL_BOOST: 0.5,
  CAMPAIGN_DIMINISHING_FACTOR: 0.7,

  // GOTV
  GOTV_BASE_INVESTMENT: 10000,
  GOTV_TURNOUT_MULTIPLIER: 0.5,
  FIELD_DIRECTOR_GOTV_BONUS: 0.4,
  GOTV_AVAILABLE_TURN: 21,

  // Opponent
  OPPONENT_BASE_FUNDRAISING: 45000,
  OPPONENT_ATTACK_POLL_EFFECT: -1.5,
  INCUMBENT_NAME_RECOGNITION_BONUS: 0.85,
  OPPONENT_ADAPTATION_THRESHOLD: -3,

  // Momentum
  MOMENTUM_MAX: 10,
  MOMENTUM_MIN: -10,
  MOMENTUM_DECAY: 0.2,
  MOMENTUM_POLL_EFFECT: 0.3,

  // Election
  ELECTION_DAY_VARIANCE: 2,
  RECOUNT_THRESHOLD: 2,
  GOTV_FINAL_EFFECT_MAX: 3,

  // Staff
  STAFF_WEEKLY_COST_MULTIPLIER: 1,

  // Events
  EVENTS_PER_TURN_MIN: 0,
  EVENTS_PER_TURN_MAX: 2,
  DEBATE_TURNS: [10, 17, 23],
} as const;

export const PHASE_RANGES = {
  primary: { start: 1, end: 6 },
  early: { start: 7, end: 14 },
  mid: { start: 15, end: 20 },
  final: { start: 21, end: 26 },
  election: { start: 27, end: 27 },
} as const;

export function getPhaseForTurn(turn: number): 'primary' | 'early' | 'mid' | 'final' | 'election' {
  if (turn <= 6) return 'primary';
  if (turn <= 14) return 'early';
  if (turn <= 20) return 'mid';
  if (turn <= 26) return 'final';
  return 'election';
}

export function getTurnDate(turn: number): string {
  const startDate = new Date(2026, 5, 1); // June 1
  const date = new Date(startDate);
  date.setDate(date.getDate() + (turn - 1) * 7);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
