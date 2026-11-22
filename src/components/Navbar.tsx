'use client';

import React from 'react';
import { 
  Calculator, 
  GitCompare, 
  BookOpen, 
  Table2, 
  CheckSquare, 
  Download, 
  Upload, 
  RotateCcw
} from 'lucide-react';
import { storage } from '../utils/storage';

export type ActiveTab = 'analyzer' | 'comparison' | 'mistakes' | 'sheet' | 'checklist';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onDataReset: () => void;
  onDataImported: () => void;
  totalMocksCount: number;
  totalMistakesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onDataReset,
  onDataImported,
  totalMocksCount,
  totalMistakesCount,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = storage.exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jee-score-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (storage.importData(content)) {
        alert('Data successfully imported!');
        onDataImported();
      } else {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
    if (confirm('Reset all data to defaults?')) {
      storage.resetAll();
      onDataReset();
    }
  };

  const tabs: { id: ActiveTab; label: string; shortLabel: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'analyzer', label: 'Score Calculator', shortLabel: 'Score', icon: <Calculator className="w-4 h-4" /> },
    { id: 'comparison', label: 'Past Comparison & Weak Areas', shortLabel: 'Compare', icon: <GitCompare className="w-4 h-4" />, count: totalMocksCount },
    { id: 'mistakes', label: 'Mistake Notebook', shortLabel: 'Mistakes', icon: <BookOpen className="w-4 h-4" />, count: totalMistakesCount },
    { id: 'sheet', label: '15 Challenges Sheet', shortLabel: '15 Challenges', icon: <Table2 className="w-4 h-4" /> },
    { id: 'checklist', label: 'Mock Tracker', shortLabel: 'Mock List', icon: <CheckSquare className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0c1019]/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Top Header Row */}
        <div className="flex items-center justify-between h-13 sm:h-14 py-2">
          {/* Logo & Title */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-black text-xs sm:text-sm tracking-tighter shrink-0">
              JEE
            </div>
            <div className="flex items-baseline gap-1.5 truncate">
              <span className="font-bold text-white text-sm sm:text-base tracking-tight truncate">
                Score Analyzer
              </span>
              <span className="text-[11px] text-blue-400 font-medium hidden sm:inline">
                Main 2025/2026
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleExport}
              title="Backup data to JSON"
              className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <label
              title="Import JSON backup"
              className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition active:scale-95"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Import</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>

            <button
              onClick={handleReset}
              title="Reset data"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 transition active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Tab Navigation Bar */}
        <div className="flex space-x-1 overflow-x-auto pb-2 pt-1 border-t border-slate-800/50 scrollbar-none -mx-1 px-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 shrink-0 ${
                  isActive
                    ? 'bg-slate-800 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span className={isActive ? 'text-blue-400' : 'text-slate-400'}>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
