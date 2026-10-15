/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Mobile Bottom Navigation Bar styled like a native Android app.
 * Fixed to the bottom on mobile screens, hidden on desktop screens.
 */

import React from 'react';
import { LayoutDashboard, Calendar, PlusCircle, BarChart3, Settings } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  matchesCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  matchesCount,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] pb-safe">
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {/* Dashboard */}
        <button
          onClick={() => onTabChange('dashboard')}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            activeTab === 'dashboard'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${activeTab === 'dashboard' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[11px] mt-1">Dashboard</span>
        </button>

        {/* Matches */}
        <button
          onClick={() => onTabChange('matches')}
          className={`flex flex-col items-center justify-center py-1 relative transition-colors cursor-pointer ${
            activeTab === 'matches'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Calendar className={`w-5 h-5 ${activeTab === 'matches' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[11px] mt-1">Matches</span>
          {matchesCount > 0 && (
            <span className="absolute top-2 right-3 min-w-4 h-4 px-1 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold flex items-center justify-center">
              {matchesCount}
            </span>
          )}
        </button>

        {/* Add Match (Highlighted Center Button) */}
        <button
          onClick={() => onTabChange('add-match')}
          className="flex flex-col items-center justify-center -mt-3 group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-600 group-hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 transition-transform active:scale-95 border-2 border-white">
            <PlusCircle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className={`text-[10px] mt-0.5 font-bold ${activeTab === 'add-match' ? 'text-emerald-700' : 'text-slate-600'}`}>
            Record
          </span>
        </button>

        {/* Statistics */}
        <button
          onClick={() => onTabChange('stats')}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            activeTab === 'stats'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <BarChart3 className={`w-5 h-5 ${activeTab === 'stats' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[11px] mt-1">Stats</span>
        </button>

        {/* Settings / Backup */}
        <button
          onClick={() => onTabChange('settings')}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            activeTab === 'settings'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Settings className={`w-5 h-5 ${activeTab === 'settings' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[11px] mt-1">Settings</span>
        </button>
      </div>
    </nav>
  );
};
