'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Check, 
  ExternalLink, 
  LayoutGrid, 
  Table2
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
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

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
      subtitle: 'Eduniti 1800 Top PYQs & Revision Tracker',
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
    <div className="space-y-4 sm:space-y-5 max-w-7xl mx-auto pb-16 px-1 sm:px-0">
      {/* Header Card */}
      <div className="bg-[#0f1420] rounded-xl border border-slate-800 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">{meta.title}</h1>
              <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                {stats.percent}% Done
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{meta.subtitle}</p>
          </div>

          {/* Controls: Subject Switcher & View Mode Toggle */}
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            {/* Subject Switcher */}
            <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-800">
              {(['physics', 'chemistry', 'maths'] as const).map((sub) => (
                <button
                  key={sub}
                  onClick={() => handleSubjectChange(sub)}
                  className={`px-2.5 sm:px-3 py-1 rounded-md text-xs font-medium capitalize transition active:scale-95 ${
                    currentSubject === sub
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>

            {/* View Mode Toggle (Cards vs Table) */}
            <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-800">
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition active:scale-95 ${
                  viewMode === 'cards' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Cards View (Best for Phones)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="text-[11px]">Cards</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition active:scale-95 ${
                  viewMode === 'table' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Full Table View"
              >
                <Table2 className="w-3.5 h-3.5" />
                <span className="text-[11px]">Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* Minimal progress indicators */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 pt-3 border-t border-slate-800/80 text-[11px] sm:text-xs text-slate-400">
          <div>
            <span>NCERT: </span>
            <strong className="text-slate-200">{stats.ncertCount}/{stats.totalChapters}</strong>
          </div>
          <span className="text-slate-700">•</span>
          <div>
            <span>R1: </span>
            <strong className="text-slate-200">{stats.r1Count} ch</strong>
          </div>
          <span className="text-slate-700">•</span>
          <div>
            <span>R2: </span>
            <strong className="text-slate-200">{stats.r2Count} ch</strong>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mt-3 pt-3 border-t border-slate-800/60">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            <button
              onClick={() => setBlockFilter('all')}
              className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition active:scale-95 ${
                blockFilter === 'all'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              All ({sheetData.length})
            </button>
            {blocks.map((blk) => (
              <button
                key={blk}
                onClick={() => setBlockFilter(blk)}
                className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition active:scale-95 ${
                  blockFilter === blk
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {blk.replace('Block ', 'B')}
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

      {/* VIEW 1: CARDS VIEW (Fully Natural Page Scrolling - ZERO SCROLL TRAPS) */}
      {viewMode === 'cards' && (
        <div className="space-y-3">
          {filteredRows.map((row) => (
            <div key={row.id} className="bg-[#0f1420] rounded-xl border border-slate-800 p-3.5 transition">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="truncate mr-2">
                  <span className="text-[10px] text-slate-500 font-mono block">
                    {row.block}
                  </span>
                  <span className="font-semibold text-white text-xs sm:text-sm truncate">
                    {row.chapter}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded shrink-0">
                  {row.totalQues}Q
                </span>
              </div>

              {/* PYQ Challenges Pills */}
              <div className="mt-2.5">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                  PYQ Challenges (2019-2026)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <MobilePill checked={row.pyq2019} label="2019" onToggle={() => handleToggleCell(row.id, 'pyq2019')} />
                  <MobilePill checked={row.top200_2023} label="'23" onToggle={() => handleToggleCell(row.id, 'top200_2023')} />
                  <MobilePill checked={row.top200_2024} label="'24" onToggle={() => handleToggleCell(row.id, 'top200_2024')} />
                  <MobilePill checked={row.top200_2022} label="'22" onToggle={() => handleToggleCell(row.id, 'top200_2022')} />
                  <MobilePill checked={row.top200_2025} label="'25" onToggle={() => handleToggleCell(row.id, 'top200_2025')} />
                  <MobilePill checked={row.top200_2021} label="'21" onToggle={() => handleToggleCell(row.id, 'top200_2021')} />
                  <MobilePill checked={row.top100_2020} label="'20" onToggle={() => handleToggleCell(row.id, 'top100_2020')} />
                  <MobilePill checked={row.top200_2026} label="'26" onToggle={() => handleToggleCell(row.id, 'top200_2026')} />
                  <MobilePill checked={row.theoreticalQues} label="Theory" onToggle={() => handleToggleCell(row.id, 'theoreticalQues')} />
                </div>
              </div>

              {/* Standard Reference Books & Revisions */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <MobilePill checked={row.standardReference} label={meta.refName} onToggle={() => handleToggleCell(row.id, 'standardReference')} />
                  <MobilePill checked={row.rankBooster} label={meta.rankBooster} onToggle={() => handleToggleCell(row.id, 'rankBooster')} />
                  <MobilePill checked={row.sureShot} label="Sure Shot" onToggle={() => handleToggleCell(row.id, 'sureShot')} />
                </div>

                <div className="flex items-center gap-1.5 ml-auto">
                  <MobilePill checked={row.ncertRead} label="NCERT" isEmerald onToggle={() => handleToggleCell(row.id, 'ncertRead')} />
                  <MobilePill checked={row.r1} label="R1" isEmerald onToggle={() => handleToggleCell(row.id, 'r1')} />
                  <MobilePill checked={row.r2} label="R2" onToggle={() => handleToggleCell(row.id, 'r2')} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: FULL TABLE VIEW (NO Nested Max-Height on Mobile -> Vertical page scroll flows freely!) */}
      {viewMode === 'table' && (
        <div className="bg-[#0f1420] rounded-xl border border-slate-800 overflow-hidden">
          {/* Note: NO max-h on mobile so vertical scrolling is NEVER trapped! Only on desktop does it get an inner scrollbar. */}
          <div className="overflow-x-auto sm:max-h-[72vh] sm:overflow-y-auto">
            <table className="w-full text-center text-xs">
              <thead className="sticky top-0 z-20 bg-[#121927] text-slate-300 border-b border-slate-700/80">
                <tr className="divide-x divide-slate-800 text-[11px] font-medium">
                  <th className="py-2.5 px-3 text-left min-w-[160px] sm:min-w-[210px] sticky left-0 z-30 bg-[#121927] text-white">
                    Chapter
                  </th>
                  <th className="py-2 px-1.5 min-w-[50px] text-slate-300">2019</th>
                  <th className="py-2 px-1.5 min-w-[50px] text-slate-300">'23</th>
                  <th className="py-2 px-1.5 min-w-[50px] text-slate-300">'24</th>
                  <th className="py-2 px-1.5 min-w-[50px] text-slate-300">'22</th>
                  <th className="py-2 px-1.5 min-w-[50px] text-slate-300">'25</th>
                  <th className="py-2 px-1.5 min-w-[50px] text-slate-300">'21</th>
                  <th className="py-2 px-1.5 min-w-[50px] text-slate-300">'20</th>
                  <th className="py-2 px-1.5 min-w-[50px] text-slate-300">'26</th>
                  <th className="py-2 px-1.5 min-w-[60px] text-slate-300">Theory</th>
                  <th className="py-2 px-1.5 min-w-[50px] text-slate-200 bg-slate-800/60 font-semibold">Total Q</th>
                  <th className="py-2 px-1.5 min-w-[75px] text-slate-300">{meta.refName}</th>
                  <th className="py-2 px-1.5 min-w-[65px] text-slate-300">{meta.rankBooster}</th>
                  <th className="py-2 px-1.5 min-w-[60px] text-slate-300">Sure Shot</th>
                  <th className="py-2 px-1.5 min-w-[55px] text-slate-300">NCERT</th>
                  <th className="py-2 px-1.5 min-w-[42px] text-emerald-400 font-semibold">R1</th>
                  <th className="py-2 px-1.5 min-w-[42px] text-blue-400 font-semibold">R2</th>
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
                    <td className="py-2 px-2.5 sm:px-3 text-left font-medium text-slate-200 sticky left-0 z-10 bg-[#0f1420] border-r border-slate-800">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">
                          {row.block.replace('Block ', 'B').slice(0, 3)}
                        </span>
                        <span className="truncate max-w-[130px] sm:max-w-[190px]" title={row.chapter}>
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
      )}

      {/* Special Topics Section */}
      <div className="bg-[#0f1420] rounded-xl border border-slate-800 p-4 sm:p-5">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
          <h3 className="text-xs sm:text-sm font-semibold text-white">Special High-Yield Modules</h3>
          <span className="text-[11px] text-slate-400">
            {specialData.filter(s => s.done).length}/{specialData.length} Done
          </span>
        </div>

        <div className="overflow-x-auto mt-2.5">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-medium">
                <th className="py-2 px-2.5 w-8 text-center">#</th>
                <th className="py-2 px-2.5">Challenge</th>
                <th className="py-2 px-2.5 text-center w-16">Done</th>
                <th className="py-2 px-2.5 text-center w-16">R1</th>
                <th className="py-2 px-2.5 text-center w-16">R2</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {specialData.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-800/30">
                  <td className="py-2 px-2.5 text-center text-slate-500">{idx + 1}</td>
                  <td className="py-2 px-2.5 font-medium text-slate-200">
                    <div>{item.title}</div>
                    <span className="text-[10px] text-blue-400">{item.linkText}</span>
                  </td>
                  <td className="py-2 px-2.5 text-center">
                    <CleanCheckbox checked={item.done} onToggle={() => handleToggleSpecial(item.id, 'done')} isEmerald />
                  </td>
                  <td className="py-2 px-2.5 text-center">
                    <CleanCheckbox checked={item.r1} onToggle={() => handleToggleSpecial(item.id, 'r1')} />
                  </td>
                  <td className="py-2 px-2.5 text-center">
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

const CleanCheckbox: React.FC<{ checked: boolean; onToggle: () => void; isEmerald?: boolean }> = ({
  checked,
  onToggle,
  isEmerald = false,
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-5 h-5 mx-auto rounded flex items-center justify-center transition-all active:scale-90 ${
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

const MobilePill: React.FC<{ checked: boolean; label: string; onToggle: () => void; isEmerald?: boolean }> = ({
  checked,
  label,
  onToggle,
  isEmerald = false,
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all active:scale-95 ${
        checked
          ? isEmerald
            ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
            : 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
          : 'bg-slate-900 text-slate-300 border border-slate-800'
      }`}
    >
      {checked && <Check className="w-3 h-3 stroke-[3]" />}
      <span>{label}</span>
    </button>
  );
};
