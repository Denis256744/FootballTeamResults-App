/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Backup, Import and Export utilities for FootballTeamResults app.
 * Provides JSON backup/restore and CSV spreadsheet export.
 */

import { MatchRecord, TeamSettings } from '../types/match';
import { sanitizeMatchRecord } from '../storage/matchStorage';

export interface BackupDataStructure {
  app: string;
  version: string;
  exportedAt: string;
  settings: TeamSettings;
  matches: MatchRecord[];
}

/**
 * Trigger a client-side file download
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export all matches and settings to a JSON file
 */
export function exportToJsonFile(matches: MatchRecord[], settings: TeamSettings): void {
  const data: BackupDataStructure = {
    app: 'FootballTeamResults',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    settings,
    matches,
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const dateStr = new Date().toISOString().split('T')[0];
  const safeTeamName = settings.teamName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const filename = `${safeTeamName}_matches_backup_${dateStr}.json`;

  downloadFile(jsonStr, filename, 'application/json');
}

/**
 * Helper to escape CSV cell content safely
 */
function escapeCsvCell(value: string | number | undefined): string {
  if (value === undefined || value === null) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Export all matches to a standard CSV file
 */
export function exportToCsvFile(matches: MatchRecord[], teamName: string): void {
  const headers = [
    'Date',
    'Our Team',
    'Opponent',
    'Venue',
    'Our Score',
    'Opponent Score',
    'Outcome',
    'Points',
    'Goal Difference',
    'Competition',
    'Notes',
  ];

  const rows = matches.map((m) => {
    const goalDiff = m.ourScore - m.opponentScore;
    return [
      escapeCsvCell(m.matchDate),
      escapeCsvCell(teamName),
      escapeCsvCell(m.opponent),
      escapeCsvCell(m.venue),
      escapeCsvCell(m.ourScore),
      escapeCsvCell(m.opponentScore),
      escapeCsvCell(m.outcome),
      escapeCsvCell(m.points),
      escapeCsvCell(goalDiff > 0 ? `+${goalDiff}` : goalDiff),
      escapeCsvCell(m.competition || ''),
      escapeCsvCell(m.notes || ''),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  const safeTeamName = teamName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const filename = `${safeTeamName}_match_records_${dateStr}.csv`;

  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

/**
 * Validate and parse an uploaded JSON backup file
 */
export function validateImportJson(rawText: string): {
  success: boolean;
  matches?: MatchRecord[];
  settings?: TeamSettings;
  error?: string;
} {
  try {
    const parsed = JSON.parse(rawText);

    let rawMatches: unknown[] = [];
    let settings: TeamSettings | undefined = undefined;

    if (Array.isArray(parsed)) {
      rawMatches = parsed;
    } else if (parsed && typeof parsed === 'object') {
      if (Array.isArray(parsed.matches)) {
        rawMatches = parsed.matches;
      }
      if (parsed.settings && typeof parsed.settings === 'object') {
        settings = {
          teamName: String(parsed.settings.teamName || '').trim() || 'Royal Lions',
          shortName: String(parsed.settings.shortName || '').trim() || 'RLFC',
          homePitch: String(parsed.settings.homePitch || '').trim() || 'Muteesa 1 Royal University grounds',
          season: String(parsed.settings.season || '').trim() || '2026/2027',
        };
      }
    } else {
      return {
        success: false,
        error: 'Invalid file format: Backup must be a JSON object or array of matches.',
      };
    }

    if (rawMatches.length === 0) {
      return {
        success: false,
        error: 'The uploaded backup file contains 0 match records.',
      };
    }

    const sanitizedMatches = rawMatches
      .map(sanitizeMatchRecord)
      .filter((m): m is MatchRecord => m !== null);

    if (sanitizedMatches.length === 0) {
      return {
        success: false,
        error: 'No valid match records could be found in the file. Please check the JSON format.',
      };
    }

    return {
      success: true,
      matches: sanitizedMatches,
      settings,
    };
  } catch {
    return {
      success: false,
      error: 'Could not parse file. Please select a valid JSON backup file.',
    };
  }
}
