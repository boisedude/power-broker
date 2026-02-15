import type { ActionType, AdMedium, AdTone, DemographicGroup, StaffRole } from './game.ts';

export interface ActionDefinition {
  type: ActionType;
  name: string;
  description: string;
  ap_cost: number;
  icon: string;
  available_phase?: string[];
  cooldown?: number;
}

export interface AllocatedAction {
  type: ActionType;
  target?: DemographicGroup;
  intensity: number; // 1-3 AP invested
}

export interface AdAllocation {
  medium: AdMedium;
  tone: AdTone;
  budget: number;
  target?: DemographicGroup;
}

export interface StaffHireAction {
  role: StaffRole;
  staff_id: string;
}

export interface TurnActions {
  actions: AllocatedAction[];
  ads: AdAllocation[];
  total_ap_spent: number;
  total_ad_spend: number;
}
