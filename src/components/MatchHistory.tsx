/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Match History Component:
 * - Search by opponent name, notes, or competition
 * - Filter by outcome (All, Win, Draw, Loss), venue (All, Home, Away)
 * - Sort options (Newest, Oldest, Highest Score)
 * - View Full Details modal
 * - Edit Match modal with full validation
 * - Delete Match modal with safe confirmation
 * - Empty states for no matches or no filter matches
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  Eye,
  Calendar,
  MapPin,
  Trophy,
  FileText,
  AlertTriangle,
  X,
  Check,
  Plus,
  ArrowUpDown,
} from 'lucide-react';
import { MatchRecord, TeamSettings, VenueType } from '../types/match';
import { deleteMatch, updateMatch } from '../storage/matchStorage';
import { calculateOutcome, calculatePoints } from '../utils/statsCalculator';

interface MatchHistoryProps {
  matches: MatchRecord[];
  settings: TeamSettings;
  onNavigateAddMatch: () => void;
  selectedMatchFromOutside?: MatchRecord | null;
  onClearSelectedMatch?: () => void;
}

export const MatchHistory: React.FC<MatchHistoryProps> = ({
  matches,
  settings,
  onNavigateAddMatch,
  selectedMatchFromOutside,
  onClearSelectedMatch,
}) => {
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<'All' | 'Win' | 'Draw' | 'Loss'>('All');
  const [venueFilter, setVenueFilter] = useState<'All' | 'Home' | 'Away'>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest_goals'>('newest');

  // Modals state
  const [viewingMatch, setViewingMatch] = useState<MatchRecord | null>(selectedMatchFromOutside || null);
  const [editingMatch, setEditingMatch] = useState<MatchRecord | null>(null);
  const [deletingMatch, setDeletingMatch] = useState<MatchRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit form state
  const [editOpponent, setEditOpponent] = useState('');
  const [editOurScore, setEditOurScore] = useState<number>(0);
  const [editOpponentScore, setEditOpponentScore] = useState<number>(0);
  const [editDate, setEditDate] = useState('');
  const [editVenue, setEditVenue] = useState<VenueType>('Home');
  const [editCompetition, setEditCompetition] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editError, setEditError] = useState('');

  // Handle outside match selection
  React.useEffect(() => {
    if (selectedMatchFromOutside) {
      setViewingMatch(selectedMatchFromOutside);
    }
  }, [selectedMatchFromOutside]);

  const closeViewModal = () => {
    setViewingMatch(null);
    if (onClearSelectedMatch) onClearSelectedMatch();
  };

  // Open edit modal and populate state
  const handleOpenEdit = (m: MatchRecord) => {
    setEditingMatch(m);
    setEditOpponent(m.opponent);
    setEditOurScore(m.ourScore);
    setEditOpponentScore(m.opponentScore);
    setEditDate(m.matchDate);
    setEditVenue(m.venue);
    setEditCompetition(m.competition || '');
    setEditNotes(m.notes || '');
    setEditError('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatch) return;

    if (!editOpponent.trim()) {
      setEditError('Opponent name is required');
      return;
    }
    if (isNaN(editOurScore) || editOurScore < 0 || !Number.isInteger(editOurScore)) {
      setEditError('Our score must be a non-negative whole number');
      return;
    }
    if (isNaN(editOpponentScore) || editOpponentScore < 0 || !Number.isInteger(editOpponentScore)) {
      setEditError('Opponent score must be a non-negative whole number');
      return;
    }
    if (!editDate) {
      setEditError('Date is required');
      return;
    }

    const outcome = calculateOutcome(editOurScore, editOpponentScore);
    const points = calculatePoints(outcome);

    const updatedRecord: MatchRecord = {
      ...editingMatch,
      opponent: editOpponent.trim(),
      ourScore: editOurScore,
      opponentScore: editOpponentScore,
      matchDate: editDate,
      venue: editVenue,
      competition: editCompetition.trim(),
      notes: editNotes.trim(),
      outcome,
      points,
      updatedAt: Date.now(),
    };

    try {
      await updateMatch(updatedRecord);
      setEditingMatch(null);
      if (viewingMatch && viewingMatch.id === updatedRecord.id) {
        setViewingMatch(updatedRecord);
      }
    } catch (err) {
      console.error('Error updating match:', err);
      setEditError('Failed to update match');
    }
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!deletingMatch) return;
    setIsDeleting(true);
    try {
      await deleteMatch(deletingMatch.id);
      if (viewingMatch && viewingMatch.id === deletingMatch.id) {
        setViewingMatch(null);
      }
      setDeletingMatch(null);
    } catch (err) {
      console.error('Error deleting match:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter and sort computation
  const filteredMatches = useMemo(() => {
    return matches
      .filter((m) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesOpponent = m.opponent.toLowerCase().includes(q);
          const matchesCompetition = m.competition?.toLowerCase().includes(q);
          const matchesNotes = m.notes?.toLowerCase().includes(q);
          if (!matchesOpponent && !matchesCompetition && !matchesNotes) {
            return false;
          }
        }

        // Outcome filter
        if (outcomeFilter !== 'All' && m.outcome !== outcomeFilter) {
          return false;
        }

        // Venue filter
        if (venueFilter !== 'All' && m.venue !== venueFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'newest') {
          return b.matchDate.localeCompare(a.matchDate) || b.createdAt - a.createdAt;
        } else if (sortOrder === 'oldest') {
          return a.matchDate.localeCompare(b.matchDate) || a.createdAt - b.createdAt;
        } else if (sortOrder === 'highest_goals') {
          return b.ourScore + b.opponentScore - (a.ourScore + a.opponentScore);
        }
        return 0;
      });
  }, [matches, searchQuery, outcomeFilter, venueFilter, sortOrder]);

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      {/* Title & Stats Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Match History
          </h2>
          <p className="text-xs text-slate-500">
            {matches.length} total recorded {matches.length === 1 ? 'match' : 'matches'} • Sorted newest first
          </p>
        </div>

        <button
          onClick={onNavigateAddMatch}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Record New Match</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search opponent or competition..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest' | 'highest_goals')}
              className="py-2 px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="newest">Date: Newest First</option>
              <option value="oldest">Date: Oldest First</option>
              <option value="highest_goals">Highest Total Goals</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Outcome Filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-semibold mr-1">Result:</span>
            {(['All', 'Win', 'Draw', 'Loss'] as const).map((outcome) => (
              <button
                key={outcome}
                onClick={() => setOutcomeFilter(outcome)}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  outcomeFilter === outcome
                    ? outcome === 'Win'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : outcome === 'Draw'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : outcome === 'Loss'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {outcome}
              </button>
            ))}
          </div>

          {/* Venue Filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-semibold mr-1">Venue:</span>
            {(['All', 'Home', 'Away'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVenueFilter(v)}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  venueFilter === v
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Matches List or Empty State */}
      {matches.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No recorded matches</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            Your match log is currently empty. Record your first game to view match history, scores, and head-to-head records.
          </p>
          <button
            onClick={onNavigateAddMatch}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow cursor-pointer transition-colors"
          >
            + Record Your First Match
          </button>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white rounded-2xl border border-slate-200">
          <Filter className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <h4 className="text-base font-bold text-slate-800">No matches match your filter</h4>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Try adjusting your search query or reset the outcome/venue filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setOutcomeFilter('All');
              setVenueFilter('All');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMatches.map((m) => {
            const outcomeBadge =
              m.outcome === 'Win'
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : m.outcome === 'Draw'
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-rose-100 text-rose-900 border-rose-300';

            return (
              <div
                key={m.id}
                className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200 hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left: Opponent, Outcome, Date & Venue */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="flex flex-col items-center shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider border text-center ${outcomeBadge}`}
                    >
                      {m.outcome}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 mt-1">
                      +{m.points} {m.points === 1 ? 'pt' : 'pts'}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900 truncate">
                        {m.venue === 'Home' ? `${settings.teamName} vs ${m.opponent}` : `${m.opponent} vs ${settings.teamName}`}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        {m.venue}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {m.matchDate}
                      </span>
                      {m.competition && (
                        <span className="flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          <Trophy className="w-3 h-3 text-emerald-600" />
                          {m.competition}
                        </span>
                      )}
                    </div>

                    {m.notes && (
                      <p className="text-xs text-slate-600 mt-2 line-clamp-1 italic bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        &quot;{m.notes}&quot;
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Scoreboard & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 shrink-0">
                  {/* Score Tile */}
                  <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 text-center">
                    <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {m.venue === 'Home' ? `${m.ourScore} - ${m.opponentScore}` : `${m.opponentScore} - ${m.ourScore}`}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Final Score
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingMatch(m)}
                      title="View Details"
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(m)}
                      title="Edit Match"
                      className="p-2 rounded-xl text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingMatch(m)}
                      title="Delete Match"
                      className="p-2 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Match Details Modal */}
      {viewingMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-emerald-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base">Match Details Report</h3>
              </div>
              <button
                onClick={closeViewModal}
                className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Scoreboard Big Display */}
              <div className="text-center bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  {viewingMatch.competition || 'Friendly Match'} • {viewingMatch.matchDate}
                </span>

                <div className="mt-3 flex items-center justify-center gap-4 sm:gap-8">
                  <div className="text-center w-28">
                    <span className="text-xs font-extrabold text-emerald-800 block truncate">
                      {settings.shortName}
                    </span>
                    <span className="text-3xl sm:text-4xl font-black text-slate-900">
                      {viewingMatch.ourScore}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold block">
                      {viewingMatch.venue === 'Home' ? '(Home)' : '(Away)'}
                    </span>
                  </div>

                  <span className="text-2xl font-bold text-slate-300">-</span>

                  <div className="text-center w-28">
                    <span className="text-xs font-extrabold text-slate-700 block truncate">
                      {viewingMatch.opponent}
                    </span>
                    <span className="text-3xl sm:text-4xl font-black text-slate-900">
                      {viewingMatch.opponentScore}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold block">
                      {viewingMatch.venue === 'Home' ? '(Away)' : '(Home)'}
                    </span>
                  </div>
                </div>

                {/* Outcome badge */}
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span>{viewingMatch.outcome.toUpperCase()}</span>
                  <span>•</span>
                  <span>{viewingMatch.points} Points Awarded</span>
                </div>
              </div>

              {/* Match metadata list */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-semibold block">Venue</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5">
                    {viewingMatch.venue === 'Home' ? `Home (${settings.homePitch})` : 'Away Ground'}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-semibold block">Goal Difference</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5">
                    {viewingMatch.ourScore - viewingMatch.opponentScore > 0
                      ? `+${viewingMatch.ourScore - viewingMatch.opponentScore}`
                      : viewingMatch.ourScore - viewingMatch.opponentScore}
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Match Notes & Commentary
                </span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 min-h-16 whitespace-pre-wrap">
                  {viewingMatch.notes || 'No match notes recorded.'}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
              <button
                onClick={() => {
                  const m = viewingMatch;
                  closeViewModal();
                  handleOpenEdit(m);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Match</span>
              </button>

              <button
                onClick={closeViewModal}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Match Modal */}
      {editingMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-emerald-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base">Edit Match Result</h3>
              </div>
              <button
                onClick={() => setEditingMatch(null)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
                  {editError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Opponent Team Name
                </label>
                <input
                  type="text"
                  value={editOpponent}
                  onChange={(e) => setEditOpponent(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm font-medium focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-emerald-800 mb-1">
                    {settings.shortName} Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={editOurScore}
                    onChange={(e) => setEditOurScore(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full px-3 py-2 border rounded-xl text-sm font-black text-center focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Opponent Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={editOpponentScore}
                    onChange={(e) => setEditOpponentScore(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full px-3 py-2 border rounded-xl text-sm font-black text-center focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Match Date
                  </label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Venue
                  </label>
                  <select
                    value={editVenue}
                    onChange={(e) => setEditVenue(e.target.value as VenueType)}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Home">Home ({settings.homePitch})</option>
                    <option value="Away">Away Match</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Competition Name (Optional)
                </label>
                <input
                  type="text"
                  value={editCompetition}
                  onChange={(e) => setEditCompetition(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMatch(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2.5 rounded-full bg-rose-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Delete Match Record?</h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 mb-4">
              Are you sure you want to permanently delete the match against{' '}
              <strong className="text-slate-900">{deletingMatch.opponent}</strong> on{' '}
              <strong className="text-slate-900">{deletingMatch.matchDate}</strong> (Score: {deletingMatch.ourScore}-{deletingMatch.opponentScore})?
              <br /><br />
              All team statistics, win rates, and points will be recalculated automatically.
            </p>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingMatch(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
