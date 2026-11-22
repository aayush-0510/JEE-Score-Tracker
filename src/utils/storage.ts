import { 
  MockTestRecord, 
  MistakeEntry, 
  ChapterChallengeRow, 
  SpecialContentItem, 
  MockChecklistItem,
  SubjectName
} from '../types';
import { initialMockRecords, initialChecklistMocks } from '../data/initialMocks';
import { initialMistakesData } from '../data/initialMistakes';
import { physicsChaptersData, physicsSpecialContent } from '../data/physicsChapters';
import { chemistryChaptersData, chemistrySpecialContent } from '../data/chemistryChapters';
import { mathsChaptersData, mathsSpecialContent } from '../data/mathsChapters';

const KEYS = {
  MOCK_RECORDS: 'jee_mock_records_v1',
  MISTAKES: 'jee_mistakes_v1',
  MOCK_CHECKLIST: 'jee_mock_checklist_v1',
  PHYSICS_SHEET: 'jee_physics_sheet_v1',
  CHEMISTRY_SHEET: 'jee_chemistry_sheet_v1',
  MATHS_SHEET: 'jee_maths_sheet_v1',
  PHYSICS_SPECIAL: 'jee_physics_special_v1',
  CHEMISTRY_SPECIAL: 'jee_chemistry_special_v1',
  MATHS_SPECIAL: 'jee_maths_special_v1',
};

// Safe JSON parser
function safeGet<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to load key ${key}`, e);
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save key ${key}`, e);
  }
}

// Storage helpers
export const storage = {
  getMockRecords: (): MockTestRecord[] => safeGet(KEYS.MOCK_RECORDS, initialMockRecords),
  saveMockRecords: (data: MockTestRecord[]) => safeSet(KEYS.MOCK_RECORDS, data),

  getMistakes: (): MistakeEntry[] => safeGet(KEYS.MISTAKES, initialMistakesData),
  saveMistakes: (data: MistakeEntry[]) => safeSet(KEYS.MISTAKES, data),

  getMockChecklist: (): MockChecklistItem[] => safeGet(KEYS.MOCK_CHECKLIST, initialChecklistMocks),
  saveMockChecklist: (data: MockChecklistItem[]) => safeSet(KEYS.MOCK_CHECKLIST, data),

  // Chapter sheets
  getSheetData: (subject: SubjectName): ChapterChallengeRow[] => {
    if (subject === 'physics') return safeGet(KEYS.PHYSICS_SHEET, physicsChaptersData);
    if (subject === 'chemistry') return safeGet(KEYS.CHEMISTRY_SHEET, chemistryChaptersData);
    return safeGet(KEYS.MATHS_SHEET, mathsChaptersData);
  },
  saveSheetData: (subject: SubjectName, data: ChapterChallengeRow[]) => {
    if (subject === 'physics') safeSet(KEYS.PHYSICS_SHEET, data);
    else if (subject === 'chemistry') safeSet(KEYS.CHEMISTRY_SHEET, data);
    else safeSet(KEYS.MATHS_SHEET, data);
  },

  // Special content
  getSpecialContent: (subject: SubjectName): SpecialContentItem[] => {
    if (subject === 'physics') return safeGet(KEYS.PHYSICS_SPECIAL, physicsSpecialContent);
    if (subject === 'chemistry') return safeGet(KEYS.CHEMISTRY_SPECIAL, chemistrySpecialContent);
    return safeGet(KEYS.MATHS_SPECIAL, mathsSpecialContent);
  },
  saveSpecialContent: (subject: SubjectName, data: SpecialContentItem[]) => {
    if (subject === 'physics') safeSet(KEYS.PHYSICS_SPECIAL, data);
    else if (subject === 'chemistry') safeSet(KEYS.CHEMISTRY_SPECIAL, data);
    else safeSet(KEYS.MATHS_SPECIAL, data);
  },

  // Export all user data as JSON
  exportAllData: (): string => {
    const all = {
      mockRecords: storage.getMockRecords(),
      mistakes: storage.getMistakes(),
      checklist: storage.getMockChecklist(),
      physicsSheet: storage.getSheetData('physics'),
      chemistrySheet: storage.getSheetData('chemistry'),
      mathsSheet: storage.getSheetData('maths'),
      physicsSpecial: storage.getSpecialContent('physics'),
      chemistrySpecial: storage.getSpecialContent('chemistry'),
      mathsSpecial: storage.getSpecialContent('maths'),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    return JSON.stringify(all, null, 2);
  },

  // Import JSON backup
  importData: (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.mockRecords) safeSet(KEYS.MOCK_RECORDS, data.mockRecords);
      if (data.mistakes) safeSet(KEYS.MISTAKES, data.mistakes);
      if (data.checklist) safeSet(KEYS.MOCK_CHECKLIST, data.checklist);
      if (data.physicsSheet) safeSet(KEYS.PHYSICS_SHEET, data.physicsSheet);
      if (data.chemistrySheet) safeSet(KEYS.CHEMISTRY_SHEET, data.chemistrySheet);
      if (data.mathsSheet) safeSet(KEYS.MATHS_SHEET, data.mathsSheet);
      if (data.physicsSpecial) safeSet(KEYS.PHYSICS_SPECIAL, data.physicsSpecial);
      if (data.chemistrySpecial) safeSet(KEYS.CHEMISTRY_SPECIAL, data.chemistrySpecial);
      if (data.mathsSpecial) safeSet(KEYS.MATHS_SPECIAL, data.mathsSpecial);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  },

  // Reset to default
  resetAll: () => {
    if (typeof window === 'undefined') return;
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  }
};
