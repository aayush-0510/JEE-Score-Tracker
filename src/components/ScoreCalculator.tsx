'use client';

import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Save, 
  AlertCircle, 
  ArrowRight,
  Plus,
  Minus,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SubjectInput, MockTestRecord, SubjectName } from '../types';
import { calculateSubjectMetrics, estimateJeePercentile } from '../utils/calculator';
import { storage } from '../utils/storage';

interface ScoreCalculatorProps {
  onTestSaved: (newRecord: MockTestRecord) => void;
  onNavigateToMistakes: (testId?: string, subject?: SubjectName) => void;
  initialTestName?: string;
}

export const ScoreCalculator: React.FC<ScoreCalculatorProps> = ({
  onTestSaved,
  onNavigateToMistakes,
  initialTestName = '',
}) => {
  // Inputs state
  const [physicsInput, setPhysicsInput] = useState<SubjectInput>({
    correct: 18,
    incorrect: 3,
    unattempted: 4,
    totalQuestions: 25,
  });

  const [chemistryInput, setChemistryInput] = useState<SubjectInput>({
    correct: 19,
    incorrect: 4,
    unattempted: 2,
    totalQuestions: 25,
  });

  const [mathsInput, setMathsInput] = useState<SubjectInput>({
    correct: 12,
    incorrect: 3,
    unattempted: 10,
    totalQuestions: 25,
  });

  // Save Modal state
  const [testName, setTestName] = useState(initialTestName || `Mock Test - ${new Date().toLocaleDateString('en-GB')}`);
  const [testDate, setTestDate] = useState(new Date().toISOString().slice(0, 10));
  const [testDuration, setTestDuration] = useState(180);
  const [notes, setNotes] = useState('');
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  // Computed metrics
  const physicsMetrics = useMemo(() => calculateSubjectMetrics(physicsInput), [physicsInput]);
  const chemMetrics = useMemo(() => calculateSubjectMetrics(chemistryInput), [chemistryInput]);
  const mathsMetrics = useMemo(() => calculateSubjectMetrics(mathsInput), [mathsInput]);

  const totalScore = physicsMetrics.score + chemMetrics.score + mathsMetrics.score;
  const totalMaxMarks = physicsMetrics.maxMarks + chemMetrics.maxMarks + mathsMetrics.maxMarks;
  const totalAttempted = physicsMetrics.attempted + chemMetrics.attempted + mathsMetrics.attempted;
  const totalCorrect = physicsMetrics.correct + chemMetrics.correct + mathsMetrics.correct;
  const totalIncorrect = physicsMetrics.incorrect + chemMetrics.incorrect + mathsMetrics.incorrect;
  const totalUnattempted = physicsMetrics.unattempted + chemMetrics.unattempted + mathsMetrics.unattempted;
  const totalNegativeMarks = physicsMetrics.negativeMarks + chemMetrics.negativeMarks + mathsMetrics.negativeMarks;
  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 1000) / 10 : 0;
  const percentileEstimate = estimateJeePercentile(totalScore);

  const handleUpdate = (
    subject: SubjectName,
    field: 'correct' | 'incorrect',
    delta: number
  ) => {
    const updateMap = {
      physics: [physicsInput, setPhysicsInput] as const,
      chemistry: [chemistryInput, setChemistryInput] as const,
      maths: [mathsInput, setMathsInput] as const,
    };

    const [currentInput, setter] = updateMap[subject];
    const otherField = field === 'correct' ? 'incorrect' : 'correct';
    const currentVal = currentInput[field];
    const otherVal = currentInput[otherField];
    const maxQ = currentInput.totalQuestions;

    const newVal = Math.max(0, Math.min(maxQ - otherVal, currentVal + delta));
    setter({
      ...currentInput,
      [field]: newVal,
      unattempted: Math.max(0, maxQ - (newVal + otherVal))
    });
  };

  const handleSetDirect = (
    subject: SubjectName,
    field: 'correct' | 'incorrect',
    val: number
  ) => {
    const updateMap = {
      physics: [physicsInput, setPhysicsInput] as const,
      chemistry: [chemistryInput, setChemistryInput] as const,
      maths: [mathsInput, setMathsInput] as const,
    };
    const [currentInput, setter] = updateMap[subject];
    const cleanVal = Math.max(0, Math.min(currentInput.totalQuestions, Number(val) || 0));
    const otherField = field === 'correct' ? 'incorrect' : 'correct';
    const otherVal = Math.min(currentInput[otherField], currentInput.totalQuestions - cleanVal);

    setter({
      ...currentInput,
      [field]: cleanVal,
      [otherField]: otherVal,
      unattempted: Math.max(0, currentInput.totalQuestions - (cleanVal + otherVal))
    });
  };

  const handleSaveTest = () => {
    if (!testName.trim()) {
      alert('Please enter a test name');
      return;
    }

    const newRecord: MockTestRecord = {
      id: `mock-${Date.now()}`,
      name: testName.trim(),
      date: testDate,
      durationMinutes: testDuration,
      physics: physicsMetrics,
      chemistry: chemMetrics,
      maths: mathsMetrics,
      totalScore,
      totalMaxMarks,
      overallAccuracy,
      totalAttempted,
      totalCorrect,
      totalIncorrect,
      totalUnattempted,
      totalNegativeMarks,
      percentileEstimate,
      notes: notes.trim(),
    };

    const existing = storage.getMockRecords();
    const updated = [newRecord, ...existing];
    storage.saveMockRecords(updated);
    onTestSaved(newRecord);

    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 3500);

    if (totalScore >= 180) {
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
    }
  };

  const handleReset = () => {
    setPhysicsInput({ correct: 0, incorrect: 0, unattempted: 25, totalQuestions: 25 });
    setChemistryInput({ correct: 0, incorrect: 0, unattempted: 25, totalQuestions: 25 });
    setMathsInput({ correct: 0, incorrect: 0, unattempted: 25, totalQuestions: 25 });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Calm Overview Card */}
      <div className="bg-[#0f1420] rounded-xl border border-slate-800 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="text-xs font-medium text-slate-400 mb-1">
              Marking Scheme: +4 Correct | -1 Incorrect | 0 Unattempted
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              JEE Score & Accuracy Calculator
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Input question counts for Physics, Chemistry, and Maths to see your score, precision, and estimated percentile.
            </p>
          </div>

          {/* Clean Metric Badges */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-4 py-3 min-w-[110px] text-center">
              <span className="text-[11px] font-medium text-slate-400 block">Total Score</span>
              <span className="text-2xl font-bold text-white block mt-0.5">
                {totalScore}
                <span className="text-xs font-normal text-slate-500"> / {totalMaxMarks}</span>
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-4 py-3 min-w-[110px] text-center">
              <span className="text-[11px] font-medium text-slate-400 block">Overall Accuracy</span>
              <span className={`text-2xl font-bold block mt-0.5 ${
                overallAccuracy >= 85 ? 'text-emerald-400' : overallAccuracy >= 70 ? 'text-blue-400' : 'text-amber-400'
              }`}>
                {overallAccuracy}%
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-4 py-3 min-w-[110px] text-center">
              <span className="text-[11px] font-medium text-slate-400 block">Est. Percentile</span>
              <span className="text-2xl font-bold text-indigo-400 block mt-0.5">
                ~{percentileEstimate}%
              </span>
            </div>
          </div>
        </div>

        {/* Muted Negative Marks Notice */}
        {totalNegativeMarks > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                <strong>Negative Marking Impact:</strong> You lost <span className="text-rose-400 font-semibold">-{totalNegativeMarks} marks</span> from {totalIncorrect} incorrect answers ({totalIncorrect * 5} potential marks swing).
              </span>
            </div>
            <button
              onClick={() => onNavigateToMistakes()}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 self-start sm:self-auto"
            >
              Add to Mistake Notebook <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* 3 Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <SubjectCard
          name="Physics"
          subjectKey="physics"
          accent="sky"
          metrics={physicsMetrics}
          input={physicsInput}
          onUpdate={(field, delta) => handleUpdate('physics', field, delta)}
          onSetDirect={(field, val) => handleSetDirect('physics', field, val)}
          onLogMistake={() => onNavigateToMistakes(undefined, 'physics')}
        />

        <SubjectCard
          name="Chemistry"
          subjectKey="chemistry"
          accent="emerald"
          metrics={chemMetrics}
          input={chemistryInput}
          onUpdate={(field, delta) => handleUpdate('chemistry', field, delta)}
          onSetDirect={(field, val) => handleSetDirect('chemistry', field, val)}
          onLogMistake={() => onNavigateToMistakes(undefined, 'chemistry')}
        />

        <SubjectCard
          name="Mathematics"
          subjectKey="maths"
          accent="amber"
          metrics={mathsMetrics}
          input={mathsInput}
          onUpdate={(field, delta) => handleUpdate('maths', field, delta)}
          onSetDirect={(field, val) => handleSetDirect('maths', field, val)}
          onLogMistake={() => onNavigateToMistakes(undefined, 'maths')}
        />
      </div>

      {/* Clean Save Test Card */}
      <div className="bg-[#0f1420] rounded-xl border border-slate-800 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div>
            <h3 className="text-sm font-semibold text-white">Save Mock Test Record</h3>
            <p className="text-xs text-slate-400">Add to your test history to compare progress and track weak spots.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition"
            >
              Reset
            </button>
            <button
              onClick={handleSaveTest}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition shadow-sm"
            >
              Save Result
            </button>
          </div>
        </div>

        {isSavedSuccess && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Mock Test saved! You can compare it under <strong>"Past Comparison & Weak Areas"</strong>.</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Mock Name / Series</label>
            <input
              type="text"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="e.g. JEE Main 2024 Jan 27 S1"
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Date Attempted</label>
            <input
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Duration (Mins)</label>
            <input
              type="number"
              value={testDuration}
              onChange={(e) => setTestDuration(Number(e.target.value) || 180)}
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:border-blue-500"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-slate-400 mb-1">Notes / Key Takeaways</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Need to improve speed in Maths Section B, calculation mistakes in physical chemistry."
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface SubjectCardProps {
  name: string;
  subjectKey: SubjectName;
  accent: 'sky' | 'emerald' | 'amber';
  metrics: ReturnType<typeof calculateSubjectMetrics>;
  input: SubjectInput;
  onUpdate: (field: 'correct' | 'incorrect', delta: number) => void;
  onSetDirect: (field: 'correct' | 'incorrect', val: number) => void;
  onLogMistake: () => void;
}

const SubjectCard: React.FC<SubjectCardProps> = ({
  name,
  accent,
  metrics,
  input,
  onUpdate,
  onSetDirect,
  onLogMistake,
}) => {
  const accentBorder = {
    sky: 'border-l-2 border-l-sky-500',
    emerald: 'border-l-2 border-l-emerald-500',
    amber: 'border-l-2 border-l-amber-500',
  }[accent];

  const accentTag = {
    sky: 'text-sky-400 bg-sky-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
  }[accent];

  return (
    <div className={`bg-[#0f1420] rounded-xl border border-slate-800 p-5 flex flex-col justify-between ${accentBorder}`}>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${accentTag}`}>
            {name}
          </span>
          <div className="text-right">
            <span className="text-2xl font-bold text-white">{metrics.score}</span>
            <span className="text-xs text-slate-500"> / {metrics.maxMarks}</span>
          </div>
        </div>

        {/* Compact stats strip */}
        <div className="flex items-center justify-between py-3 text-xs text-slate-400 border-b border-slate-800/40">
          <div>
            <span>Accuracy: </span>
            <strong className={`font-semibold ${
              metrics.accuracy >= 85 ? 'text-emerald-400' : metrics.accuracy >= 70 ? 'text-blue-400' : 'text-amber-400'
            }`}>
              {metrics.accuracy}%
            </strong>
          </div>
          <div>
            <span>Attempted: </span>
            <strong className="text-slate-200">{metrics.attempted} / {metrics.totalQuestions}</strong>
          </div>
          <div>
            <span>Negatives: </span>
            <strong className="text-rose-400">-{metrics.negativeMarks}</strong>
          </div>
        </div>

        {/* Clean Input Rows */}
        <div className="space-y-3 mt-4">
          {/* Correct Row */}
          <div className="flex items-center justify-between bg-slate-900/60 rounded-lg p-2.5 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Correct (+4)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onUpdate('correct', -1)}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="number"
                min={0}
                max={metrics.totalQuestions}
                value={input.correct}
                onChange={(e) => onSetDirect('correct', parseInt(e.target.value) || 0)}
                className="w-12 bg-slate-950 border border-slate-700/80 rounded py-0.5 text-center text-sm font-semibold text-white focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => onUpdate('correct', 1)}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Incorrect Row */}
          <div className="flex items-center justify-between bg-slate-900/60 rounded-lg p-2.5 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Incorrect (-1)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onUpdate('incorrect', -1)}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="number"
                min={0}
                max={metrics.totalQuestions}
                value={input.incorrect}
                onChange={(e) => onSetDirect('incorrect', parseInt(e.target.value) || 0)}
                className="w-12 bg-slate-950 border border-slate-700/80 rounded py-0.5 text-center text-sm font-semibold text-white focus:border-rose-500"
              />
              <button
                type="button"
                onClick={() => onUpdate('incorrect', 1)}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 px-1 flex justify-between">
            <span>Unattempted: {metrics.unattempted}</span>
            <span>Marks from Correct: +{metrics.correct * 4}</span>
          </div>
        </div>
      </div>

      {/* Footer Mistake Link */}
      {metrics.incorrect > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">{metrics.incorrect} mistakes to review</span>
          <button
            onClick={onLogMistake}
            className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
          >
            Log Mistakes <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
