'use client';

import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { MistakeEntry, MistakeTag, SubjectName, MockTestRecord } from '../types';
import { physicsChaptersData } from '../data/physicsChapters';
import { chemistryChaptersData } from '../data/chemistryChapters';
import { mathsChaptersData } from '../data/mathsChapters';
import { storage } from '../utils/storage';

interface MistakeNotebookProps {
  mistakes: MistakeEntry[];
  mockRecords: MockTestRecord[];
  onMistakesUpdated: (updated: MistakeEntry[]) => void;
  filterSubject?: SubjectName;
  filterTestId?: string;
}

const TAG_OPTIONS: MistakeTag[] = [
  'Calculation / Silly Error',
  'Conceptual Gap',
  'Formula Forgotten',
  'Misread Question / Trap',
  'Time Pressure',
  'Wild Guess',
  'Exam Panic',
];

export const MistakeNotebook: React.FC<MistakeNotebookProps> = ({
  mistakes,
  mockRecords,
  onMistakesUpdated,
  filterSubject,
  filterTestId,
}) => {
  const [activeSubject, setActiveSubject] = useState<SubjectName | 'all'>(filterSubject || 'all');
  const [activeTag, setActiveTag] = useState<MistakeTag | 'all'>('all');
  const [activeStatus, setActiveStatus] = useState<'all' | 'Needs Revision' | 'Reviewed' | 'Mastered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [newSubject, setNewSubject] = useState<SubjectName>(filterSubject || 'physics');
  const [newChapter, setNewChapter] = useState('');
  const [newTestName, setNewTestName] = useState(
    filterTestId
      ? mockRecords.find(m => m.id === filterTestId)?.name || ''
      : (mockRecords[0]?.name || 'Mock Test')
  );
  const [newQuestionNum, setNewQuestionNum] = useState<number | string>('');
  const [newTag, setNewTag] = useState<MistakeTag>('Calculation / Silly Error');
  const [newDescription, setNewDescription] = useState('');
  const [newKeyLearning, setNewKeyLearning] = useState('');
  const [newStatus, setNewStatus] = useState<'Needs Revision' | 'Reviewed' | 'Mastered'>('Needs Revision');

  const availableChapters = useMemo(() => {
    if (newSubject === 'physics') return physicsChaptersData.map(c => c.chapter);
    if (newSubject === 'chemistry') return chemistryChaptersData.map(c => c.chapter);
    return mathsChaptersData.map(c => c.chapter);
  }, [newSubject]);

  React.useEffect(() => {
    if (availableChapters.length > 0 && !availableChapters.includes(newChapter)) {
      setNewChapter(availableChapters[0]);
    }
  }, [newSubject, availableChapters, newChapter]);

  const handleAddMistake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim()) {
      alert('Please describe what went wrong');
      return;
    }

    const newEntry: MistakeEntry = {
      id: `mistake-${Date.now()}`,
      testName: newTestName.trim() || undefined,
      subject: newSubject,
      chapter: newChapter || availableChapters[0],
      questionNumber: newQuestionNum || undefined,
      tag: newTag,
      description: newDescription.trim(),
      keyLearning: newKeyLearning.trim() || 'Review concept and re-solve.',
      status: newStatus,
      createdAt: new Date().toISOString(),
    };

    const updated = [newEntry, ...mistakes];
    storage.saveMistakes(updated);
    onMistakesUpdated(updated);

    setNewDescription('');
    setNewKeyLearning('');
    setNewQuestionNum('');
    setIsFormOpen(false);
  };

  const handleDeleteMistake = (id: string) => {
    if (confirm('Delete this mistake?')) {
      const updated = mistakes.filter(m => m.id !== id);
      storage.saveMistakes(updated);
      onMistakesUpdated(updated);
    }
  };

  const handleToggleStatus = (id: string) => {
    const cycle: Record<'Needs Revision' | 'Reviewed' | 'Mastered', 'Needs Revision' | 'Reviewed' | 'Mastered'> = {
      'Needs Revision': 'Reviewed',
      'Reviewed': 'Mastered',
      'Mastered': 'Needs Revision',
    };

    const updated = mistakes.map(m => {
      if (m.id === id) {
        return { ...m, status: cycle[m.status] };
      }
      return m;
    });
    storage.saveMistakes(updated);
    onMistakesUpdated(updated);
  };

  const filteredMistakes = useMemo(() => {
    return mistakes.filter(m => {
      if (activeSubject !== 'all' && m.subject !== activeSubject) return false;
      if (activeTag !== 'all' && m.tag !== activeTag) return false;
      if (activeStatus !== 'all' && m.status !== activeStatus) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        if (
          !m.chapter.toLowerCase().includes(query) &&
          !m.description.toLowerCase().includes(query) &&
          !m.keyLearning.toLowerCase().includes(query) &&
          !m.testName?.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [mistakes, activeSubject, activeTag, activeStatus, searchQuery]);

  const sillyCount = mistakes.filter(m => m.tag === 'Calculation / Silly Error').length;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-12 px-1 sm:px-0">
      {/* Header and Summary */}
      <div className="bg-[#0f1420] rounded-xl border border-slate-800 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">Mistake Notebook</h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Log errors to pinpoint root causes and avoid repeats.
            </p>
          </div>

          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition self-start sm:self-auto active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            {isFormOpen ? 'Close Form' : 'Log Mistake'}
          </button>
        </div>

        {/* Minimal stats */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 pt-3 border-t border-slate-800/80 text-[11px] sm:text-xs text-slate-400">
          <div>
            <span>Total Logged: </span>
            <strong className="text-slate-200">{mistakes.length}</strong>
          </div>
          <span className="text-slate-700">•</span>
          <div>
            <span>Silly Errors: </span>
            <strong className="text-amber-400">{sillyCount}</strong>
          </div>
          <span className="text-slate-700">•</span>
          <div>
            <span>Potential Gain: </span>
            <strong className="text-emerald-400">+{sillyCount * 5} marks</strong>
          </div>
        </div>
      </div>

      {/* Form (Collapsible) */}
      {isFormOpen && (
        <form onSubmit={handleAddMistake} className="bg-[#0f1420] rounded-xl border border-slate-750 p-4 sm:p-5 shadow-lg">
          <h3 className="text-xs sm:text-sm font-semibold text-white pb-2.5 border-b border-slate-800 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-400" />
            Log New Error
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Subject</label>
              <select
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value as SubjectName)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:border-blue-500"
              >
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="maths">Mathematics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Chapter</label>
              <select
                value={newChapter}
                onChange={(e) => setNewChapter(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:border-blue-500"
              >
                {availableChapters.map(ch => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Error Category</label>
              <select
                value={newTag}
                onChange={(e) => setNewTag(e.target.value as MistakeTag)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:border-blue-500"
              >
                {TAG_OPTIONS.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Mock Name</label>
              <input
                type="text"
                value={newTestName}
                onChange={(e) => setNewTestName(e.target.value)}
                placeholder="e.g. JEE Main 2024 Jan 27 S1"
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Question # (Optional)</label>
              <input
                type="text"
                value={newQuestionNum}
                onChange={(e) => setNewQuestionNum(e.target.value)}
                placeholder="e.g. Q14"
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:border-blue-500"
              >
                <option value="Needs Revision">Needs Revision</option>
                <option value="Reviewed">Reviewed</option>
                <option value="Mastered">Mastered</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-slate-400 mb-1">What went wrong?</label>
              <textarea
                rows={2}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Explain what caused the mistake..."
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:border-blue-500"
                required
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-slate-400 mb-1">Key Learning / Formula Remedy</label>
              <textarea
                rows={2}
                value={newKeyLearning}
                onChange={(e) => setNewKeyLearning(e.target.value)}
                placeholder="How to prevent this in the next test..."
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-900 active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95"
            >
              Save Entry
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#0f1420] rounded-xl border border-slate-800 p-2.5 sm:p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by chapter, text, or test..."
            className="w-full pl-8 pr-3 py-1 bg-slate-900 border border-slate-800 rounded-md text-xs text-white focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center rounded-md bg-slate-900 p-0.5 border border-slate-800 shrink-0">
            {(['all', 'physics', 'chemistry', 'maths'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setActiveSubject(s)}
                className={`px-2 py-1 rounded text-xs font-medium capitalize transition active:scale-95 ${
                  activeSubject === s
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <select
            value={activeStatus}
            onChange={(e) => setActiveStatus(e.target.value as any)}
            className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-md text-xs text-slate-300 shrink-0"
          >
            <option value="all">All</option>
            <option value="Needs Revision">Needs Rev</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Mastered">Mastered</option>
          </select>
        </div>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {filteredMistakes.map((entry) => (
          <div
            key={entry.id}
            className="bg-[#0f1420] rounded-xl border border-slate-800 p-3.5 sm:p-4 flex flex-col justify-between hover:border-slate-700 transition"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${entry.subject === 'physics'
                    ? 'text-sky-400 bg-sky-500/10'
                    : entry.subject === 'chemistry'
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : 'text-amber-400 bg-amber-500/10'
                    }`}>
                    {entry.subject}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-900 truncate max-w-[140px]">
                    {entry.tag}
                  </span>
                </div>

                <button
                  onClick={() => handleToggleStatus(entry.id)}
                  className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded font-medium flex items-center gap-1 active:scale-95 ${
                    entry.status === 'Mastered'
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : entry.status === 'Reviewed'
                      ? 'text-blue-400 bg-blue-500/10'
                      : 'text-amber-400 bg-amber-500/10'
                    }`}
                >
                  {entry.status === 'Mastered' && <CheckCircle2 className="w-3 h-3" />}
                  {entry.status}
                </button>
              </div>

              {/* Title */}
              <div className="mt-2">
                <div className="text-xs font-semibold text-white">
                  {entry.chapter} {entry.questionNumber && <span className="text-slate-400 font-normal">({entry.questionNumber})</span>}
                </div>
                {entry.testName && (
                  <div className="text-[10px] text-slate-500 mt-0.5">{entry.testName}</div>
                )}
              </div>

              {/* Description */}
              <div className="mt-2 p-2 rounded bg-slate-900/60 text-xs text-slate-300">
                <strong className="text-rose-400 font-medium block text-[10px] uppercase">The Mistake:</strong>
                <p className="mt-0.5 leading-relaxed text-[11px] sm:text-xs">{entry.description}</p>
              </div>

              {/* Key Learning */}
              <div className="mt-2 p-2 rounded bg-slate-900/60 text-xs text-slate-300">
                <strong className="text-blue-400 font-medium block text-[10px] uppercase">Remedy & Formula:</strong>
                <p className="mt-0.5 leading-relaxed text-[11px] sm:text-xs">{entry.keyLearning}</p>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
              <span>{new Date(entry.createdAt).toLocaleDateString('en-GB')}</span>
              <button
                onClick={() => handleDeleteMistake(entry.id)}
                className="text-slate-500 hover:text-rose-400 transition active:scale-90"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
