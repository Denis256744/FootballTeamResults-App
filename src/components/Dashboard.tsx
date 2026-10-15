/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Dashboard Component:
 * - Summary cards for Played, Won, Drawn, Lost, Goals Scored, Goals Conceded, Points, Goal Difference
 * - Team Overview card with live form guide (last 5 matches)
 * - Recent matches list
 * - Helpful empty state when no matches recorded
 */

import React from 'react';
import {
  Trophy,
  CheckCircle2,
  MinusCircle,
  XCircle,
  Flame,
  ShieldCheck,
  Calendar,
  ChevronRight,
  Plus,
  Compass,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import { MatchRecord, TeamSettings, TeamStatsSummary } from '../types/match';
import { saveMatch } from '../storage/matchStorage';

interface DashboardProps {
  stats: TeamStatsSummary;
  settings: TeamSettings;
  recentMatches: MatchRecord[];
  onNavigate: (tab: string) => void;
  onSelectMatch: (match: MatchRecord) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  settings,
  recentMatches,
  onNavigate,
  onSelectMatch,
}) => {
  // Demo data helper for quick testing (coursework presentation helper)
  const handleLoadSampleData = async () => {
    const today = new Date();
    const sampleDates = [
      new Date(today.getTime() - 2 * 86400000).toISOString().split('T')[0],
      new Date(today.getTime() - 7 * 86400000).toISOString().split('T')[0],
      new Date(today.getTime() - 14 * 86400000).toISOString().split('T')[0],
      new Date(today.getTime() - 21 * 86400000).toISOString().split('T')[0],
      new Date(today.getTime() - 28 * 86400000).toISOString().split('T')[0],
    ];

    const sampleMatches = [
      {
        opponent: 'Riverside Rovers',
        ourScore: 3,
        opponentScore: 1,
        matchDate: sampleDates[0],
        venue: 'Home' as const,
        competition: 'Sunday League',
        notes: 'Clinical finishing in the second half. Alex scored twice.',
      },
      {
        opponent: 'Metro United',
        ourScore: 2,
        opponentScore: 2,
        matchDate: sampleDates[1],
        venue: 'Away' as const,
        competition: 'Sunday League',
        notes: 'Hard-fought draw in rainy conditions. Late equalizer.',
      },
      {
        opponent: 'Highland Hawks',
        ourScore: 4,
        opponentScore: 0,
        matchDate: sampleDates[2],
        venue: 'Home' as const,
        competition: 'County Cup',
        notes: 'Dominant display, kept a clean sheet. Solid defense.',
      },
      {
        opponent: 'Apex Athletic',
        ourScore: 1,
        opponentScore: 2,
        matchDate: sampleDates[3],
        venue: 'Away' as const,
        competition: 'Sunday League',
        notes: 'Conceded from a set piece in the 88th minute.',
      },
      {
        opponent: 'Oakridge FC',
        ourScore: 2,
        opponentScore: 0,
        matchDate: sampleDates[4],
        venue: 'Home' as const,
        competition: 'Friendly',
        notes: 'Pre-season friendly. Great defensive discipline.',
      },
    ];

    for (const m of sampleMatches) {
      await saveMatch(m);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Team Overview Card (Clean white content card) */}
      <div className="rounded-2xl bg-white p-6 shadow-xs border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                Season {settings.season}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Home Ground: {settings.homePitch}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              {settings.teamName}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {stats.played === 0
                ? 'Ready to track your club results. Record your first match below!'
                : `${stats.played} matches recorded • ${stats.points} points accumulated • Goal Diff: ${
                    stats.goalDifference > 0 ? `+${stats.goalDifference}` : stats.goalDifference
                  }`}
            </p>

            {/* Form Guide (Last 5 matches) */}
            {stats.played > 0 && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                  Recent Form:
                </span>
                <div className="flex items-center gap-1.5">
                  {stats.formGuide.map((m) => {
                    const badgeColor =
                      m.outcome === 'Win'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 font-black'
                        : m.outcome === 'Draw'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200 font-black'
                        : 'bg-rose-100 text-rose-800 border border-rose-200 font-black';
                    return (
                      <span
                        key={m.id}
                        title={`${m.outcome} vs ${m.opponent} (${m.ourScore}-${m.opponentScore})`}
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-xs shadow-xs cursor-default ${badgeColor}`}
                      >
                        {m.outcome === 'Win' ? 'W' : m.outcome === 'Draw' ? 'D' : 'L'}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('add-match')}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-xs transition-colors cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Record Match</span>
            </button>
            <button
              onClick={() => onNavigate('stats')}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm border border-slate-300 transition-colors cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 text-emerald-700" />
              <span>Statistics</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Key Summary Cards (Calculated automatically from records) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Matches Played */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Played</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black text-slate-800">{stats.played}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">Total matches</div>
          </div>
        </div>

        {/* Won */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-semibold uppercase tracking-wider">Won</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">{stats.wins}</div>
            <div className="text-[11px] text-emerald-600/80 font-medium mt-0.5">
              {stats.winPercentage}% win rate
            </div>
          </div>
        </div>

        {/* Drawn */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-semibold uppercase tracking-wider">Drawn</span>
            <MinusCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black text-amber-700">{stats.draws}</div>
            <div className="text-[11px] text-amber-600/80 font-medium mt-0.5">Tied matches</div>
          </div>
        </div>

        {/* Lost */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-xs font-semibold uppercase tracking-wider">Lost</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black text-rose-700">{stats.losses}</div>
            <div className="text-[11px] text-rose-600/80 font-medium mt-0.5">Defeats</div>
          </div>
        </div>

        {/* Goals Scored */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-semibold uppercase tracking-wider">Goals For</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black text-slate-800">{stats.goalsFor}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              {stats.avgGoalsScored} avg/game
            </div>
          </div>
        </div>

        {/* Goals Conceded */}
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-semibold uppercase tracking-wider">Goals Against</span>
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black text-slate-800">{stats.goalsAgainst}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              {stats.avgGoalsConceded} avg/game
            </div>
          </div>
        </div>
      </div>

      {/* Points & Goal Difference Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Points (Standard 3-1-0 Rule)
            </span>
            <div className="text-3xl font-black text-slate-900 mt-0.5">{stats.points} pts</div>
            <p className="text-xs text-slate-500 mt-1">
              {stats.wins} Wins × 3 pts + {stats.draws} Draws × 1 pt
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-black text-xl shadow-xs">
            <Trophy className="w-6 h-6 text-emerald-700" />
          </div>
        </div>

        <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Goal Difference (GD)
            </span>
            <div
              className={`text-3xl font-black mt-0.5 ${
                stats.goalDifference > 0
                  ? 'text-emerald-700'
                  : stats.goalDifference < 0
                  ? 'text-rose-700'
                  : 'text-slate-800'
              }`}
            >
              {stats.goalDifference > 0 ? `+${stats.goalDifference}` : stats.goalDifference}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {stats.goalsFor} Scored minus {stats.goalsAgainst} Conceded
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white text-slate-700 border border-slate-300">
              {stats.cleanSheets} Clean Sheets
            </span>
          </div>
        </div>
      </div>

      {/* Recent Matches Section */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Matches</h3>
            <p className="text-xs text-slate-500">Latest results logged into the database</p>
          </div>
          {stats.played > 0 && (
            <button
              onClick={() => onNavigate('matches')}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              <span>View All ({stats.played})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {stats.played === 0 ? (
          <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/60">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <Compass className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-800">No match results yet</h4>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
              Start your season record by adding your first football match. All statistics and standings will compute automatically.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => onNavigate('add-match')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow transition-colors cursor-pointer"
              >
                + Record First Match
              </button>
              <button
                onClick={handleLoadSampleData}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-300 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                title="Optional quick demo data for coursework grading"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Load Sample Match Data (Demo)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentMatches.map((m) => {
              const outcomeBadge =
                m.outcome === 'Win'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : m.outcome === 'Draw'
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-rose-100 text-rose-800 border-rose-200';

              return (
                <div
                  key={m.id}
                  onClick={() => onSelectMatch(m)}
                  className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Outcome Badge */}
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${outcomeBadge}`}
                    >
                      {m.outcome === 'Win' ? 'WIN' : m.outcome === 'Draw' ? 'DRAW' : 'LOSS'}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 truncate text-sm sm:text-base">
                          {m.venue === 'Home' ? `${settings.shortName} vs ${m.opponent}` : `${m.opponent} vs ${settings.shortName}`}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                          {m.venue}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>{m.matchDate}</span>
                        {m.competition && <span>• {m.competition}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Score display */}
                  <div className="flex items-center gap-3 shrink-0 pl-3">
                    <div className="text-right">
                      <div className="font-black text-base sm:text-lg text-slate-900 tracking-tight">
                        {m.venue === 'Home' ? `${m.ourScore} - ${m.opponentScore}` : `${m.opponentScore} - ${m.ourScore}`}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400">
                        {m.points} {m.points === 1 ? 'pt' : 'pts'}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
