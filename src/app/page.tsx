'use client';

import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from '../components/Navbar';
import { ScoreCalculator } from '../components/ScoreCalculator';
import { ComparisonView } from '../components/ComparisonView';
import { MistakeNotebook } from '../components/MistakeNotebook';
import { ChapterTrackerSheet } from '../components/ChapterTrackerSheet';
import { MockTestTracker } from '../components/MockTestTracker';
import { MockTestRecord, MistakeEntry, MockChecklistItem, SubjectName } from '../types';
import { storage } from '../utils/storage';
import { Flame, Target, Trophy, Sparkles, BookOpen } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('analyzer');
  const [mockRecords, setMockRecords] = useState<MockTestRecord[]>([]);
  const [mistakes, setMistakes] = useState<MistakeEntry[]>([]);
  const [checklist, setChecklist] = useState<MockChecklistItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Cross-navigation context
  const [selectedMockNameForCalc, setSelectedMockNameForCalc] = useState<string>('');
  const [mistakeFilterSubject, setMistakeFilterSubject] = useState<SubjectName | undefined>(undefined);
  const [mistakeFilterTestId, setMistakeFilterTestId] = useState<string | undefined>(undefined);

  // Initialize from storage on client mount
  useEffect(() => {
    setIsClient(true);
    setMockRecords(storage.getMockRecords());
    setMistakes(storage.getMistakes());
    setChecklist(storage.getMockChecklist());
  }, []);

  const refreshAllData = () => {
    setMockRecords(storage.getMockRecords());
    setMistakes(storage.getMistakes());
    setChecklist(storage.getMockChecklist());
  };

  const handleTestSaved = (newRecord: MockTestRecord) => {
    setMockRecords((prev) => [newRecord, ...prev]);

    // Also update checklist if a mock with this name exists
    const updatedChecklist = checklist.map((item) => {
      if (item.name.toLowerCase() === newRecord.name.toLowerCase()) {
        return {
          ...item,
          status: 'Completed' as const,
          score: newRecord.totalScore,
          accuracy: newRecord.overallAccuracy,
          completedDate: newRecord.date,
          mockRecordId: newRecord.id,
        };
      }
      return item;
    });
    setChecklist(updatedChecklist);
    storage.saveMockChecklist(updatedChecklist);
  };

  const handleNavigateToMistakes = (testId?: string, subject?: SubjectName) => {
    setMistakeFilterTestId(testId);
    setMistakeFilterSubject(subject);
    setActiveTab('mistakes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectMockForScore = (testName: string) => {
    setSelectedMockNameForCalc(testName);
    setActiveTab('analyzer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading JEE Score Analyzer...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-between">
      <div>
        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onDataReset={refreshAllData}
          onDataImported={refreshAllData}
          totalMocksCount={mockRecords.length}
          totalMistakesCount={mistakes.length}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {activeTab === 'analyzer' && (
            <ScoreCalculator
              onTestSaved={handleTestSaved}
              onNavigateToMistakes={handleNavigateToMistakes}
              initialTestName={selectedMockNameForCalc}
            />
          )}

          {activeTab === 'comparison' && (
            <ComparisonView
              mockRecords={mockRecords}
              onNavigateToMistakes={handleNavigateToMistakes}
              onNavigateToCalculator={() => setActiveTab('analyzer')}
            />
          )}

          {activeTab === 'mistakes' && (
            <MistakeNotebook
              mistakes={mistakes}
              mockRecords={mockRecords}
              onMistakesUpdated={setMistakes}
              filterSubject={mistakeFilterSubject}
              filterTestId={mistakeFilterTestId}
            />
          )}

          {activeTab === 'sheet' && (
            <ChapterTrackerSheet initialSubject="physics" />
          )}

          {activeTab === 'checklist' && (
            <MockTestTracker
              checklist={checklist}
              onChecklistUpdated={setChecklist}
              onSelectMockForScore={handleSelectMockForScore}
              mockRecords={mockRecords}
            />
          )}
        </main>
      </div>

      {/* Motivational Footer */}
      <footer className="mt-16 border-t border-slate-800/80 bg-slate-950/80 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2 text-slate-400">
            <Target className="w-4 h-4 text-blue-500" />
            <span>
              <strong>JEE Main Prep Engine:</strong> +4 marks per correct answer, -1 mark penalty per error. Eliminate silly mistakes to cross the 99%ile mark!
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Data stored locally in your browser</span>
            <span>•</span>
            <button
              onClick={() => {
                const data = storage.exportAllData();
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `jee-score-backup-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
              }}
              className="text-blue-400 hover:underline"
            >
              Quick Backup
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
