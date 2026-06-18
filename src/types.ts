export interface DailyHabit {
  id: string;
  name: string;
  category: "study" | "health" | "routine";
  streak: number;
  lastCompleted: string | null; // YYYY-MM-DD
}

export interface SobrietyState {
  streakDays: number;
  lastRelapseDate: string; // ISO timestamp
  urgeCount: number;
  urgesLog: Array<{ timestamp: string; note: string }>;
}

export interface SyllabusItem {
  id: string;
  subject: "Physics" | "Chemistry" | "Mathematics";
  chapterName: string;
  category: "Mains" | "Advanced" | "Both";
  status: "Not Started" | "In Progress" | "Completed";
  lecturesWatched: number;
  totalLectures: number;
  dppDone: boolean;
  hwDone: boolean;
  notesRevised: boolean;
  totalQuestions: number;
  pyqsSolved: number;
}

export interface TTSRecord {
  id: string;
  timeSlot: string; // e.g., "09:00 AM - 11:00 AM"
  subject: string;
  description: string; // what was done
  lecturesWatchedCount: number;
  dppCompleted: boolean;
  hwCompleted: boolean;
  questionsPracticed: number;
  pyqsSolvedCount: number;
  studyHours: number;
  date: string; // YYYY-MM-DD
}

export interface TestAnalysisRecord {
  id: string;
  testName: string;
  date: string; // YYYY-MM-DD
  marksPhysics: number;
  marksChemistry: number;
  marksMaths: number;
  totalMarks: number;
  possibleMarks: number;
  weakTopics: string; // comma-separated or text
  remarks: string;
}

export interface DoubtQuestion {
  id: string;
  subject: "Physics" | "Chemistry" | "Mathematics";
  chapter: string;
  questionText: string;
  dateAdded: string; // YYYY-MM-DD
  notes: string;
  status: "Unsolved" | "Solved";
  imageUrl?: string;
  driveFileId?: string;
}

export interface ChapterPyqState {
  chapterId: string;
  yearStates: { [year: number]: "not_done" | "in_progress" | "solved" };
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  mood: string; // "Motivated" | "Anxious" | "Determined" | "Tired" | "Focus"
}
