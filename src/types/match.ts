/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Data models and type definitions for FootballTeamResults app.
 * Designed for beginner clarity in coursework projects.
 */

export type VenueType = 'Home' | 'Away';

export type MatchOutcome = 'Win' | 'Draw' | 'Loss';

export interface MatchRecord {
  /** Unique match identifier (UUID string) */
  id: string;
  /** Opponent club or team name */
  opponent: string;
  /** Goals scored by our team (non-negative whole number) */
  ourScore: number;
  /** Goals scored by the opponent team (non-negative whole number) */
  opponentScore: number;
  /** Date of the match in YYYY-MM-DD format */
  matchDate: string;
  /** Match location: Home or Away */
  venue: VenueType;
  /** Optional tournament or league name (e.g. "Sunday Premier League", "Regional Cup") */
  competition?: string;
  /** Optional match commentary, goal scorers, cards, or notes */
  notes?: string;
  /** Match result automatically determined from the scores */
  outcome: MatchOutcome;
  /** Points awarded: 3 for Win, 1 for Draw, 0 for Loss */
  points: number;
  /** Creation timestamp in milliseconds */
  createdAt: number;
  /** Last update timestamp in milliseconds */
  updatedAt: number;
}

export interface TeamSettings {
  /** User-configured name for our team */
  teamName: string;
  /** Short acronym or abbreviation (e.g., "GLFC") */
  shortName: string;
  /** Home stadium or ground name */
  homePitch: string;
  /** Current season or campaign (e.g., "2026/2027") */
  season: string;
}

export interface SplitRecord {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface TeamStatsSummary {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  winPercentage: number;
  cleanSheets: number;
  avgGoalsScored: number;
  avgGoalsConceded: number;
  homeRecord: SplitRecord;
  awayRecord: SplitRecord;
  formGuide: MatchRecord[]; // Last 5 matches (most recent first)
  biggestWin?: {
    match: MatchRecord;
    goalDifference: number;
  };
  highestScoringMatch?: {
    match: MatchRecord;
    totalGoals: number;
  };
}
