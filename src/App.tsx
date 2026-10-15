/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * FootballTeamResults - Main Application Component
 * Complete Android-Ready Football Results & Standings App
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { AddMatchForm } from './components/AddMatchForm';
import { MatchHistory } from './components/MatchHistory';
import { TeamStatistics } from './components/TeamStatistics';
import { SettingsBackup } from './components/SettingsBackup';
import { useFootballData } from './hooks/useFootballData';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { MatchRecord } from './types/match';
import { ShieldCheck, WifiOff } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedMatch, setSelectedMatch] = useState<MatchRecord | null>(null);

  const {
    matches,
    settings,
    stats,
    isLoading,
    refreshData,
    updateSettings,
  } = useFootballData();

  const isOnline = useOnlineStatus();

  // Navigation handlers
  const handleSelectRecentMatch = (match: MatchRecord) => {
    setSelectedMatch(match);
    setActiveTab('matches');
  };

  const handleRecordMatchSuccess = () => {
    setActiveTab('matches');
  };

  const handleCancelAddMatch = () => {
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Offline Toast Banner when connection drops */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-1.5 shadow-sm sticky top-0 z-50">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode Active — All match records and statistics are saved locally on your device.</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        settings={settings}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setSelectedMatch(null);
          setActiveTab(tab);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-5 sm:pt-6 pb-24 md:pb-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs font-medium">Loading match database...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                stats={stats}
                settings={settings}
                recentMatches={matches.slice(0, 5)}
                onNavigate={(tab) => {
                  setSelectedMatch(null);
                  setActiveTab(tab);
                }}
                onSelectMatch={handleSelectRecentMatch}
              />
            )}

            {activeTab === 'matches' && (
              <MatchHistory
                matches={matches}
                settings={settings}
                onNavigateAddMatch={() => setActiveTab('add-match')}
                selectedMatchFromOutside={selectedMatch}
                onClearSelectedMatch={() => setSelectedMatch(null)}
              />
            )}

            {activeTab === 'add-match' && (
              <AddMatchForm
                settings={settings}
                onSuccess={handleRecordMatchSuccess}
                onCancel={handleCancelAddMatch}
              />
            )}

            {activeTab === 'stats' && (
              <TeamStatistics
                stats={stats}
                settings={settings}
                matches={matches}
                onNavigateAddMatch={() => setActiveTab('add-match')}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsBackup
                settings={settings}
                matches={matches}
                onUpdateSettings={updateSettings}
                onRefreshData={refreshData}
              />
            )}
          </>
        )}
      </main>

      {/* Footer (desktop) */}
      <footer className="hidden md:block bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>FootballTeamResults • Coursework Edition</span>
          </div>
          <div className="text-slate-400">
            Persistent Offline Storage (IndexedDB + LocalStorage) • Android PWA Compatible
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation (Android style) */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setSelectedMatch(null);
          setActiveTab(tab);
        }}
        matchesCount={matches.length}
      />
    </div>
  );
}
