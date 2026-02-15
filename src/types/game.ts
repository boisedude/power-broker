export type DifficultyLevel = 'safe-seat' | 'lean' | 'toss-up' | 'lean-away' | 'hostile';

export type CampaignPhase = 'primary' | 'early' | 'mid' | 'final' | 'election';

export type DemographicGroup =
  | 'suburban-families'
  | 'latino-hispanic'
  | 'asian-american'
  | 'retirees-seniors'
  | 'hospitality-workers'
  | 'rural-conservative'
  | 'veterans-military';

export type IssueKey =
  | 'water-drought'
  | 'housing-costs'
  | 'economy-cost-of-living'
  | 'immigration'
  | 'healthcare'
  | 'education';

export type ActionType =
  | 'fundraise'
  | 'campaign'
  | 'seek-endorsement'
  | 'oppo-research'
  | 'debate-prep'
  | 'gotv';

export type AdMedium = 'tv' | 'digital' | 'mailers' | 'radio';
export type AdTone = 'positive-bio' | 'positive-issue' | 'contrast' | 'attack';

export type StaffRole =
  | 'campaign-manager'
  | 'field-director'
  | 'comms-director'
  | 'finance-director'
  | 'digital-director'
  | 'pollster';

export interface DemographicData {
  id: DemographicGroup;
  name: string;
  electorate_pct: number;
  base_lean: number; // -100 (strong D) to +100 (strong R)
  persuadability: number; // 0-1
  key_issues: IssueKey[];
  current_support: number; // 0-100 for player
  opponent_support: number; // 0-100
}

export interface PollState {
  player_support: number;
  opponent_support: number;
  undecided: number;
  margin_of_error: number;
  demographics: DemographicData[];
  history: PollSnapshot[];
}

export interface PollSnapshot {
  turn: number;
  player_support: number;
  opponent_support: number;
  undecided: number;
}

export interface CampaignFinances {
  cash_on_hand: number;
  total_raised: number;
  total_spent: number;
  small_donors: number;
  large_donors: number;
  pac_money: number;
  online_income_rate: number; // per-turn passive income
  email_list_size: number;
  weekly_burn_rate: number;
  fundraising_history: FundraisingSnapshot[];
}

export interface FundraisingSnapshot {
  turn: number;
  raised: number;
  spent: number;
  cash_on_hand: number;
}

export interface AdCampaign {
  medium: AdMedium;
  tone: AdTone;
  budget: number;
  target_demographic?: DemographicGroup;
}

export interface StaffMember {
  id: string;
  role: StaffRole;
  name: string;
  cost: number; // weekly salary
  description: string;
  hired: boolean;
  available_turn: number;
}

export interface Endorsement {
  id: string;
  name: string;
  description: string;
  demographic_effects: Partial<Record<DemographicGroup, number>>;
  fundraising_bonus: number;
  credibility_bonus: number;
  requirements: string;
  secured: boolean;
  pursued: boolean;
  turns_to_secure: number;
  turns_pursued: number;
}

export interface GameState {
  game_id: string;
  difficulty: DifficultyLevel;
  current_turn: number;
  max_turns: number;
  phase: CampaignPhase;
  action_points: number;
  max_action_points: number;
  polls: PollState;
  finances: CampaignFinances;
  ads: AdCampaign[];
  staff: StaffMember[];
  endorsements: Endorsement[];
  opponent: OpponentState;
  momentum: number; // -10 to +10
  gotv_investment: number;
  actions_taken_this_turn: ActionType[];
  game_over: boolean;
  won: boolean | null;
  final_margin: number | null;
  seed: number;
}

export interface OpponentState {
  name: string;
  party: string;
  cash_on_hand: number;
  total_spent: number;
  approval_rating: number;
  attack_mode: boolean;
  endorsements_secured: string[];
  staff_level: number; // 1-5
  ad_spending: number;
  gotv_investment: number;
  strategy: OpponentStrategy;
}

export type OpponentStrategy = 'establishment' | 'aggressive' | 'defensive' | 'grassroots';

export interface DifficultyConfig {
  starting_cash: number;
  player_starting_support: number;
  opponent_starting_support: number;
  label: string;
  description: string;
}

export interface DistrictData {
  id: string;
  name: string;
  state: string;
  cook_pvi: string;
  population: number;
  median_income: number;
  key_areas: string[];
  urban_pct: number;
  suburban_pct: number;
  rural_pct: number;
  demographics: Omit<DemographicData, 'current_support' | 'opponent_support'>[];
  issues: IssueData[];
}

export interface IssueData {
  id: IssueKey;
  name: string;
  description: string;
  salience: number; // 0-1, how much voters care
  player_position?: string;
  opponent_position?: string;
}
