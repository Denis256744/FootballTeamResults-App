/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Add Match Form Component:
 * - Records new football match results with live validation
 * - Non-negative whole numbers validation for scores
 * - Automatic real-time determination of match outcome (Win / Draw / Loss) & points
 * - Prevents accidental duplicate submissions
 * - Provides clear success notification and cancellation
 */

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  MapPin,
  Trophy,
  FileText,
  AlertCircle,
  CheckCircle2,
  Plus,
  ArrowLeft,
  Flame,
  Minus,
} from 'lucide-react';
import { MatchRecord, TeamSettings, VenueType } from '../types/match';
import { saveMatch, getAllMatches } from '../storage/matchStorage';
import { calculateOutcome, calculatePoints } from '../utils/statsCalculator';

interface AddMatchFormProps {
  settings: TeamSettings;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddMatchForm: React.FC<AddMatchFormProps> = ({
  settings,
  onSuccess,
  onCancel,
}) => {
  // Today's ISO date string (YYYY-MM-DD)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }, []);

  // Form states
  const [opponent, setOpponent] = useState('');
  const [ourScore, setOurScore] = useState<number | ''>(0);
  const [opponentScore, setOpponentScore] = useState<number | ''>(0);
  const [matchDate, setMatchDate] = useState(todayStr);
  const [venue, setVenue] = useState<VenueType>('Home');
  const [competition, setCompetition] = useState('');
  const [notes, setNotes] = useState('');

  // UI status states
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successSavedMatch, setSuccessSavedMatch] = useState<MatchRecord | null>(null);

  // Live calculation of outcome & points as the user types scores
  const parsedOurScore = typeof ourScore === 'number' ? ourScore : 0;
  const parsedOppScore = typeof opponentScore === 'number' ? opponentScore : 0;
  const currentOutcome = calculateOutcome(parsedOurScore, parsedOppScore);
  const currentPoints = calculatePoints(currentOutcome);

  // Suggested competition tags
  const suggestedCompetitions = ['Premier League', 'County Cup', 'Charity Shield', 'Friendly', 'Playoffs'];

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!opponent.trim()) {
      errors.opponent = 'Please enter the opponent team name';
    }

    if (ourScore === '' || isNaN(ourScore) || ourScore < 0 || !Number.isInteger(ourScore)) {
      errors.ourScore = 'Score must be a non-negative whole number (0, 1, 2, ...)';
    }

    if (opponentScore === '' || isNaN(opponentScore) || opponentScore < 0 || !Number.isInteger(opponentScore)) {
      errors.opponentScore = 'Score must be a non-negative whole number (0, 1, 2, ...)';
    }

    if (!matchDate) {
      errors.matchDate = 'Please select a valid match date';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Check for accidental duplicate submission on same date & opponent
      const allExisting = await getAllMatches();
      const existingDuplicate = allExisting.find(
        (m) =>
          m.matchDate === matchDate &&
          m.opponent.trim().toLowerCase() === opponent.trim().toLowerCase() &&
          m.venue === venue
      );

      if (existingDuplicate) {
        const proceed = window.confirm(
          `A match against "${opponent}" on ${matchDate} (${venue}) is already recorded with score ${existingDuplicate.ourScore}-${existingDuplicate.opponentScore}.\n\nDo you still want to record this match?`
        );
        if (!proceed) {
          setIsSubmitting(false);
          return;
        }
      }

      const saved = await saveMatch({
        opponent: opponent.trim(),
        ourScore: parsedOurScore,
        opponentScore: parsedOppScore,
        matchDate,
        venue,
        competition: competition.trim(),
        notes: notes.trim(),
      });

      setSuccessSavedMatch(saved);
    } catch (err) {
      console.error('Failed to save match:', err);
      setValidationErrors({ form: 'An unexpected error occurred while saving. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForAnother = () => {
    setOpponent('');
    setOurScore(0);
    setOpponentScore(0);
    setMatchDate(todayStr);
    setVenue('Home');
    setCompetition('');
    setNotes('');
    setValidationErrors({});
    setSuccessSavedMatch(null);
  };

  // Outcome preview banner styling
  const outcomeCardColor =
    currentOutcome === 'Win'
      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
      : currentOutcome === 'Draw'
      ? 'bg-amber-50 border-amber-300 text-amber-900'
      : 'bg-rose-50 border-rose-300 text-rose-900';

  const outcomeBadgeColor =
    currentOutcome === 'Win'
      ? 'bg-emerald-600 text-white'
      : currentOutcome === 'Draw'
      ? 'bg-amber-500 text-white'
      : 'bg-rose-600 text-white';

  return (
    <div className="max-w-2xl mx-auto pb-20 md:pb-6">
      {/* Header breadcrumb */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel & Back</span>
        </button>
        <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-full border border-emerald-200">
          Recording as: {settings.teamName}
        </span>
      </div>

      {/* Success Notification Banner */}
      {successSavedMatch ? (
        <div className="bg-white rounded-2xl p-6 shadow-md border border-emerald-200 text-center animate-in fade-in duration-200">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Match Successfully Saved!</h3>
          <p className="text-sm text-slate-600 mt-1">
            Recorded result: <strong className="text-slate-900">{settings.shortName} {successSavedMatch.ourScore} - {successSavedMatch.opponentScore} {successSavedMatch.opponent}</strong>
          </p>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <span>Result: {successSavedMatch.outcome.toUpperCase()}</span>
            <span>•</span>
            <span>+{successSavedMatch.points} pts added to standings</span>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleResetForAnother}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow cursor-pointer transition-colors"
            >
              + Record Another Match
            </button>
            <button
              onClick={onSuccess}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition-colors cursor-pointer border border-slate-300"
            >
              View in Match History
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 sm:p-7 shadow-xs border border-slate-200 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-black text-slate-900">Record Match Result</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter match details below. Win/Draw/Loss outcome and points are calculated automatically.
            </p>
          </div>

          {validationErrors.form && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationErrors.form}</span>
            </div>
          )}

          {/* Opponent Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Opponent Team Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={opponent}
              onChange={(e) => {
                setOpponent(e.target.value);
                if (validationErrors.opponent) {
                  setValidationErrors((prev) => ({ ...prev, opponent: '' }));
                }
              }}
              placeholder="e.g. Riverside Rangers FC"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-colors outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                validationErrors.opponent ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300 focus:border-emerald-600'
              }`}
            />
            {validationErrors.opponent && (
              <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {validationErrors.opponent}
              </p>
            )}
          </div>

          {/* Scores Section with Score Steppers & Live Scoreboard */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 text-center">
              Final Match Score <span className="text-rose-500">*</span>
            </span>

            <div className="grid grid-cols-2 gap-3 sm:gap-6 items-center">
              {/* Our Team Score */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs text-center">
                <span className="block text-xs font-extrabold text-emerald-800 truncate mb-1">
                  {settings.shortName} (Our Team)
                </span>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setOurScore((prev) => Math.max(0, (Number(prev) || 0) - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={ourScore}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                      setOurScore(val);
                    }}
                    className="w-16 h-12 text-center text-2xl font-black text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => setOurScore((prev) => (Number(prev) || 0) + 1)}
                    className="w-8 h-8 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Opponent Score */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs text-center">
                <span className="block text-xs font-extrabold text-slate-700 truncate mb-1">
                  {opponent.trim() ? opponent.trim() : 'Opponent'}
                </span>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setOpponentScore((prev) => Math.max(0, (Number(prev) || 0) - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={opponentScore}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                      setOpponentScore(val);
                    }}
                    className="w-16 h-12 text-center text-2xl font-black text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => setOpponentScore((prev) => (Number(prev) || 0) + 1)}
                    className="w-8 h-8 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Live Calculated Outcome Badge */}
            <div className={`mt-4 p-3 rounded-xl border flex items-center justify-between ${outcomeCardColor}`}>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider ${outcomeBadgeColor}`}>
                  {currentOutcome}
                </span>
                <span className="text-xs font-bold">
                  {currentOutcome === 'Win'
                    ? '3 Points Earned for the Club'
                    : currentOutcome === 'Draw'
                    ? '1 Point Earned for the Club'
                    : '0 Points (Loss)'}
                </span>
              </div>
              <span className="text-xs font-bold opacity-80">
                GD: {parsedOurScore - parsedOppScore > 0 ? `+${parsedOurScore - parsedOppScore}` : parsedOurScore - parsedOppScore}
              </span>
            </div>
          </div>

          {/* Venue (Home or Away) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Match Venue <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVenue('Home')}
                className={`py-2.5 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  venue === 'Home'
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Home ({settings.homePitch.split(' ')[0]})</span>
              </button>

              <button
                type="button"
                onClick={() => setVenue('Away')}
                className={`py-2.5 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  venue === 'Away'
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Away Match</span>
              </button>
            </div>
          </div>

          {/* Match Date */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Match Date <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setMatchDate(todayStr)}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded cursor-pointer ${
                    matchDate === todayStr ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setMatchDate(yesterdayStr)}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded cursor-pointer ${
                    matchDate === yesterdayStr ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Yesterday
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Competition Name (Optional) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Competition Name <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={competition}
              onChange={(e) => setCompetition(e.target.value)}
              placeholder="e.g. Sunday Premier League, Regional Cup"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
            />
            {/* Quick tag chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {suggestedCompetitions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setCompetition(tag)}
                  className="px-2 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer transition-colors border border-slate-200"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Notes (Optional) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Additional Match Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Scorers: Tom 14', Marcus 68'. Solid defensive performance in the second half."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 py-3 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white font-bold text-sm shadow transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Saving Match...' : 'Save Match Result'}</span>
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors cursor-pointer border border-slate-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
