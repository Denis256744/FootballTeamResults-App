/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Domain logic for football calculations:
 * - Match Outcome calculation (Win / Draw / Loss)
 * - Points calculation (Standard football: Win=3, Draw=1, Loss=0)
 * - Team statistics computation
 */

import { MatchOutcome, MatchRecord, SplitRecord, TeamStatsSummary } from '../types/match';

/**
 * Automatically determine the match outcome based on team score vs opponent score.
 * Win: ourScore > opponentScore
 * Draw: ourScore === opponentScore
 * Loss: ourScore < opponentScore
 */
export function calculateOutcome(ourScore: number, opponentScore: number): MatchOutcome {
  if (ourScore > opponentScore) {
    return 'Win';
  } else if (ourScore < opponentScore) {
    return 'Loss';
  } else {
    return 'Draw';
  }
}

/**
 * Standard football points system:
 * - 3 points for a Win
 * - 1 point for a Draw
 * - 0 points for a Loss
 */
export function calculatePoints(outcome: MatchOutcome): number {
  switch (outcome) {
    case 'Win':
      return 3;
    case 'Draw':
      return 1;
    case 'Loss':
      return 0;
  }
}

/**
 * Helper to initialize an empty split record (Home or Away)
 */
function createEmptySplitRecord(): SplitRecord {
  return {
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  };
}

/**
 * Compute aggregate statistics and standings from an array of MatchRecords.
 * All numbers are strictly derived from the passed match records.
 */
export function computeTeamStats(matches: MatchRecord[]): TeamStatsSummary {
  // Sort matches by date descending (newest first)
  const sortedMatches = [...matches].sort((a, b) => {
    const dateComparison = b.matchDate.localeCompare(a.matchDate);
    if (dateComparison !== 0) return dateComparison;
    return b.createdAt - a.createdAt;
  });

  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;
  let cleanSheets = 0;

  const homeRecord = createEmptySplitRecord();
  const awayRecord = createEmptySplitRecord();

  let biggestWin: { match: MatchRecord; goalDifference: number } | undefined = undefined;
  let highestScoringMatch: { match: MatchRecord; totalGoals: number } | undefined = undefined;

  for (const m of sortedMatches) {
    // Basic tally
    if (m.outcome === 'Win') {
      wins += 1;
      const diff = m.ourScore - m.opponentScore;
      if (!biggestWin || diff > biggestWin.goalDifference) {
        biggestWin = { match: m, goalDifference: diff };
      }
    } else if (m.outcome === 'Draw') {
      draws += 1;
    } else if (m.outcome === 'Loss') {
      losses += 1;
    }

    goalsFor += m.ourScore;
    goalsAgainst += m.opponentScore;

    // Clean sheet: our team conceded 0 goals
    if (m.opponentScore === 0) {
      cleanSheets += 1;
    }

    // Total goals in the match
    const totalMatchGoals = m.ourScore + m.opponentScore;
    if (!highestScoringMatch || totalMatchGoals > (highestScoringMatch.totalGoals)) {
      highestScoringMatch = { match: m, totalGoals: totalMatchGoals };
    }

    // Split tally (Home vs Away)
    const targetSplit = m.venue === 'Home' ? homeRecord : awayRecord;
    targetSplit.played += 1;
    if (m.outcome === 'Win') targetSplit.wins += 1;
    else if (m.outcome === 'Draw') targetSplit.draws += 1;
    else if (m.outcome === 'Loss') targetSplit.losses += 1;

    targetSplit.goalsFor += m.ourScore;
    targetSplit.goalsAgainst += m.opponentScore;
    targetSplit.points += m.points;
  }

  homeRecord.goalDifference = homeRecord.goalsFor - homeRecord.goalsAgainst;
  awayRecord.goalDifference = awayRecord.goalsFor - awayRecord.goalsAgainst;

  const played = matches.length;
  const goalDifference = goalsFor - goalsAgainst;
  const points = (wins * 3) + (draws * 1);
  const winPercentage = played > 0 ? Math.round((wins / played) * 100) : 0;
  const avgGoalsScored = played > 0 ? Number((goalsFor / played).toFixed(2)) : 0;
  const avgGoalsConceded = played > 0 ? Number((goalsAgainst / played).toFixed(2)) : 0;

  // Form guide: last 5 matches (most recent first)
  const formGuide = sortedMatches.slice(0, 5);

  return {
    played,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalDifference,
    points,
    winPercentage,
    cleanSheets,
    avgGoalsScored,
    avgGoalsConceded,
    homeRecord,
    awayRecord,
    formGuide,
    biggestWin,
    highestScoringMatch,
  };
}
