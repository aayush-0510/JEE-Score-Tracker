'use client';

import React, { useState, useMemo } from 'react';
import { 
  CheckSquare, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Calculator,
  Search
} from 'lucide-react';
import { MockChecklistItem, MockTestRecord } from '../types';
import { storage } from '../utils/storage';

interface MockTestTrackerProps {
  checklist: MockChecklistItem[];
  onChecklistUpdated: (updated: MockChecklistItem[]) => void;
  onSelectMockForScore: (testName: string) => void;
  mockRecords: MockTestRecord[];
}

export const MockTestTracker: React.FC<MockTestTrackerProps> = ({
  checklist,
  onChecklistUpdated,
  onSelectMockForScore,
  mockRecords,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'In Progress' | 'Completed'>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [newName, setNewName] = useState('');
  const [newSeries, setNewSeries] = useState('NTA Official 2024');
  const [newTargetDate, setNewTargetDate] = useState('');

  const handleToggleStatus = (id: string) => {
    const cycle: Record<MockChecklistItem['status'], MockChecklistItem['status']> = {
      'Pending': 'In Progress',
      'In Progress': 'Completed',
      'Completed': 'Pending',
    };

    const updated = checklist.map((item) => {
      if (item.id === id) {
        const next = cycle[item.status];
        return {
          ...item,
          status: next,
          completedDate: next === 'Completed' ? new Date().toISOString().slice(0, 10) : item.completedDate,
        };
      }
      return item;
    });
    storage.saveMockChecklist(updated);
    onChecklistUpdated(updated);
  };

  const handleAddMock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newItem: MockChecklistItem = {
      id: `chk-${Date.now()}`,
      name: newName.trim(),
      series: newSeries.trim() || 'General Mock',
      type: 'Full Syllabus',
      status: 'Pending',
      targetDate: newTargetDate || undefined,
    };

    const updated = [newItem, ...checklist];
    storage.saveMockChecklist(updated);
    onChecklistUpdated(updated);

    setNewName('');
    setIsAddOpen(false);
  };

  const handleDeleteMock = (id: string) => {
    if (confirm('Delete this mock test from tracker?')) {
      const updated = checklist.filter((m) => m.id !== id);
      storage.saveMockChecklist(updated);
      onChecklistUpdated(updated);
    }
  };

  const filtered = useMemo(() => {
    return checklist.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!item.name.toLowerCase().includes(q) && !item.series.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [checklist, statusFilter, searchQuery]);

  const completedCount = checklist.filter((m) => m.status === 'Completed').length;
  const percent = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-12 px-1 sm:px-0">
      {/* Header */}
      <div className="bg-[#0f1420] rounded-xl border border-slate-800 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">Mock Test Roadmap</h1>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                {percent}% Done ({completedCount}/{checklist.length})
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Keep track of official shifts and full-syllabus tests.
            </p>
          </div>

          <button
            onClick={() => setIsAddOpen(!isAddOpen)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition self-start sm:self-auto active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            {isAddOpen ? 'Close Form' : 'Add Mock'}
          </button>
        </div>

        {isAddOpen && (
          <form onSubmit={handleAddMock} className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Test Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. JEE Main 2024 4 April S2"
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Series</label>
              <input
                type="text"
                value={newSeries}
                onChange={(e) => setNewSeries(e.target.value)}
                placeholder="e.g. NTA Official 2024"
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Target Date</label>
              <input
                type="date"
                value={newTargetDate}
                onChange={(e) => setNewTargetDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:border-blue-500"
              />
            </div>
            <div className="sm:col-span-3 flex justify-end gap-2 mt-1">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-900 active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95"
              >
                Add Mock
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Filter bar */}
      <div className="bg-[#0f1420] rounded-xl border border-slate-800 p-2.5 sm:p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mocks..."
            className="w-full pl-8 pr-3 py-1 bg-slate-900 border border-slate-800 rounded-md text-xs text-white focus:border-blue-500"
          />
        </div>

        <div className="flex items-center rounded-md bg-slate-900 p-0.5 border border-slate-800 overflow-x-auto">
          {(['all', 'Pending', 'In Progress', 'Completed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition active:scale-95 shrink-0 ${
                statusFilter === s
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* MOBILE CARD VIEW (Phones) */}
      <div className="block sm:hidden space-y-2.5">
        {filtered.map((item) => {
          const record = mockRecords.find(r => r.name === item.name || r.id === item.mockRecordId);

          return (
            <div key={item.id} className="bg-[#0f1420] rounded-xl border border-slate-800 p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <button
                    onClick={() => handleToggleStatus(item.id)}
                    className={`w-6 h-6 mt-0.5 rounded-md flex items-center justify-center transition active:scale-90 shrink-0 ${
                      item.status === 'Completed'
                        ? 'bg-emerald-600 text-white'
                        : item.status === 'In Progress'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-900 border border-slate-700 text-slate-500'
                    }`}
                  >
                    {item.status === 'Completed' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : item.status === 'In Progress' ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    )}
                  </button>

                  <div>
                    <h3 className="font-semibold text-white text-xs leading-snug">{item.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] text-slate-400">{item.series}</span>
                      <span className="text-slate-700">•</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        item.status === 'Completed'
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : item.status === 'In Progress'
                          ? 'text-blue-400 bg-blue-500/10'
                          : 'text-slate-400 bg-slate-900'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteMock(item.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 active:scale-90"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Score / Accuracy / Action Footer */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between">
                <div>
                  {record ? (
                    <div className="text-xs">
                      <strong className="text-white font-bold">{record.totalScore}</strong>
                      <span className="text-[10px] text-slate-500"> / 300</span>
                      <span className="ml-1.5 text-[10px] font-semibold text-emerald-400">{record.overallAccuracy}%</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-500">Not calculated</span>
                  )}
                </div>

                <button
                  onClick={() => onSelectMockForScore(item.name)}
                  className="px-2.5 py-1 rounded text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 active:scale-95 transition"
                >
                  {record ? 'Recalculate' : 'Log Score'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP TABLE VIEW (Tablets & Desktops) */}
      <div className="hidden sm:block bg-[#0f1420] rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-medium">
                <th className="py-2.5 px-3 w-12 text-center">Status</th>
                <th className="py-2.5 px-3">Mock Test Name</th>
                <th className="py-2.5 px-3">Series</th>
                <th className="py-2.5 px-3 text-center">Score</th>
                <th className="py-2.5 px-3 text-center">Accuracy</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((item) => {
                const record = mockRecords.find(r => r.name === item.name || r.id === item.mockRecordId);

                return (
                  <tr key={item.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleToggleStatus(item.id)}
                        className={`w-5 h-5 mx-auto rounded flex items-center justify-center transition active:scale-90 ${
                          item.status === 'Completed'
                            ? 'bg-emerald-600 text-white'
                            : item.status === 'In Progress'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-900 border border-slate-700 text-slate-500'
                        }`}
                        title="Click to toggle status"
                      >
                        {item.status === 'Completed' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : item.status === 'In Progress' ? (
                          <Clock className="w-3.5 h-3.5" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                        )}
                      </button>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-medium text-white">{item.name}</div>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                        item.status === 'Completed'
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : item.status === 'In Progress'
                          ? 'text-blue-400 bg-blue-500/10'
                          : 'text-slate-400 bg-slate-900'
                      }`}>
                        {item.status}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-slate-400">{item.series}</td>

                    <td className="py-2.5 px-3 text-center font-medium">
                      {record ? (
                        <span className="text-white">{record.totalScore} <span className="text-[10px] text-slate-500">/ 300</span></span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center font-medium">
                      {record ? (
                        <span className={record.overallAccuracy >= 80 ? 'text-emerald-400' : 'text-slate-300'}>
                          {record.overallAccuracy}%
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {item.completedDate ? `Done: ${item.completedDate}` : item.targetDate ? `Target: ${item.targetDate}` : '—'}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectMockForScore(item.name)}
                          className="px-2.5 py-1 rounded text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 transition active:scale-95"
                        >
                          {record ? 'Recalculate' : 'Log Score'}
                        </button>
                        <button
                          onClick={() => handleDeleteMock(item.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 active:scale-90"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
