/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Local persistent storage layer for FootballTeamResults app.
 * Uses client-side IndexedDB with a synchronous localStorage fallback.
 * Ensures zero-cloud dependency, 100% offline capabilities on Android & desktop,
 * and seamless data persistence across reloads and device restarts.
 */

import { MatchRecord, TeamSettings } from '../types/match';
import { calculateOutcome, calculatePoints } from '../utils/statsCalculator';

const DB_NAME = 'FootballTeamResultsDB';
const DB_VERSION = 1;
const MATCH_STORE = 'matches';
const SETTINGS_STORE = 'settings';

const LOCAL_STORAGE_MATCH_KEY = 'football_results_matches_v1';
const LOCAL_STORAGE_SETTINGS_KEY = 'football_results_settings_v1';

export const DEFAULT_SETTINGS: TeamSettings = {
  teamName: 'Royal Lions',
  shortName: 'RLFC',
  homePitch: 'Muteesa 1 Royal University grounds',
  season: '2026/2027',
};

/**
 * Open or upgrade the IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(MATCH_STORE)) {
        const matchStore = db.createObjectStore(MATCH_STORE, { keyPath: 'id' });
        matchStore.createIndex('matchDate', 'matchDate', { unique: false });
        matchStore.createIndex('opponent', 'opponent', { unique: false });
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Validate and sanitize a match record object
 */
export function sanitizeMatchRecord(raw: unknown): MatchRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Partial<MatchRecord>;

  if (typeof item.opponent !== 'string' || !item.opponent.trim()) return null;
  if (typeof item.matchDate !== 'string' || !item.matchDate.trim()) return null;

  const ourScore = Math.max(0, Math.floor(Number(item.ourScore) || 0));
  const opponentScore = Math.max(0, Math.floor(Number(item.opponentScore) || 0));
  const venue = item.venue === 'Away' ? 'Away' : 'Home';
  const outcome = calculateOutcome(ourScore, opponentScore);
  const points = calculatePoints(outcome);

  const id = typeof item.id === 'string' && item.id.trim() ? item.id : `match_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const createdAt = typeof item.createdAt === 'number' ? item.createdAt : Date.now();
  const updatedAt = typeof item.updatedAt === 'number' ? item.updatedAt : Date.now();

  return {
    id,
    opponent: item.opponent.trim(),
    ourScore,
    opponentScore,
    matchDate: item.matchDate.trim(),
    venue,
    competition: item.competition?.trim() || '',
    notes: item.notes?.trim() || '',
    outcome,
    points,
    createdAt,
    updatedAt,
  };
}

/**
 * Read matches synchronously from localStorage (used for instant initial load)
 */
function readMatchesFromLocalStorage(): MatchRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_MATCH_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(sanitizeMatchRecord).filter((m): m is MatchRecord => m !== null);
  } catch (e) {
    console.warn('Failed reading matches from localStorage:', e);
    return [];
  }
}

/**
 * Write matches to localStorage mirror
 */
function writeMatchesToLocalStorage(matches: MatchRecord[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_MATCH_KEY, JSON.stringify(matches));
  } catch (e) {
    console.warn('Failed saving matches to localStorage:', e);
  }
}

/**
 * Notify all UI components in the app that match data has changed
 */
function emitMatchesUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('football_matches_updated'));
  }
}

/**
 * Get all match records (attempts IndexedDB, syncs with localStorage)
 */
export async function getAllMatches(): Promise<MatchRecord[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(MATCH_STORE, 'readonly');
      const store = transaction.objectStore(MATCH_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const idbMatches = (request.result || [])
          .map(sanitizeMatchRecord)
          .filter((m): m is MatchRecord => m !== null);

        // Sort descending by matchDate, then createdAt
        idbMatches.sort((a, b) => b.matchDate.localeCompare(a.matchDate) || b.createdAt - a.createdAt);

        // Mirror to localStorage for backup safety
        writeMatchesToLocalStorage(idbMatches);
        resolve(idbMatches);
      };

      request.onerror = () => {
        // Fallback to localStorage
        resolve(readMatchesFromLocalStorage());
      };
    });
  } catch {
    return readMatchesFromLocalStorage();
  }
}

/**
 * Save a new match record
 */
export async function saveMatch(matchData: Omit<MatchRecord, 'id' | 'outcome' | 'points' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<MatchRecord> {
  const outcome = calculateOutcome(matchData.ourScore, matchData.opponentScore);
  const points = calculatePoints(outcome);
  const now = Date.now();

  const record: MatchRecord = {
    id: matchData.id || `match_${now}_${Math.random().toString(36).substring(2, 8)}`,
    opponent: matchData.opponent.trim(),
    ourScore: Math.max(0, Math.floor(matchData.ourScore)),
    opponentScore: Math.max(0, Math.floor(matchData.opponentScore)),
    matchDate: matchData.matchDate,
    venue: matchData.venue,
    competition: matchData.competition?.trim() || '',
    notes: matchData.notes?.trim() || '',
    outcome,
    points,
    createdAt: now,
    updatedAt: now,
  };

  // 1. Save to IndexedDB
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(MATCH_STORE, 'readwrite');
      const store = transaction.objectStore(MATCH_STORE);
      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('IndexedDB write error, falling back to localStorage only:', err);
  }

  // 2. Mirror into localStorage
  const current = readMatchesFromLocalStorage();
  const existingIdx = current.findIndex((m) => m.id === record.id);
  if (existingIdx >= 0) {
    current[existingIdx] = record;
  } else {
    current.unshift(record);
  }
  writeMatchesToLocalStorage(current);

  emitMatchesUpdated();
  return record;
}

/**
 * Update an existing match record
 */
export async function updateMatch(record: MatchRecord): Promise<MatchRecord> {
  const sanitized = sanitizeMatchRecord(record);
  if (!sanitized) throw new Error('Invalid match record data');

  sanitized.updatedAt = Date.now();

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(MATCH_STORE, 'readwrite');
      const store = transaction.objectStore(MATCH_STORE);
      const request = store.put(sanitized);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn('IndexedDB update error:', e);
  }

  const current = readMatchesFromLocalStorage();
  const idx = current.findIndex((m) => m.id === sanitized.id);
  if (idx >= 0) {
    current[idx] = sanitized;
  } else {
    current.unshift(sanitized);
  }
  writeMatchesToLocalStorage(current);

  emitMatchesUpdated();
  return sanitized;
}

/**
 * Delete a match record by ID
 */
export async function deleteMatch(id: string): Promise<boolean> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(MATCH_STORE, 'readwrite');
      const store = transaction.objectStore(MATCH_STORE);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn('IndexedDB delete error:', e);
  }

  const current = readMatchesFromLocalStorage().filter((m) => m.id !== id);
  writeMatchesToLocalStorage(current);

  emitMatchesUpdated();
  return true;
}

/**
 * Clear all matches (destructive, used for resetting data)
 */
export async function clearAllMatches(): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(MATCH_STORE, 'readwrite');
      const store = transaction.objectStore(MATCH_STORE);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn('IndexedDB clear error:', e);
  }

  localStorage.removeItem(LOCAL_STORAGE_MATCH_KEY);
  emitMatchesUpdated();
}

/**
 * Bulk overwrite or merge matches (used by JSON import)
 */
export async function importMatches(
  incoming: MatchRecord[],
  mode: 'replace' | 'merge'
): Promise<number> {
  const validIncoming = incoming
    .map(sanitizeMatchRecord)
    .filter((m): m is MatchRecord => m !== null);

  let finalMatches: MatchRecord[];

  if (mode === 'replace') {
    finalMatches = validIncoming;
  } else {
    const current = await getAllMatches();
    const existingIds = new Set(current.map((m) => m.id));
    const merged = [...current];

    for (const m of validIncoming) {
      if (existingIds.has(m.id)) {
        // Update existing
        const idx = merged.findIndex((x) => x.id === m.id);
        if (idx >= 0) merged[idx] = m;
      } else {
        merged.push(m);
        existingIds.add(m.id);
      }
    }
    finalMatches = merged;
  }

  // Write to IndexedDB
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(MATCH_STORE, 'readwrite');
      const store = transaction.objectStore(MATCH_STORE);
      if (mode === 'replace') {
        store.clear();
      }
      for (const m of validIncoming) {
        store.put(m);
      }
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (e) {
    console.warn('IndexedDB bulk write error:', e);
  }

  writeMatchesToLocalStorage(finalMatches);
  emitMatchesUpdated();
  return validIncoming.length;
}

/**
 * Team Settings Storage
 */
export function getTeamSettings(): TeamSettings {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    let teamName = parsed.teamName?.trim() || DEFAULT_SETTINGS.teamName;
    let shortName = parsed.shortName?.trim() || DEFAULT_SETTINGS.shortName;
    
    // Automatically migrate legacy default if present
    if (teamName === 'Green Lions FC' || teamName === 'My Football Club') {
      teamName = 'Royal Lions';
      shortName = 'RLFC';
    }

    let homePitch = parsed.homePitch?.trim() || DEFAULT_SETTINGS.homePitch;
    if (homePitch === 'St. Patrick Community Ground' || !homePitch) {
      homePitch = 'Muteesa 1 Royal University grounds';
    }

    const currentSeason = parsed.season?.trim() || DEFAULT_SETTINGS.season;

    // Persist migrated defaults if changed
    if (teamName !== parsed.teamName || shortName !== parsed.shortName || homePitch !== parsed.homePitch) {
      saveTeamSettings({
        teamName,
        shortName,
        homePitch,
        season: currentSeason,
      });
    }

    return {
      teamName,
      shortName,
      homePitch,
      season: currentSeason,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveTeamSettings(settings: TeamSettings): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('football_settings_updated'));
    }
  } catch (e) {
    console.warn('Error saving team settings:', e);
  }
}
