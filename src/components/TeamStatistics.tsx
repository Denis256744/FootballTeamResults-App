/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Team Statistics Component:
 * - Performance analytics (Win rate, Clean sheets, Scoring rate, Defensive rate)
 * - Season highlights (Biggest win, Highest scoring match)
 * - Results breakdown cards
 */

import React from 'react';
import {
  BarChart3,
  Flame,
  Shield,
  TrendingUp,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { MatchRecord, TeamSettings, TeamStatsSummary } from '../types/match';

interface TeamStatisticsProps {
  stats: TeamStatsSummary;
  settings: TeamSettings;
  matches: MatchRecord[];
  onNavigateAddMatch: () => void;
}

export const TeamStatistics: React.FC<TeamStatisticsProps> = ({
  stats,
  settings,
  matches,
  onNavigateAddMatch,
}) => {
  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Team Statistics
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Performance metrics and analytics for <strong className="text-slate-800">{settings.teamName}</strong> computed live from saved match records.
        </p>
      </div>

      {stats.played === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
            <BarChart3 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Statistics Available Yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            Record at least one match to view your team&apos;s win rates, scoring averages, and match highlights.
          </p>
          <button
            onClick={onNavigateAddMatch}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow cursor-pointer transition-colors"
          >
            + Record A Match Now
          </button>
        </div>
      ) : (
        <>
          {/* Performance Analytics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Win Rate */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Win Rate</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">{stats.winPercentage}%</div>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.winPercentage}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                {stats.wins} wins out of {stats.played} matches
              </p>
            </div>

            {/* Clean Sheets */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Clean Sheets</span>
                <Shield className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">{stats.cleanSheets}</div>
              <p className="text-[11px] text-slate-500 mt-2">
                Matches with 0 goals conceded ({stats.played > 0 ? Math.round((stats.cleanSheets / stats.played) * 100) : 0}% of games)
              </p>
            </div>

            {/* Avg Goals Scored */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Scoring Rate</span>
                <Flame className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-3xl font-black text-slate-900">{stats.avgGoalsScored}</div>
              <p className="text-[11px] text-slate-500 mt-2">
                Average goals scored per match
              </p>
            </div>

            {/* Avg Goals Conceded */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Defensive Rate</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">{stats.avgGoalsConceded}</div>
              <p className="text-[11px] text-slate-500 mt-2">
                Average goals conceded per match
              </p>
            </div>
          </div>

          {/* Highlights: Biggest Win & Highest Scoring Game */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats.biggestWin ? (
              <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex items-start gap-3">
                <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Biggest Win of the Season
                  </span>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    {stats.biggestWin.match.ourScore} - {stats.biggestWin.match.opponentScore} vs {stats.biggestWin.match.opponent}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Margin: +{stats.biggestWin.goalDifference} goals • {stats.biggestWin.match.matchDate} ({stats.biggestWin.match.venue})
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 text-slate-400 text-xs flex items-center justify-center">
                No wins recorded yet
              </div>
            )}

            {stats.highestScoringMatch ? (
              <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex items-start gap-3">
                <div className="p-3 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                    Highest Scoring Match
                  </span>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    {stats.highestScoringMatch.match.ourScore} - {stats.highestScoringMatch.match.opponentScore} vs {stats.highestScoringMatch.match.opponent}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {stats.highestScoringMatch.totalGoals} total goals scored • {stats.highestScoringMatch.match.matchDate}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};
