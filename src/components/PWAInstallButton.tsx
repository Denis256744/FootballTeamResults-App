/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * In-App PWA Install Button and Android Installation Helper.
 */

import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle, Info } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already installed as standalone app, show a small badge or hide
  if (isInstalled) {
    return (
      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-800 text-emerald-100 border border-emerald-600">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
        App Installed
      </span>
    );
  }

  return (
    <>
      {isInstallable ? (
        <button
          onClick={install}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors cursor-pointer border border-emerald-400/40"
          title="Install FootballTeamResults to your home screen"
        >
          <Download className="w-4 h-4" />
          <span>Install App</span>
        </button>
      ) : (
        <button
          onClick={() => setShowGuide(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-800 text-emerald-100 text-xs font-medium transition-colors cursor-pointer border border-emerald-600"
          title="Android & iOS Installation Guide"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-300" />
          <span className="hidden xs:inline">Install on Phone</span>
          <span className="xs:hidden">Install</span>
        </button>
      )}

      {/* Installation Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {isIOS ? 'Install on iPhone / iPad' : 'Install on Android Phone'}
                </h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {isIOS ? (
                <>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="font-semibold text-emerald-900 mb-1">Apple iOS Safari Steps:</p>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-700">
                      <li>Tap the <strong>Share button</strong> (square with arrow up) at the bottom of Safari.</li>
                      <li>Scroll down and select <strong>Add to Home Screen</strong>.</li>
                      <li>Tap <strong>Add</strong> in the top-right corner.</li>
                    </ol>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="font-semibold text-emerald-900 mb-1">Android Chrome / Browser Steps:</p>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-700">
                      <li>Open the browser menu (tap the <strong>three dots ⋮</strong> at top right).</li>
                      <li>Select <strong>Add to Home screen</strong> or <strong>Install App</strong>.</li>
                      <li>Confirm by tapping <strong>Install</strong>.</li>
                    </ol>
                  </div>
                  <div className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-lg text-xs text-slate-500">
                    <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Once installed, the app launches standalone without browser navigation bars and stores all match results locally offline!</span>
                  </div>
                </>
              )}
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowGuide(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-colors cursor-pointer shadow-sm"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
