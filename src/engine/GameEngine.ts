import type { GameState, DemographicData, StaffMember, Endorsement } from '@/types/game.ts';
import type { TurnResult, Notification } from '@/types/engine.ts';
import type { AllocatedAction } from '@/types/actions.ts';
import { calculatePollChanges } from '@/engine/PollingEngine.ts';
import { calculateMomentum } from '@/engine/MomentumEngine.ts';
import { applyEndorsementEffects } from '@/engine/EndorsementEngine.ts';
import { GAME_CONSTANTS, getPhaseForTurn, DIFFICULTY_CONFIGS } from '@/engine/BalanceConstants.ts';
import { SeededRandom, createSeed } from '@/engine/RandomUtils.ts';
import { clamp } from '@/utils/formatters.ts';
import districtData from '@/data/districts/nv-03.json';
import staffData from '@/data/staff/staff.json';
import endorsementData from '@/data/endorsements/endorsements.json';
import opponentData from '@/data/opponents/susie-lee.json';
import type { DifficultyLevel } from '@/types/game.ts';

export function createInitialGameState(difficulty: DifficultyLevel): GameState {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const seed = createSeed();
  const district = districtData;

  const demographics: DemographicData[] = district.demographics.map((d) => ({
    ...d,
    id: d.id as DemographicData['id'],
    key_issues: d.key_issues as DemographicData['key_issues'],
    current_support: config.player_starting_support + (d.base_lean > 0 ? d.base_lean * 0.3 : d.base_lean * 0.2),
    opponent_support: config.opponent_starting_support + (d.base_lean < 0 ? Math.abs(d.base_lean) * 0.3 : -d.base_lean * 0.2),
  }));

  // Normalize so support + opponent + undecided = 100 per demographic
  for (const demo of demographics) {
    const total = demo.current_support + demo.opponent_support;
    if (total > 95) {
      const scale = 90 / total;
      demo.current_support *= scale;
      demo.opponent_support *= scale;
    }
  }

  const staff: StaffMember[] = (staffData as typeof staffData).map((s) => ({
    ...s,
    role: s.role as StaffMember['role'],
    hired: false,
  }));

  const endorsements: Endorsement[] = (endorsementData as typeof endorsementData).map((e) => ({
    ...e,
    demographic_effects: e.demographic_effects as Endorsement['demographic_effects'],
    secured: false,
    pursued: false,
    turns_pursued: 0,
  }));

  return {
    game_id: `game-${Date.now()}`,
    difficulty,
    current_turn: 1,
    max_turns: GAME_CONSTANTS.MAX_TURNS,
    phase: 'primary',
    action_points: GAME_CONSTANTS.BASE_ACTION_POINTS,
    max_action_points: GAME_CONSTANTS.BASE_ACTION_POINTS,
    polls: {
      player_support: config.player_starting_support,
      opponent_support: config.opponent_starting_support,
      undecided: 100 - config.player_starting_support - config.opponent_starting_support,
      margin_of_error: GAME_CONSTANTS.BASE_MARGIN_OF_ERROR,
      demographics,
      history: [{
        turn: 0,
        player_support: config.player_starting_support,
        opponent_support: config.opponent_starting_support,
        undecided: 100 - config.player_starting_support - config.opponent_starting_support,
      }],
    },
    finances: {
      cash_on_hand: config.starting_cash,
      total_raised: config.starting_cash,
      total_spent: 0,
      small_donors: 0,
      large_donors: 0,
      pac_money: 0,
      online_income_rate: GAME_CONSTANTS.ONLINE_INCOME_BASE_RATE,
      email_list_size: 1000,
      weekly_burn_rate: 0,
      fundraising_history: [],
    },
    ads: [],
    staff,
    endorsements,
    opponent: {
      name: opponentData.name,
      party: opponentData.party,
      cash_on_hand: opponentData.starting_cash,
      total_spent: 0,
      approval_rating: opponentData.starting_approval,
      attack_mode: false,
      endorsements_secured: [...opponentData.endorsements],
      staff_level: opponentData.staff_level,
      ad_spending: 30000,
      gotv_investment: 0,
      strategy: opponentData.strategy as GameState['opponent']['strategy'],
    },
    momentum: 0,
    gotv_investment: 0,
    actions_taken_this_turn: [],
    game_over: false,
    won: null,
    final_margin: null,
    seed,
  };
}

export function processTurn(state: GameState, actions: AllocatedAction[]): TurnResult {
  const rng = new SeededRandom(state.seed + state.current_turn * 1000);
  const notifications: Notification[] = [];
  const opponentActions: string[] = [];

  const hasCommsDirector = state.staff.some((s) => s.role === 'comms-director' && s.hired);
  const hasDigitalDirector = state.staff.some((s) => s.role === 'digital-director' && s.hired);
  const hasFinanceDirector = state.staff.some((s) => s.role === 'finance-director' && s.hired);
  // 1. Calculate poll changes from actions and ads
  const { changes: pollChanges } = calculatePollChanges(
    state.polls,
    actions,
    state.ads,
    state.momentum,
    hasCommsDirector,
    hasDigitalDirector,
    rng,
  );

  // 2. Process fundraising actions
  let income = state.finances.online_income_rate; // passive income
  const fundraiseActions = actions.filter((a) => a.type === 'fundraise');
  for (const action of fundraiseActions) {
    let amount = GAME_CONSTANTS.FUNDRAISE_BASE_AMOUNT * action.intensity;
    if (hasFinanceDirector) amount *= (1 + GAME_CONSTANTS.FINANCE_DIRECTOR_BONUS);
    income += amount;
  }

  // 3. Calculate expenses
  let expenses = 0;
  // Staff salaries
  for (const s of state.staff) {
    if (s.hired) expenses += s.cost;
  }
  // Ad spending
  for (const ad of state.ads) {
    expenses += ad.budget;
  }

  // 4. GOTV investment
  const gotvActions = actions.filter((a) => a.type === 'gotv');
  let gotvInvestment = 0;
  for (const action of gotvActions) {
    gotvInvestment += GAME_CONSTANTS.GOTV_BASE_INVESTMENT * action.intensity;
  }
  expenses += gotvInvestment;

  // 5. Endorsement progress
  let endorsementGained = false;
  const seekActions = actions.filter((a) => a.type === 'seek-endorsement');
  if (seekActions.length > 0) {
    for (const endorsement of state.endorsements) {
      if (endorsement.pursued && !endorsement.secured) {
        endorsement.turns_pursued += 1;
        if (endorsement.turns_pursued >= endorsement.turns_to_secure) {
          endorsement.secured = true;
          endorsementGained = true;
          applyEndorsementEffects(endorsement, state.polls.demographics);
          notifications.push({
            type: 'success',
            title: 'Endorsement Secured!',
            message: `${endorsement.name} has endorsed Steve Gonzalez.`,
          });
        }
      }
    }
  }

  // 6. Calculate momentum
  const totalPollChange = pollChanges.reduce((sum, c) => sum + c.player_change, 0) / Math.max(pollChanges.length, 1);
  const newMomentum = calculateMomentum(state.momentum, totalPollChange, 0, endorsementGained);

  // 7. Check phase change
  const newPhase = getPhaseForTurn(state.current_turn + 1);
  const phaseChanged = newPhase !== state.phase;
  if (phaseChanged) {
    notifications.push({
      type: 'info',
      title: 'New Campaign Phase',
      message: `Entering ${newPhase} phase.`,
    });
  }

  // 8. Financial summary
  const financialSummary = {
    income,
    expenses,
    net: income - expenses,
    breakdown: [
      { source: 'Fundraising', amount: income - state.finances.online_income_rate },
      { source: 'Online/Passive', amount: state.finances.online_income_rate },
      { source: 'Staff Salaries', amount: -(expenses - gotvInvestment - state.ads.reduce((s, a) => s + a.budget, 0)) },
      { source: 'Advertising', amount: -state.ads.reduce((s, a) => s + a.budget, 0) },
      { source: 'GOTV', amount: -gotvInvestment },
    ],
  };

  return {
    turn: state.current_turn,
    poll_changes: pollChanges,
    financial_summary: financialSummary,
    events_triggered: [],
    opponent_actions: opponentActions,
    momentum_change: newMomentum - state.momentum,
    phase_change: phaseChanged ? newPhase : undefined,
    notifications,
  };
}

export function applyTurnResult(state: GameState, result: TurnResult, actions: AllocatedAction[]): GameState {
  const newState = { ...state };
  const rng = new SeededRandom(state.seed + state.current_turn * 1000);

  // Apply polling changes
  const hasCommsDirector = state.staff.some((s) => s.role === 'comms-director' && s.hired);
  const hasDigitalDirector = state.staff.some((s) => s.role === 'digital-director' && s.hired);
  const { newPolls } = calculatePollChanges(state.polls, actions, state.ads, state.momentum, hasCommsDirector, hasDigitalDirector, rng);
  newState.polls = newPolls;

  // Apply finances
  newState.finances = {
    ...state.finances,
    cash_on_hand: state.finances.cash_on_hand + result.financial_summary.net,
    total_raised: state.finances.total_raised + result.financial_summary.income,
    total_spent: state.finances.total_spent + result.financial_summary.expenses,
    weekly_burn_rate: result.financial_summary.expenses,
    fundraising_history: [
      ...state.finances.fundraising_history,
      {
        turn: state.current_turn,
        raised: result.financial_summary.income,
        spent: result.financial_summary.expenses,
        cash_on_hand: state.finances.cash_on_hand + result.financial_summary.net,
      },
    ],
  };

  // Apply momentum
  newState.momentum = clamp(
    state.momentum + result.momentum_change,
    GAME_CONSTANTS.MOMENTUM_MIN,
    GAME_CONSTANTS.MOMENTUM_MAX,
  );

  // GOTV
  const gotvActions = actions.filter((a) => a.type === 'gotv');
  for (const action of gotvActions) {
    newState.gotv_investment += GAME_CONSTANTS.GOTV_BASE_INVESTMENT * action.intensity;
  }

  // Advance turn
  newState.current_turn += 1;
  newState.phase = getPhaseForTurn(newState.current_turn);
  newState.action_points = GAME_CONSTANTS.BASE_ACTION_POINTS;
  if (state.staff.some((s) => s.role === 'campaign-manager' && s.hired)) {
    newState.action_points += GAME_CONSTANTS.CAMPAIGN_MANAGER_BONUS_AP;
  }
  newState.actions_taken_this_turn = [];

  // Check game over
  if (newState.current_turn > GAME_CONSTANTS.MAX_TURNS) {
    newState.game_over = true;
  }

  // Update seed for next turn
  newState.seed = rng.getSeed();

  return newState;
}
