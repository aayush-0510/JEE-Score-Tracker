'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Check, 
  ExternalLink, 
  Layers, 
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { ChapterChallengeRow, SpecialContentItem, SubjectName } from '../types';
import { storage } from '../utils/storage';

interface ChapterTrackerSheetProps {
  initialSubject?: SubjectName;
}

export const ChapterTrackerSheet: React.FC<ChapterTrackerSheetProps> = ({
  initialSubject = 'physics',
}) => {
  const [currentSubject, setCurrentSubject] = useState<SubjectName>(initialSubject);
  const [sheetData, setSheetData] = useState<ChapterChallengeRow[]>(() => 
    storage.getSheetData(currentSubject)
  );
  const [specialData, setSpecialData] = useState<SpecialContentItem[]>(() =>
    storage.getSpecialContent(currentSubject)
  );
  const [searchFilter, setSearchFilter] = useState('');
  const [blockFilter, setBlockFilter] = useState<string>('all');

  const handleSubjectChange = (newSub: SubjectName) => {
    setCurrentSubject(newSub);
    setSheetData(storage.getSheetData(newSub));
    setSpecialData(storage.getSpecialContent(newSub));
  };

  const handleToggleCell = (rowId: string, colKey: keyof ChapterChallengeRow) => {
    const updated = sheetData.map((row) => {
      if (row.id === rowId) {
        return { ...row, [colKey]: !row[colKey] };
      }
      return row;
    });
    setSheetData(updated);
    storage.saveSheetData(currentSubject, updated);
  };

  const handleToggleSpecial = (itemId: string, field: 'done' | 'r1' | 'r2') => {
    const updated = specialData.map((item) => {
      if (item.id === itemId) {
        return { ...item, [field]: !item[field] };
      }
      return item;
    });
    setSpecialData(updated);
    storage.saveSpecialContent(currentSubject, updated);
  };

  const blocks = useMemo(() => {
    const bSet = new Set<string>();
    sheetData.forEach((r) => bSet.add(r.block));
    return Array.from(bSet);
  }, [sheetData]);

  const filteredRows = useMemo(() => {
    return sheetData.filter((r) => {
      if (blockFilter !== 'all' && r.block !== blockFilter) return false;
      if (searchFilter.trim() && !r.chapter.toLowerCase().includes(searchFilter.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [sheetData, blockFilter, searchFilter]);

  // Clean Statistics
  const stats = useMemo(() => {
    let totalCells = 0;
    let checkedCells = 0;
    let ncertCount = 0;
    let r1Count = 0;
    let r2Count = 0;

    sheetData.forEach((r) => {
      const keys: (keyof ChapterChallengeRow)[] = [
        'pyq2019', 'top200_2023', 'top200_2024', 'top200_2022',
        'top200_2025', 'top200_2021', 'top100_2020', 'top200_2026',
        'theoreticalQues', 'standardReference', 'rankBooster', 'sureShot',
        'ncertRead', 'r1', 'r2'
      ];
      keys.forEach((k) => {
        totalCells++;
        if (r[k]) checkedCells++;
      });
      if (r.ncertRead) ncertCount++;
      if (r.r1) r1Count++;
      if (r.r2) r2Count++;
    });

    const percent = totalCells > 0 ? Math.round((checkedCells / totalCells) * 100) : 0;
    return { percent, ncertCount, r1Count, r2Count, totalChapters: sheetData.length };
  }, [sheetData]);

  const meta = {
    physics: {
      title: 'Physics 15 Ultimate Challenges',
      subtitle: 'Based on Eduniti 1800 Top PYQs & Revision Framework',
      refName: 'HCV Qs',
      rankBooster: 'RBS 1.0',
    },
    chemistry: {
      title: 'Chemistry 15 Ultimate Challenges',
      subtitle: 'Physical + Inorganic + Organic NCERT Line-by-Line & PYQs',
      refName: 'Standard Ref',
      rankBooster: 'Exemplar',
    },
    maths: {
      title: 'Mathematics 15 Ultimate Challenges',
      subtitle: 'Algebra, Calculus, Vectors & 3D High-Yield PYQs',
      refName: 'Black Book / Ref',
      rankBooster: 'Rank Booster',
    },
  }[currentSubject];

  return (
    <div className="space-y-5 max-w-[98vw] mx-auto pb-12">
      {/* Header and Subject Switcher */}
      <div className="bg-[#0f1420] rounded-xl border border-slate-800 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">{meta.title}</h1>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                {stats.percent}% Completed
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{meta.subtitle}</p>
          </div>

          {/* Clean Subject Switcher */}
          <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-800 self-start sm:self-auto">
            {(['physics', 'chemistry', 'maths'] as const).map((sub) => (
              <button
                key={sub}
                onClick={() => handleSubjectChange(sub)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium capitalize transition ${
                  currentSubject === sub
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Minimal progress indicators */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
          <div>
            <span>NCERT Read: </span>
            <strong className="text-slate-200">{stats.ncertCount} / {stats.totalChapters}</strong>
          </div>
          <span className="text-slate-700">•</span>
          <div>
            <span>Revision 1 (R1): </span>
            <strong className="text-slate-200">{stats.r1Count} chapters</strong>
          </div>
          <span className="text-slate-700">•</span>
          <div>
            <span>Revision 2 (R2): </span>
            <strong className="text-slate-200">{stats.r2Count} chapters</strong>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-800/60">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            <button
              onClick={() => setBlockFilter('all')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                blockFilter === 'all'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              All Chapters ({sheetData.length})
            </button>
            {blocks.map((blk) => (
              <button
                key={blk}
                onClick={() => setBlockFilter(blk)}
                className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition ${
                  blockFilter === blk
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {blk}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search chapters..."
              className="w-full pl-8 pr-3 py-1 bg-slate-900 border border-slate-800 rounded-md text-xs text-white focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Sheet Table */}
      <div className="bg-[#0f1420] rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto max-h-[68vh]">
          <table className="w-full text-center text-xs">
            <thead className="sticky top-0 z-20 bg-[#121927] text-slate-300 border-b border-slate-700/80">
              <tr className="divide-x divide-slate-800 text-[11px] font-medium">
                <th className="py-2.5 px-3 text-left min-w-[210px] sticky left-0 z-30 bg-[#121927] text-white">
                  Chapter Name
                </th>
                <th className="py-2 px-2 min-w-[60px] text-slate-300">2019</th>
                <th className="py-2 px-2 min-w-[60px] text-slate-300">2023</th>
                <th className="py-2 px-2 min-w-[60px] text-slate-300">2024</th>
                <th className="py-2 px-2 min-w-[60px] text-slate-300">2022</th>
                <th className="py-2 px-2 min-w-[60px] text-slate-300">2025</th>
                <th className="py-2 px-2 min-w-[60px] text-slate-300">2021</th>
                <th className="py-2 px-2 min-w-[60px] text-slate-300">2020</th>
                <th className="py-2 px-2 min-w-[60px] text-slate-300">2026</th>
                <th className="py-2 px-2 min-w-[65px] text-slate-300">Theory</th>
                <th className="py-2 px-2 min-w-[55px] text-slate-200 bg-slate-800/60 font-semibold">Total Q</th>
                <th className="py-2 px-2 min-w-[85px] text-slate-300">{meta.refName}</th>
                <th className="py-2 px-2 min-w-[70px] text-slate-300">{meta.rankBooster}</th>
                <th className="py-2 px-2 min-w-[65px] text-slate-300">Sure Shot</th>
                <th className="py-2 px-2 min-w-[60px] text-slate-300">NCERT</th>
                <th className="py-2 px-2 min-w-[45px] text-emerald-400 font-semibold">R1</th>
                <th className="py-2 px-2 min-w-[45px] text-blue-400 font-semibold">R2</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredRows.map((row, idx) => (
                <tr 
                  key={row.id}
                  className={`divide-x divide-slate-800/40 hover:bg-slate-800/30 transition ${
                    idx % 2 === 0 ? 'bg-[#0f1420]' : 'bg-[#0b0f19]'
                  }`}
                >
                  {/* Chapter Name (Sticky Left) */}
                  <td className="py-2 px-3 text-left font-medium text-slate-200 sticky left-0 z-10 bg-[#0f1420] border-r border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {row.block.replace('Block ', 'B').slice(0, 3)}
                      </span>
                      <span className="truncate max-w-[200px]" title={row.chapter}>
                        {row.chapter}
                      </span>
                    </div>
                  </td>

                  <td><CleanCheckbox checked={row.pyq2019} onToggle={() => handleToggleCell(row.id, 'pyq2019')} /></td>
                  <td><CleanCheckbox checked={row.top200_2023} onToggle={() => handleToggleCell(row.id, 'top200_2023')} /></td>
                  <td><CleanCheckbox checked={row.top200_2024} onToggle={() => handleToggleCell(row.id, 'top200_2024')} /></td>
                  <td><CleanCheckbox checked={row.top200_2022} onToggle={() => handleToggleCell(row.id, 'top200_2022')} /></td>
                  <td><CleanCheckbox checked={row.top200_2025} onToggle={() => handleToggleCell(row.id, 'top200_2025')} /></td>
                  <td><CleanCheckbox checked={row.top200_2021} onToggle={() => handleToggleCell(row.id, 'top200_2021')} /></td>
                  <td><CleanCheckbox checked={row.top100_2020} onToggle={() => handleToggleCell(row.id, 'top100_2020')} /></td>
                  <td><CleanCheckbox checked={row.top200_2026} onToggle={() => handleToggleCell(row.id, 'top200_2026')} /></td>
                  <td><CleanCheckbox checked={row.theoreticalQues} onToggle={() => handleToggleCell(row.id, 'theoreticalQues')} /></td>

                  <td className="py-1 px-1 font-semibold text-slate-300 bg-slate-800/30 text-xs">
                    {row.totalQues}
                  </td>

                  <td><CleanCheckbox checked={row.standardReference} onToggle={() => handleToggleCell(row.id, 'standardReference')} /></td>
                  <td><CleanCheckbox checked={row.rankBooster} onToggle={() => handleToggleCell(row.id, 'rankBooster')} /></td>
                  <td><CleanCheckbox checked={row.sureShot} onToggle={() => handleToggleCell(row.id, 'sureShot')} /></td>
                  <td><CleanCheckbox checked={row.ncertRead} onToggle={() => handleToggleCell(row.id, 'ncertRead')} isEmerald /></td>
                  <td><CleanCheckbox checked={row.r1} onToggle={() => handleToggleCell(row.id, 'r1')} isEmerald /></td>
                  <td><CleanCheckbox checked={row.r2} onToggle={() => handleToggleCell(row.id, 'r2')} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Special Topics Table */}
      <div className="bg-[#0f1420] rounded-xl border border-slate-800 p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-white">High-Yield Special Challenges</h3>
          <span className="text-xs text-slate-400">
            {specialData.filter(s => s.done).length} / {specialData.length} Done
          </span>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-medium">
                <th className="py-2 px-3 w-10 text-center">#</th>
                <th className="py-2 px-3">Challenge / Module</th>
                <th className="py-2 px-3">Resource</th>
                <th className="py-2 px-3 text-center w-20">Done</th>
                <th className="py-2 px-3 text-center w-20">Rev 1</th>
                <th className="py-2 px-3 text-center w-20">Rev 2</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {specialData.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 text-center text-slate-500">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-200">{item.title}</td>
                  <td className="py-2.5 px-3 text-blue-400 flex items-center gap-1">
                    <span>{item.linkText}</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <CleanCheckbox checked={item.done} onToggle={() => handleToggleSpecial(item.id, 'done')} isEmerald />
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <CleanCheckbox checked={item.r1} onToggle={() => handleToggleSpecial(item.id, 'r1')} />
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <CleanCheckbox checked={item.r2} onToggle={() => handleToggleSpecial(item.id, 'r2')} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Clean minimalist checkbox
const CleanCheckbox: React.FC<{ checked: boolean; onToggle: () => void; isEmerald?: boolean }> = ({
  checked,
  onToggle,
  isEmerald = false,
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-5 h-5 mx-auto rounded flex items-center justify-center transition-all ${
        checked
          ? isEmerald
            ? 'bg-emerald-600 text-white'
            : 'bg-blue-600 text-white'
          : 'bg-slate-900 border border-slate-700/60 hover:border-slate-600 text-transparent'
      }`}
    >
      <Check className={`w-3.5 h-3.5 stroke-[2.5] ${checked ? 'opacity-100' : 'opacity-0'}`} />
    </button>
  );
};
