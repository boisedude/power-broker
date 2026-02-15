import type { DemographicGroup, IssueKey, CampaignPhase } from './game.ts';

export type EventCategory = 'national' | 'local' | 'campaign' | 'opponent' | 'debate';

export type EventSeverity = 'minor' | 'moderate' | 'major' | 'crisis';

export interface GameEvent {
  id: string;
  category: EventCategory;
  title: string;
  description: string;
  severity: EventSeverity;
  phase_range: [CampaignPhase, CampaignPhase]; // when this event can fire
  turn_range?: [number, number];
  probability: number; // 0-1 chance per eligible turn
  one_time: boolean;
  prerequisites?: EventPrerequisite[];
  choices: EventChoice[];
}

export interface EventPrerequisite {
  type: 'poll_above' | 'poll_below' | 'cash_above' | 'cash_below' | 'has_endorsement' | 'has_staff' | 'momentum_above' | 'momentum_below';
  value: number | string;
}

export interface EventChoice {
  id: string;
  text: string;
  effects: EventEffect[];
  risk?: EventRisk;
}

export interface EventEffect {
  type: 'poll_change' | 'cash_change' | 'momentum_change' | 'demographic_change' | 'opponent_change' | 'gotv_change' | 'email_list_change' | 'staff_unlock';
  value: number;
  demographic?: DemographicGroup;
  issue?: IssueKey;
  description: string;
}

export interface EventRisk {
  probability: number;
  bad_outcome: EventEffect[];
  description: string;
}

export interface ActiveEvent {
  event: GameEvent;
  chosen?: string; // choice id
  resolved: boolean;
  turn: number;
}
