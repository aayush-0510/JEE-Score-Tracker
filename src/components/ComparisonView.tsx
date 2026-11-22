'use client';

import React, { useState, useMemo } from 'react';
import { 
  GitCompare, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  ArrowRight,
  BarChart3,
  BookOpen
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend, 
  BarChart, 
  Bar
} from 'recharts';
import { MockTestRecord, SubjectName } from '../types';
import { generateLaggingInsights } from '../utils/calculator';

interface ComparisonViewProps {
  mockRecords: MockTestRecord[];
  onNavigateToMistakes: (testId?: string, subject?: SubjectName) => void;
  onNavigateToCalculator: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  mockRecords,
  onNavigateToMistakes,
  onNavigateToCalculator,
}) => {
  if (mockRecords.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 bg-[#0f1420] rounded-xl border border-slate-800 p-8">
        <GitCompare className="w-10 h-10 text-slate-500 mx-auto mb-3" />
        <h2 className="text-base font-semibold text-white mb-1">No Mock Tests Logged Yet</h2>
        <p className="text-xs text-slate-400 mb-5">
          Save your first mock test in the Score Calculator to compare scores and identify weak areas.
        </p>
        <button
          onClick={onNavigateToCalculator}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition"
        >
          Go to Score Calculator
        </button>
      </div>
    );
  }

  const [selectedPastId, setSelectedPastId] = useState<string>(
    mockRecords.length > 1 ? mockRecords[1].id : mockRecords[0].id
  );
  const [selectedCurrentId, setSelectedCurrentId] = useState<string>(mockRecords[0].id);

  const pastTest = useMemo(
    () => mockRecords.find((m) => m.id === selectedPastId) || mockRecords[0],
    [mockRecords, selectedPastId]
  );

  const currentTest = useMemo(
    () => mockRecords.find((m) => m.id === selectedCurrentId) || mockRecords[0],
    [mockRecords, selectedCurrentId]
  );

  const laggingInsights = useMemo(() => {
    return generateLaggingInsights(currentTest, pastTest.id !== currentTest.id ? pastTest : undefined);
  }, [currentTest, pastTest]);

  const scoreDelta = currentTest.totalScore - pastTest.totalScore;
  const accuracyDelta = Math.round((currentTest.overallAccuracy - pastTest.overallAccuracy) * 10) / 10;
  const negativeDelta = currentTest.totalNegativeMarks - pastTest.totalNegativeMarks;

  const phyScoreDelta = currentTest.physics.score - pastTest.physics.score;
  const chemScoreDelta = currentTest.chemistry.score - pastTest.chemistry.score;
  const mathScoreDelta = currentTest.maths.score - pastTest.maths.score;

  const phyAccDelta = Math.round((currentTest.physics.accuracy - pastTest.physics.accuracy) * 10) / 10;
  const chemAccDelta = Math.round((currentTest.chemistry.accuracy - pastTest.chemistry.accuracy) * 10) / 10;
  const mathAccDelta = Math.round((currentTest.maths.accuracy - pastTest.maths.accuracy) * 10) / 10;

  const historyTrendData = useMemo(() => {
    return [...mockRecords].reverse().map((m) => ({
      name: m.name.length > 15 ? m.name.slice(0, 13) + '...' : m.name,
      totalScore: m.totalScore,
      physics: m.physics.score,
      chemistry: m.chemistry.score,
      maths: m.maths.score,
    }));
  }, [mockRecords]);

  const subjectBarData = [
    { subject: 'Physics', Benchmark: pastTest.physics.score, Current: currentTest.physics.score },
    { subject: 'Chemistry', Benchmark: pastTest.chemistry.score, Current: currentTest.chemistry.score },
    { subject: 'Mathematics', Benchmark: pastTest.maths.score, Current: currentTest.maths.score },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Selector & Top Comparison Header */}
      <div className="bg-[#0f1420] rounded-xl border border-slate-800 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-blue-400" />
              Mock Test Comparison & Weak Areas
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Compare your latest test against a past benchmark to pinpoint score changes and accuracy drops.
            </p>
          </div>

          {/* Selectors */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div>
              <span className="text-[10px] font-medium text-slate-400 block mb-0.5">Benchmark Test</span>
              <select
                value={selectedPastId}
                onChange={(e) => setSelectedPastId(e.target.value)}
                className="w-full sm:w-52 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:border-blue-500"
              >
                {mockRecords.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.totalScore}/300)</option>
                ))}
              </select>
            </div>

            <span className="hidden sm:inline text-slate-600 pt-4">vs</span>

            <div>
              <span className="text-[10px] font-medium text-blue-400 block mb-0.5">Current Test</span>
              <select
                value={selectedCurrentId}
                onChange={(e) => setSelectedCurrentId(e.target.value)}
                className="w-full sm:w-52 px-2.5 py-1.5 bg-slate-900 border border-blue-500/50 rounded-lg text-xs text-blue-200 font-medium focus:border-blue-400"
              >
                {mockRecords.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.totalScore}/300)</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Delta Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-4">
          <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Total Score Delta</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className={`text-xl font-bold ${scoreDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta}
              </span>
              <span className="text-xs text-slate-500">({pastTest.totalScore} → {currentTest.totalScore})</span>
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Accuracy Delta</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className={`text-xl font-bold ${accuracyDelta >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {accuracyDelta > 0 ? `+${accuracyDelta}%` : `${accuracyDelta}%`}
              </span>
              <span className="text-xs text-slate-500">({pastTest.overallAccuracy}% → {currentTest.overallAccuracy}%)</span>
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Negative Marks Delta</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className={`text-xl font-bold ${negativeDelta <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {negativeDelta > 0 ? `+${negativeDelta}` : negativeDelta}
              </span>
              <span className="text-xs text-slate-500">({pastTest.totalNegativeMarks} → {currentTest.totalNegativeMarks})</span>
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Attempt Rate</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-bold text-white">
                {currentTest.totalAttempted} / 75
              </span>
              <span className="text-xs text-slate-500">({currentTest.totalUnattempted} unattempted)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lagging Diagnostic Insights */}
      <div className="bg-[#0f1420] rounded-xl border border-slate-800 p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Diagnostic & Where You Are Lagging</h2>
          </div>
          <button
            onClick={() => onNavigateToMistakes()}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
          >
            Open Mistake Notebook <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {laggingInsights.map((insight, idx) => (
            <div
              key={idx}
              className="bg-slate-900/60 rounded-lg p-3.5 border border-slate-800 text-xs"
            >
              <div className="flex items-center gap-1.5 font-semibold text-slate-200 mb-1">
                {insight.type === 'danger' && <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />}
                {insight.type === 'warning' && <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />}
                {insight.type === 'success' && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
                {insight.type === 'info' && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                <span>{insight.title}</span>
              </div>
              <p className="text-slate-400 leading-relaxed mb-2">
                {insight.detail}
              </p>
              <div className="bg-slate-950/60 rounded p-2 text-slate-300 border border-slate-800/80">
                <span className="font-medium text-slate-200">Advice: </span>
                {insight.recommendation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clean Subject Comparison Table */}
      <div className="bg-[#0f1420] rounded-xl border border-slate-800 p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Subject Breakdown Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-medium">
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3 text-center">Past Score</th>
                <th className="py-2.5 px-3 text-center">Current Score</th>
                <th className="py-2.5 px-3 text-center">Score Delta</th>
                <th className="py-2.5 px-3 text-center">Past Acc.</th>
                <th className="py-2.5 px-3 text-center">Current Acc.</th>
                <th className="py-2.5 px-3 text-center">Acc. Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-medium text-sky-400">Physics</td>
                <td className="py-2.5 px-3 text-center text-slate-400">{pastTest.physics.score}</td>
                <td className="py-2.5 px-3 text-center font-semibold text-white">{currentTest.physics.score}</td>
                <td className="py-2.5 px-3 text-center">
                  <span className={`font-semibold ${phyScoreDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {phyScoreDelta >= 0 ? `+${phyScoreDelta}` : phyScoreDelta}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-center text-slate-400">{pastTest.physics.accuracy}%</td>
                <td className="py-2.5 px-3 text-center font-semibold text-white">{currentTest.physics.accuracy}%</td>
                <td className="py-2.5 px-3 text-center font-semibold">
                  <span className={phyAccDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {phyAccDelta >= 0 ? `+${phyAccDelta}%` : `${phyAccDelta}%`}
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-medium text-emerald-400">Chemistry</td>
                <td className="py-2.5 px-3 text-center text-slate-400">{pastTest.chemistry.score}</td>
                <td className="py-2.5 px-3 text-center font-semibold text-white">{currentTest.chemistry.score}</td>
                <td className="py-2.5 px-3 text-center">
                  <span className={`font-semibold ${chemScoreDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {chemScoreDelta >= 0 ? `+${chemScoreDelta}` : chemScoreDelta}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-center text-slate-400">{pastTest.chemistry.accuracy}%</td>
                <td className="py-2.5 px-3 text-center font-semibold text-white">{currentTest.chemistry.accuracy}%</td>
                <td className="py-2.5 px-3 text-center font-semibold">
                  <span className={chemAccDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {chemAccDelta >= 0 ? `+${chemAccDelta}%` : `${chemAccDelta}%`}
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-medium text-amber-400">Mathematics</td>
                <td className="py-2.5 px-3 text-center text-slate-400">{pastTest.maths.score}</td>
                <td className="py-2.5 px-3 text-center font-semibold text-white">{currentTest.maths.score}</td>
                <td className="py-2.5 px-3 text-center">
                  <span className={`font-semibold ${mathScoreDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {mathScoreDelta >= 0 ? `+${mathScoreDelta}` : mathScoreDelta}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-center text-slate-400">{pastTest.maths.accuracy}%</td>
                <td className="py-2.5 px-3 text-center font-semibold text-white">{currentTest.maths.accuracy}%</td>
                <td className="py-2.5 px-3 text-center font-semibold">
                  <span className={mathAccDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {mathAccDelta >= 0 ? `+${mathAccDelta}%` : `${mathAccDelta}%`}
                  </span>
                </td>
              </tr>

              <tr className="bg-slate-900/60 font-semibold">
                <td className="py-2.5 px-3 text-white">Total</td>
                <td className="py-2.5 px-3 text-center text-slate-300">{pastTest.totalScore}</td>
                <td className="py-2.5 px-3 text-center text-white">{currentTest.totalScore}</td>
                <td className="py-2.5 px-3 text-center">
                  <span className={scoreDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {scoreDelta >= 0 ? `+${scoreDelta}` : scoreDelta}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-center text-slate-300">{pastTest.overallAccuracy}%</td>
                <td className="py-2.5 px-3 text-center text-white">{currentTest.overallAccuracy}%</td>
                <td className="py-2.5 px-3 text-center">
                  <span className={accuracyDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {accuracyDelta >= 0 ? `+${accuracyDelta}%` : `${accuracyDelta}%`}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-[#0f1420] rounded-xl border border-slate-800 p-5">
          <h3 className="text-xs font-semibold text-slate-300 mb-3">Score Progression Trend</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" domain={[0, 300]} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="totalScore" name="Total Score" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="physics" name="Physics" stroke="#38bdf8" strokeWidth={1.5} />
                <Line type="monotone" dataKey="chemistry" name="Chemistry" stroke="#10b981" strokeWidth={1.5} />
                <Line type="monotone" dataKey="maths" name="Maths" stroke="#f59e0b" strokeWidth={1.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0f1420] rounded-xl border border-slate-800 p-5">
          <h3 className="text-xs font-semibold text-slate-300 mb-3">Benchmark vs Current Subject Marks</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="subject" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Benchmark" fill="#475569" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Current" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
