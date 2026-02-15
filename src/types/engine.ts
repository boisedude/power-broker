import type { DemographicGroup } from './game.ts';
import type { ActiveEvent } from './events.ts';

export interface TurnResult {
  turn: number;
  poll_changes: PollChange[];
  financial_summary: FinancialSummary;
  events_triggered: ActiveEvent[];
  opponent_actions: string[];
  momentum_change: number;
  phase_change?: string;
  notifications: Notification[];
}

export interface PollChange {
  demographic: DemographicGroup;
  player_change: number;
  opponent_change: number;
  reason: string;
}

export interface FinancialSummary {
  income: number;
  expenses: number;
  net: number;
  breakdown: { source: string; amount: number }[];
}

export interface Notification {
  type: 'info' | 'success' | 'warning' | 'danger';
  title: string;
  message: string;
}

export interface ElectionResult {
  player_votes: number;
  opponent_votes: number;
  player_pct: number;
  opponent_pct: number;
  margin: number;
  winner: 'player' | 'opponent';
  recount: boolean;
  turnout: number;
  demographic_breakdown: DemographicResult[];
}

export interface DemographicResult {
  demographic: DemographicGroup;
  player_pct: number;
  opponent_pct: number;
  turnout_pct: number;
}

export interface PostGameScore {
  victory: boolean;
  margin: number;
  funds_remaining: number;
  endorsements_won: number;
  total_endorsements: number;
  events_handled: number;
  approval_peak: number;
  final_grade: string; // A+ through F
  total_score: number;
}
