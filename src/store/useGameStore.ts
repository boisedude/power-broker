import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { indexedDBStorage } from '@/store/middleware/indexedDBStorage.ts';
import { createTurnSlice } from '@/store/slices/turnSlice.ts';
import { createCampaignSlice } from '@/store/slices/campaignSlice.ts';
import { createPollingSlice } from '@/store/slices/pollingSlice.ts';
import { createOpponentSlice } from '@/store/slices/opponentSlice.ts';
import { createEventSlice } from '@/store/slices/eventSlice.ts';
import { createUISlice } from '@/store/slices/uiSlice.ts';
import { createSettingsSlice } from '@/store/slices/settingsSlice.ts';
import { createInitialGameState, processTurn, applyTurnResult } from '@/engine/GameEngine.ts';
import { generateTurnEvents } from '@/engine/EventEngine.ts';
import { processOpponentTurn, getOpponentPollEffect } from '@/engine/OpponentAI.ts';
import { SeededRandom } from '@/engine/RandomUtils.ts';
import { clamp } from '@/utils/formatters.ts';
import type { GameStore } from '@/types/store.ts';
import type { DifficultyLevel } from '@/types/game.ts';

export const useGameStore = create<GameStore>()(
  persist(
    immer((...a) => {
      const [set, get] = a;
      return {
        // Root state
        game_id: '',
        difficulty: 'toss-up' as DifficultyLevel,
        game_over: false,
        won: null,
        seed: 0,
        initialized: false,

        // Slices
        ...createTurnSlice(...a),
        ...createCampaignSlice(...a),
        ...createPollingSlice(...a),
        ...createOpponentSlice(...a),
        ...createEventSlice(...a),
        ...createUISlice(...a),
        ...createSettingsSlice(...a),

        // Root actions
        startNewGame: (difficulty: DifficultyLevel) => {
          const gameState = createInitialGameState(difficulty);
          set((state) => {
            state.game_id = gameState.game_id;
            state.difficulty = difficulty;
            state.seed = gameState.seed;
            state.initialized = true;
            state.game_over = false;
            state.won = null;

            // Turn state
            state.current_turn = gameState.current_turn;
            state.max_turns = gameState.max_turns;
            state.phase = gameState.phase;
            state.actions_remaining = gameState.action_points;
            state.turn_phase = 'briefing';
            state.last_turn_result = null;

            // Campaign state
            state.finances = gameState.finances;
            state.staff = gameState.staff;
            state.endorsements = gameState.endorsements;
            state.ads = gameState.ads;
            state.momentum = gameState.momentum;
            state.gotv_investment = gameState.gotv_investment;
            state.actions_taken = [];

            // Polling state
            state.polls = gameState.polls;

            // Opponent state
            state.opponent = gameState.opponent;

            // Events
            state.active_events = [];
            state.event_history = [];
            state.current_event_index = 0;

            // UI
            state.notifications = [];
          });
        },

        endTurn: () => {
          const state = get();

          // Build game state for engine
          const gameState = storeToGameState(state);
          const actions = state.actions_taken.map((type) => ({
            type,
            intensity: 1,
          }));

          // 1. Process player's turn (polls, fundraising, etc.)
          const result = processTurn(gameState, actions);
          const newGameState = applyTurnResult(gameState, result, actions);

          // 2. Process opponent AI (deep copy to avoid mutation)
          const rng = new SeededRandom(state.seed + state.current_turn * 2000);
          const opponentCopy = {
            ...state.opponent,
            endorsements_secured: [...state.opponent.endorsements_secured],
          };
          const opponentResult = processOpponentTurn(
            opponentCopy,
            state.polls.player_support,
            state.polls.opponent_support,
            state.current_turn,
            rng,
          );

          // 3. Generate events for next turn
          // Include both archived history AND current active events in the history check
          const eventRng = new SeededRandom(state.seed + (state.current_turn + 1) * 3000);
          const historyIds = [
            ...state.event_history.map((e) => e.event.id),
            ...state.active_events.map((e) => e.event.id),
          ];
          const newEvents = generateTurnEvents(newGameState, historyIds, eventRng);

          set((s) => {
            // Apply new game state
            s.current_turn = newGameState.current_turn;
            s.phase = newGameState.phase;
            s.actions_remaining = newGameState.action_points;
            s.turn_phase = newEvents.length > 0 ? 'events' : 'briefing';
            s.last_turn_result = {
              ...result,
              opponent_actions: opponentResult.actions,
            };

            s.polls = newGameState.polls;

            // Apply opponent poll effect at demographic level so it survives recalculation
            const oppEffect = getOpponentPollEffect(opponentResult, s.polls.opponent_support);
            for (const demo of s.polls.demographics) {
              demo.opponent_support = clamp(demo.opponent_support + oppEffect, 0, 100);
            }
            s.polls.opponent_support = clamp(s.polls.opponent_support + oppEffect, 0, 100);

            s.finances = newGameState.finances;
            s.momentum = newGameState.momentum;
            s.gotv_investment = newGameState.gotv_investment;
            s.actions_taken = [];
            s.seed = newGameState.seed;

            // Apply opponent state from the mutated copy
            s.opponent.cash_on_hand = opponentCopy.cash_on_hand;
            s.opponent.total_spent = opponentCopy.total_spent;
            s.opponent.strategy = opponentCopy.strategy;
            s.opponent.attack_mode = opponentCopy.attack_mode;
            s.opponent.gotv_investment = opponentCopy.gotv_investment;
            s.opponent.ad_spending = opponentCopy.ad_spending;
            s.opponent.endorsements_secured = opponentCopy.endorsements_secured;

            // Set up events for the new turn
            s.event_history.push(...s.active_events.filter((e) => e.resolved));
            s.active_events = newEvents;
            s.current_event_index = 0;

            // Check game over
            if (newGameState.game_over) {
              s.game_over = true;
              const margin = s.polls.player_support - s.polls.opponent_support;
              s.won = margin > 0;
            }

            s.notifications = [
              ...result.notifications,
              ...opponentResult.actions.map((a) => ({
                type: 'info' as const,
                title: 'Opponent',
                message: a,
              })),
            ].map((n, i) => ({
              id: `notif-${Date.now()}-${i}`,
              type: n.type,
              message: `${n.title}: ${n.message}`,
            }));
          });
        },

        resetGame: () => {
          set((state) => {
            state.game_id = '';
            state.initialized = false;
            state.game_over = false;
            state.won = null;
            state.current_turn = 1;
            state.actions_remaining = 5;
            state.turn_phase = 'briefing';
            state.active_events = [];
            state.event_history = [];
            state.notifications = [];
          });
        },
      };
    }),
    {
      name: 'power-broker-save',
      storage: createJSONStorage(() => indexedDBStorage),
      partialize: (state) => ({
        game_id: state.game_id,
        difficulty: state.difficulty,
        game_over: state.game_over,
        won: state.won,
        seed: state.seed,
        initialized: state.initialized,
        current_turn: state.current_turn,
        max_turns: state.max_turns,
        phase: state.phase,
        actions_remaining: state.actions_remaining,
        turn_phase: state.turn_phase,
        finances: state.finances,
        staff: state.staff,
        endorsements: state.endorsements,
        ads: state.ads,
        momentum: state.momentum,
        gotv_investment: state.gotv_investment,
        polls: state.polls,
        opponent: state.opponent,
        event_history: state.event_history,
        sound_enabled: state.sound_enabled,
        animations_enabled: state.animations_enabled,
        auto_save: state.auto_save,
      }),
    },
  ),
);

function storeToGameState(store: GameStore) {
  return {
    game_id: store.game_id,
    difficulty: store.difficulty,
    current_turn: store.current_turn,
    max_turns: store.max_turns,
    phase: store.phase,
    action_points: store.actions_remaining,
    max_action_points: store.actions_remaining,
    polls: store.polls,
    finances: store.finances,
    ads: store.ads,
    staff: store.staff,
    endorsements: store.endorsements,
    opponent: store.opponent,
    momentum: store.momentum,
    gotv_investment: store.gotv_investment,
    actions_taken_this_turn: store.actions_taken,
    game_over: store.game_over,
    won: store.won,
    final_margin: null,
    seed: store.seed,
  };
}
