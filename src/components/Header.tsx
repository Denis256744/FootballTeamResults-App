/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Header component for FootballTeamResults app.
 * Follows the green-and-white theme with responsive mobile/desktop layout.
 */

import React from 'react';
import { Shield, WifiOff } from 'lucide-react';
import { TeamSettings } from '../types/match';
import { PWAInstallButton } from './PWAInstallButton';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface HeaderProps {
  settings: TeamSettings;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ settings, activeTab, onTabChange }) => {
  const isOnline = useOnlineStatus();

  return (
    <header className="sticky top-0 z-40 bg-emerald-800 text-white shadow-md border-b border-emerald-900/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Team Info */}
          <div 
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            {/* Football Crest Badge */}
            <div className="relative w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-inner overflow-hidden border-2 border-emerald-400 group-hover:scale-105 transition-transform">
              <svg className="w-7 h-7 text-emerald-800" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" fill="#ffffff" stroke="#15803d" strokeWidth="1.5" />
                <polygon points="12,7 15,10 14,14 10,14 9,10" fill="#15803d" />
                <line x1="12" y1="2" x2="12" y2="7" stroke="#15803d" strokeWidth="1.5" />
                <line x1="22" y1="12" x2="15" y2="10" stroke="#15803d" strokeWidth="1.5" />
                <line x1="17" y1="21" x2="14" y2="14" stroke="#15803d" strokeWidth="1.5" />
                <line x1="7" y1="21" x2="10" y2="14" stroke="#15803d" strokeWidth="1.5" />
                <line x1="2" y1="12" x2="9" y2="10" stroke="#15803d" strokeWidth="1.5" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-white leading-none">
                  Football<span className="text-emerald-300">TeamResults</span>
                </h1>
                <span className="hidden md:inline-flex px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-emerald-700/80 text-emerald-200 border border-emerald-600/60">
                  {settings.season}
                </span>
              </div>
              <p className="text-xs text-emerald-200 font-medium truncate max-w-[200px] sm:max-w-xs">
                {settings.teamName} <span className="opacity-70">({settings.shortName})</span>
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-emerald-900/50 p-1 rounded-xl border border-emerald-700/60">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-emerald-100 hover:bg-emerald-700/60'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onTabChange('matches')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'matches'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-emerald-100 hover:bg-emerald-700/60'
              }`}
            >
              Match History
            </button>
            <button
              onClick={() => onTabChange('add-match')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'add-match'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-emerald-200 hover:bg-emerald-700/60'
              }`}
            >
              <span>+ Record Match</span>
            </button>
            <button
              onClick={() => onTabChange('stats')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-emerald-100 hover:bg-emerald-700/60'
              }`}
            >
              Statistics
            </button>
            <button
              onClick={() => onTabChange('settings')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-emerald-100 hover:bg-emerald-700/60'
              }`}
            >
              Settings & Backup
            </button>
          </nav>

          {/* Right Action Area: Status & Install */}
          <div className="flex items-center gap-2">
            {!isOnline && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-amber-500 text-amber-950">
                <WifiOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Offline</span>
              </span>
            )}

            <PWAInstallButton />
          </div>
        </div>
      </div>
    </header>
  );
};
