import type { GameState, DifficultyLevel, AdCampaign, ActionType, StaffRole } from './game.ts';
import type { ActiveEvent } from './events.ts';
import type { TurnResult } from './engine.ts';
import type { AllocatedAction, AdAllocation } from './actions.ts';

export interface TurnSlice {
  current_turn: number;
  max_turns: number;
  phase: GameState['phase'];
  actions_remaining: number;
  turn_phase: 'briefing' | 'events' | 'actions' | 'ads' | 'resolution';
  last_turn_result: TurnResult | null;
  advanceTurnPhase: () => void;
  setTurnPhase: (phase: TurnSlice['turn_phase']) => void;
}

export interface CampaignSlice {
  finances: GameState['finances'];
  staff: GameState['staff'];
  endorsements: GameState['endorsements'];
  ads: AdCampaign[];
  momentum: number;
  gotv_investment: number;
  actions_taken: ActionType[];
  allocateAction: (action: AllocatedAction) => void;
  setAds: (ads: AdAllocation[]) => void;
  hireStaff: (role: StaffRole) => void;
  pursueEndorsement: (id: string) => void;
}

export interface PollingSlice {
  polls: GameState['polls'];
  getLeadingCandidate: () => 'player' | 'opponent' | 'tied';
  getMargin: () => number;
  getDemographicSupport: (demographic: GameState['polls']['demographics'][0]['id']) => { player: number; opponent: number };
}

export interface OpponentSlice {
  opponent: GameState['opponent'];
  updateOpponent: (updates: Partial<GameState['opponent']>) => void;
}

export interface EventSlice {
  active_events: ActiveEvent[];
  event_history: ActiveEvent[];
  current_event_index: number;
  addEvent: (event: ActiveEvent) => void;
  resolveEvent: (eventId: string, choiceId: string) => void;
  clearActiveEvents: () => void;
}

export interface UISlice {
  screen: string;
  modal_open: boolean;
  modal_content: string | null;
  notifications: { id: string; type: string; message: string }[];
  setScreen: (screen: string) => void;
  openModal: (content: string) => void;
  closeModal: () => void;
  addNotification: (notification: UISlice['notifications'][0]) => void;
  clearNotifications: () => void;
}

export interface SettingsSlice {
  sound_enabled: boolean;
  animations_enabled: boolean;
  auto_save: boolean;
  toggleSound: () => void;
  toggleAnimations: () => void;
  toggleAutoSave: () => void;
}

export type GameStore = {
  game_id: string;
  difficulty: DifficultyLevel;
  game_over: boolean;
  won: boolean | null;
  seed: number;
  initialized: boolean;
  startNewGame: (difficulty: DifficultyLevel) => void;
  endTurn: () => void;
  resetGame: () => void;
} & TurnSlice & CampaignSlice & PollingSlice & OpponentSlice & EventSlice & UISlice & SettingsSlice;
