import type { GameState } from '@/types/game.ts';
import type { ElectionResult, DemographicResult, PostGameScore } from '@/types/engine.ts';
import { GAME_CONSTANTS } from '@/engine/BalanceConstants.ts';
import { SeededRandom } from '@/engine/RandomUtils.ts';
import { clamp } from '@/utils/formatters.ts';

export function calculateElectionResult(state: GameState, rng: SeededRandom): ElectionResult {
  const baseTurnout = 0.55; // 55% base turnout
  
  // GOTV differential
  const playerGOTVBonus = Math.min(
    (state.gotv_investment / 100000) * GAME_CONSTANTS.GOTV_TURNOUT_MULTIPLIER,
    GAME_CONSTANTS.GOTV_FINAL_EFFECT_MAX,
  );
  const opponentGOTVBonus = Math.min(
    (state.opponent.gotv_investment / 100000) * GAME_CONSTANTS.GOTV_TURNOUT_MULTIPLIER,
    GAME_CONSTANTS.GOTV_FINAL_EFFECT_MAX,
  );
  const gotvDifferential = playerGOTVBonus - opponentGOTVBonus;

  // Election day variance
  const dayVariance = rng.nextFloat(
    -GAME_CONSTANTS.ELECTION_DAY_VARIANCE,
    GAME_CONSTANTS.ELECTION_DAY_VARIANCE,
  );

  // Calculate demographic results
  const demographicResults: DemographicResult[] = state.polls.demographics.map((demo) => {
    const turnoutNoise = rng.nextFloat(-0.05, 0.05);
    const baseDemoTurnout = baseTurnout + turnoutNoise;
    
    // GOTV affects turnout in demographics where player is strong
    const playerStrong = demo.current_support > demo.opponent_support;
    const gotvTurnoutEffect = playerStrong ? gotvDifferential * 0.02 : -gotvDifferential * 0.01;
    
    const turnoutPct = clamp(baseDemoTurnout + gotvTurnoutEffect, 0.3, 0.85);
    
    // Final support with day-of variance
    const demoVariance = rng.nextFloat(-1.5, 1.5);
    const playerPct = clamp(demo.current_support + dayVariance + demoVariance + gotvDifferential, 0, 100);
    const opponentPct = clamp(demo.opponent_support - dayVariance * 0.5 - demoVariance * 0.5, 0, 100);

    return {
      demographic: demo.id,
      player_pct: playerPct,
      opponent_pct: opponentPct,
      turnout_pct: turnoutPct * 100,
    };
  });

  // Calculate total votes
  const totalPopulation = 839000;
  const totalVoters = totalPopulation * baseTurnout;
  
  let playerVotes = 0;
  let opponentVotes = 0;
  
  for (const result of demographicResults) {
    const demoData = state.polls.demographics.find((d) => d.id === result.demographic);
    if (!demoData) continue;
    
    const demoVoters = totalVoters * (demoData.electorate_pct / 100) * (result.turnout_pct / 100);
    playerVotes += demoVoters * (result.player_pct / 100);
    opponentVotes += demoVoters * (result.opponent_pct / 100);
  }

  // Round to whole numbers
  playerVotes = Math.round(playerVotes);
  opponentVotes = Math.round(opponentVotes);
  
  const totalVotesCast = playerVotes + opponentVotes;
  const playerPct = (playerVotes / totalVotesCast) * 100;
  const opponentPct = (opponentVotes / totalVotesCast) * 100;
  const margin = playerPct - opponentPct;
  
  const winner = margin > 0 ? 'player' : 'opponent';
  const recount = Math.abs(margin) < GAME_CONSTANTS.RECOUNT_THRESHOLD;

  return {
    player_votes: playerVotes,
    opponent_votes: opponentVotes,
    player_pct: playerPct,
    opponent_pct: opponentPct,
    margin,
    winner,
    recount,
    turnout: baseTurnout * 100,
    demographic_breakdown: demographicResults,
  };
}

export function calculatePostGameScore(
  result: ElectionResult,
  state: GameState,
): PostGameScore {
  const victory = result.winner === 'player';
  let score = 0;

  // Victory bonus
  if (victory) score += 50;
  
  // Margin bonus/penalty
  score += result.margin * 5;
  
  // Funds remaining bonus
  if (state.finances.cash_on_hand > 50000) score += 5;
  if (state.finances.cash_on_hand > 100000) score += 5;
  
  // Endorsements
  const endorsementsWon = state.endorsements.filter((e) => e.secured).length;
  score += endorsementsWon * 3;
  
  // Events handled
  score += Math.min(state.finances.email_list_size / 1000, 10);
  
  // Determine grade
  let grade: string;
  if (score >= 90) grade = 'A+';
  else if (score >= 80) grade = 'A';
  else if (score >= 70) grade = 'B+';
  else if (score >= 60) grade = 'B';
  else if (score >= 50) grade = 'C+';
  else if (score >= 40) grade = 'C';
  else if (score >= 30) grade = 'D';
  else grade = 'F';

  return {
    victory,
    margin: result.margin,
    funds_remaining: state.finances.cash_on_hand,
    endorsements_won: endorsementsWon,
    total_endorsements: state.endorsements.length,
    events_handled: state.finances.email_list_size, // proxy
    approval_peak: state.polls.player_support,
    final_grade: grade,
    total_score: Math.round(score),
  };
}
