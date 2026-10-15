/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Central React hook managing football matches, team settings,
 * and live derived statistics. Synchronizes with IndexedDB and localStorage.
 */

import { useEffect, useMemo, useState, useCallback } from 'react';
import { MatchRecord, TeamSettings, TeamStatsSummary } from '../types/match';
import {
  getAllMatches,
  getTeamSettings,
  saveTeamSettings,
  DEFAULT_SETTINGS,
} from '../storage/matchStorage';
import { computeTeamStats } from '../utils/statsCalculator';

export function useFootballData() {
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [settings, setSettingsState] = useState<TeamSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load data function
  const loadData = useCallback(async () => {
    try {
      const storedSettings = getTeamSettings();
      setSettingsState(storedSettings);

      const records = await getAllMatches();
      setMatches(records);
    } catch (e) {
      console.warn('Error loading football data:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Listen for storage events (emitted when matches are added, edited, deleted, or imported)
    const handleMatchesUpdated = () => {
      loadData();
    };

    const handleSettingsUpdated = () => {
      setSettingsState(getTeamSettings());
    };

    window.addEventListener('football_matches_updated', handleMatchesUpdated);
    window.addEventListener('football_settings_updated', handleSettingsUpdated);
    window.addEventListener('storage', handleMatchesUpdated);

    return () => {
      window.removeEventListener('football_matches_updated', handleMatchesUpdated);
      window.removeEventListener('football_settings_updated', handleSettingsUpdated);
      window.removeEventListener('storage', handleMatchesUpdated);
    };
  }, [loadData]);

  // Derived statistics computed live from all stored matches
  const stats: TeamStatsSummary = useMemo(() => {
    return computeTeamStats(matches);
  }, [matches]);

  // Update settings handler
  const updateSettings = useCallback((newSettings: TeamSettings) => {
    saveTeamSettings(newSettings);
    setSettingsState(newSettings);
  }, []);

  return {
    matches,
    settings,
    stats,
    isLoading,
    refreshData: loadData,
    updateSettings,
  };
}
