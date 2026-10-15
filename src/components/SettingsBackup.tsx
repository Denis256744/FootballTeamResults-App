/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Settings, Data Backup, and Android Installation Component:
 * - Team Profile customizations (Name, Acronym, Home Pitch, Season)
 * - JSON Backup & Restore with validation and preview confirmation
 * - CSV Spreadsheet Export (Excel & Google Sheets compatible)
 * - Clear / Reset Database with double confirmation
 * - Android Installation Guide & Capacitor APK packaging workflow
 */

import React, { useState, useRef } from 'react';
import {
  Save,
  Download,
  Upload,
  FileSpreadsheet,
  FileJson,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { MatchRecord, TeamSettings } from '../types/match';
import { clearAllMatches, importMatches } from '../storage/matchStorage';
import {
  exportToJsonFile,
  exportToCsvFile,
  validateImportJson,
} from '../utils/backupUtils';

interface SettingsBackupProps {
  settings: TeamSettings;
  matches: MatchRecord[];
  onUpdateSettings: (newSettings: TeamSettings) => void;
  onRefreshData: () => void;
}

export const SettingsBackup: React.FC<SettingsBackupProps> = ({
  settings,
  matches,
  onUpdateSettings,
  onRefreshData,
}) => {
  const [teamName, setTeamName] = useState(settings.teamName);
  const [shortName, setShortName] = useState(settings.shortName);
  const [homePitch, setHomePitch] = useState(settings.homePitch);
  const [season, setSeason] = useState(settings.season);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  React.useEffect(() => {
    setTeamName(settings.teamName);
    setShortName(settings.shortName);
    setHomePitch(settings.homePitch);
    setSeason(settings.season);
  }, [settings]);

  // Import State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importPreview, setImportPreview] = useState<{
    matches: MatchRecord[];
    settings?: TeamSettings;
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Clear / Reset Modal State
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearConfirmText, setClearConfirmText] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  // Handle Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: TeamSettings = {
      teamName: teamName.trim() || 'My Football Club',
      shortName: shortName.trim().toUpperCase() || 'MFC',
      homePitch: homePitch.trim() || 'Home Pitch',
      season: season.trim() || '2026/2027',
    };
    onUpdateSettings(updated);
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  // Handle JSON Export
  const handleExportJson = () => {
    exportToJsonFile(matches, settings);
  };

  // Handle CSV Export
  const handleExportCsv = () => {
    exportToCsvFile(matches, settings.teamName);
  };

  // Handle File Input Change for JSON Import
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = validateImportJson(content);
      if (result.success && result.matches) {
        setImportPreview({
          matches: result.matches,
          settings: result.settings,
        });
      } else {
        setImportError(result.error || 'Failed to validate JSON backup file.');
      }
    };
    reader.onerror = () => {
      setImportError('Failed to read the selected file.');
    };
    reader.readAsText(file);

    // Reset input so same file can be chosen again if needed
    e.target.value = '';
  };

  // Confirm Import (replace or merge)
  const handleExecuteImport = async (mode: 'replace' | 'merge') => {
    if (!importPreview) return;
    setIsImporting(true);

    try {
      const count = await importMatches(importPreview.matches, mode);

      if (importPreview.settings) {
        onUpdateSettings(importPreview.settings);
        setTeamName(importPreview.settings.teamName);
        setShortName(importPreview.settings.shortName);
        setHomePitch(importPreview.settings.homePitch);
        setSeason(importPreview.settings.season);
      }

      onRefreshData();
      setImportPreview(null);
      setImportSuccess(
        `Successfully imported ${count} match records (${mode === 'replace' ? 'replaced existing database' : 'merged with existing'}).`
      );
      setTimeout(() => setImportSuccess(null), 5000);
    } catch (err) {
      console.error('Import error:', err);
      setImportError('Failed to write imported matches to storage.');
    } finally {
      setIsImporting(false);
    }
  };

  // Execute Clear Database
  const handleExecuteClear = async () => {
    if (clearConfirmText.trim().toUpperCase() !== 'DELETE') return;
    setIsClearing(true);
    try {
      await clearAllMatches();
      onRefreshData();
      setShowClearModal(false);
      setClearConfirmText('');
    } catch (err) {
      console.error('Clear database error:', err);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 md:pb-6">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Settings & Data Management
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure club details, manage offline storage, export reports, and view Android installation steps.
        </p>
      </div>

      {/* Team Profile Settings Form */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Club & Team Profile</h3>
            <p className="text-xs text-slate-500">Customise your team name and home ground</p>
          </div>
          {settingsSavedToast && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Settings Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Team Full Name
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Royal Lions"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Team Short Code / Acronym
              </label>
              <input
                type="text"
                maxLength={6}
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="e.g. RLFC"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Home Pitch / Stadium Name
              </label>
              <input
                type="text"
                value={homePitch}
                onChange={(e) => setHomePitch(e.target.value)}
                placeholder="e.g. Muteesa 1 Royal University grounds"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Current Season / Year
              </label>
              <input
                type="text"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                placeholder="e.g. 2026/2027"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Update Club Settings</span>
            </button>
          </div>
        </form>
      </div>

      {/* Export & Backup Section */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200 space-y-5">
        <div>
          <h3 className="text-base font-bold text-slate-900">Backup, Export & Transfer</h3>
          <p className="text-xs text-slate-500">
            Export your records to transferable file formats (JSON backup and CSV spreadsheet).
          </p>
        </div>

        {importSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{importSuccess}</span>
          </div>
        )}

        {importError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{importError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* JSON Export Card */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-1">
                <FileJson className="w-5 h-5 text-emerald-600" />
                <span>JSON Full Backup</span>
              </div>
              <p className="text-xs text-slate-600 mb-4">
                Exports all {matches.length} match records and settings into a standardized JSON file. Can be restored or imported on any device.
              </p>
            </div>
            <button
              onClick={handleExportJson}
              disabled={matches.length === 0}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON Backup ({matches.length})</span>
            </button>
          </div>

          {/* CSV Export Card */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-1">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span>CSV Spreadsheet Export</span>
              </div>
              <p className="text-xs text-slate-600 mb-4">
                Exports match records into a CSV table with columns for date, opponent, scores, outcome, points, and notes for Excel or Google Sheets.
              </p>
            </div>
            <button
              onClick={handleExportCsv}
              disabled={matches.length === 0}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV Spreadsheet</span>
            </button>
          </div>
        </div>

        {/* Import JSON Area */}
        <div className="pt-2 border-t border-slate-100">
          <input
            type="file"
            ref={fileInputRef}
            accept=".json,application/json"
            onChange={handleFileSelected}
            className="hidden"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Restore From JSON Backup
              </span>
              <span className="text-xs text-slate-500">
                Upload a previously exported JSON backup file to restore match records.
              </span>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Select Backup File (.json)</span>
            </button>
          </div>
        </div>
      </div>


      {/* Danger Zone: Reset / Clear Database */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-rose-200">
        <div className="flex items-center gap-2 text-rose-700 mb-2">
          <Trash2 className="w-5 h-5" />
          <h3 className="text-base font-bold">Danger Zone: Clear Database</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Permanently erase all {matches.length} recorded matches from local device storage. This action cannot be undone unless you have a JSON backup.
        </p>

        <button
          type="button"
          onClick={() => {
            setClearConfirmText('');
            setShowClearModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-300 transition-colors cursor-pointer"
        >
          Clear All Match Records
        </button>
      </div>

      {/* Import Preview Confirmation Modal */}
      {importPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-emerald-700 mb-3">
              <div className="p-2.5 rounded-full bg-emerald-100">
                <FileJson className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Confirm Backup Import</h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 mb-4">
              Found <strong className="text-slate-900">{importPreview.matches.length} valid match records</strong> in the uploaded backup file.
              {importPreview.settings && (
                <span> Team profile settings for <strong>{importPreview.settings.teamName}</strong> were also detected.</span>
              )}
            </p>

            <div className="space-y-2 mb-5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Choose Import Mode:
              </span>
              <button
                type="button"
                onClick={() => handleExecuteImport('merge')}
                disabled={isImporting}
                className="w-full p-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-left cursor-pointer transition-colors"
              >
                <div className="font-bold text-xs text-emerald-900">Merge with Existing Records (Recommended)</div>
                <div className="text-[11px] text-emerald-700">Keeps your existing {matches.length} matches and adds new ones.</div>
              </button>

              <button
                type="button"
                onClick={() => handleExecuteImport('replace')}
                disabled={isImporting}
                className="w-full p-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-left cursor-pointer transition-colors"
              >
                <div className="font-bold text-xs text-rose-900">Replace Entire Database</div>
                <div className="text-[11px] text-rose-700">Wipes current records and replaces with backup data.</div>
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setImportPreview(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2.5 rounded-full bg-rose-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Confirm Complete Data Wipe</h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 mb-3">
              This will permanently delete all <strong className="text-slate-900">{matches.length} matches</strong> from your device storage. To confirm, please type <strong className="text-rose-600">DELETE</strong> below:
            </p>

            <input
              type="text"
              value={clearConfirmText}
              onChange={(e) => setClearConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold uppercase mb-4 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-400/20"
            />

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteClear}
                disabled={clearConfirmText.trim().toUpperCase() !== 'DELETE' || isClearing}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                {isClearing ? 'Clearing...' : 'Wipe Database'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
