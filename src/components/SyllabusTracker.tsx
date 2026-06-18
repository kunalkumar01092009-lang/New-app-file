import React, { useState } from "react";
import { Search, CheckCircle, BookOpen, Clock, Activity, FileCheck, Award, PlusCircle } from "lucide-react";
import { SyllabusItem } from "../types";
import { INITIAL_SYLLABUS } from "../constants/syllabusData";

export default function SyllabusTracker() {
  const [syllabus, setSyllabus] = useState<SyllabusItem[]>(() => {
    const saved = localStorage.getItem("jsp_syllabus");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ... fallback
      }
    }
    return INITIAL_SYLLABUS;
  });

  const [activeSubject, setActiveSubject] = useState<"All" | "Physics" | "Chemistry" | "Mathematics">("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [newChapterName, setNewChapterName] = useState("");
  const [newSubject, setNewSubject] = useState<"Physics" | "Chemistry" | "Mathematics">("Physics");
  const [newCategory, setNewCategory] = useState<"Mains" | "Advanced" | "Both">("Both");
  const [newLectures, setNewLectures] = useState(6);
  const [showAddForm, setShowAddForm] = useState(false);

  // Save changes helper
  const saveSyllabus = (updated: SyllabusItem[]) => {
    setSyllabus(updated);
    localStorage.setItem("jsp_syllabus", JSON.stringify(updated));
  };

  // Filter Chapters
  const filteredChapters = syllabus.filter((item) => {
    const matchesSubject = activeSubject === "All" || item.subject === activeSubject;
    const matchesSearch = item.chapterName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  // Calculate stats
  const calculateSubjectProgress = (subj: "Physics" | "Chemistry" | "Mathematics") => {
    const subjItems = syllabus.filter((item) => item.subject === subj);
    if (subjItems.length === 0) return 0;
    const completedItems = subjItems.filter((item) => item.status === "Completed");
    const halfCompleted = subjItems.filter((item) => item.status === "In Progress");
    const score = completedItems.length * 100 + halfCompleted.length * 50;
    return Math.round(score / subjItems.length);
  };

  const handleStatusChange = (id: string, newStatus: SyllabusItem["status"]) => {
    const updated = syllabus.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status: newStatus,
          // Auto-mark boxes if completed
          dppDone: newStatus === "Completed" ? true : item.dppDone,
          hwDone: newStatus === "Completed" ? true : item.hwDone,
          notesRevised: newStatus === "Completed" ? true : item.notesRevised,
        };
      }
      return item;
    });
    saveSyllabus(updated);
  };

  const toggleBoolean = (id: string, field: "dppDone" | "hwDone" | "notesRevised") => {
    const updated = syllabus.map((item) => {
      if (item.id === id) {
        const nextVal = !item[field];
        return { ...item, [field]: nextVal };
      }
      return item;
    });
    saveSyllabus(updated);
  };

  const updateNumeric = (id: string, field: "lecturesWatched" | "totalQuestions" | "pyqsSolved", delta: number) => {
    const updated = syllabus.map((item) => {
      if (item.id === id) {
        let value = item[field] + delta;
        if (value < 0) value = 0;
        if (field === "lecturesWatched" && value > item.totalLectures) {
          value = item.totalLectures;
        }
        return { ...item, [field]: value };
      }
      return item;
    });
    saveSyllabus(updated);
  };

  const handleAddNewChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterName.trim()) return;

    const newChapter: SyllabusItem = {
      id: `custom-ch-${Date.now()}`,
      subject: newSubject,
      chapterName: newChapterName.trim(),
      category: newCategory,
      status: "Not Started",
      lecturesWatched: 0,
      totalLectures: newLectures,
      dppDone: false,
      hwDone: false,
      notesRevised: false,
      totalQuestions: 0,
      pyqsSolved: 0,
    };

    saveSyllabus([...syllabus, newChapter]);
    setNewChapterName("");
    setShowAddForm(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Subject meters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Physics meter */}
        <div className="bg-slate-950 p-4 rounded-xl border border-rose-500/10">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono">PHYSICS PROGRESS</span>
            <span className="text-sm font-semibold text-rose-300 font-mono">{calculateSubjectProgress("Physics")}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2.5 mt-2">
            <div
              className="bg-rose-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${calculateSubjectProgress("Physics")}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">Focused on mechanics and electrodynamics</p>
        </div>

        {/* Chemistry meter */}
        <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/10">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">CHEMISTRY PROGRESS</span>
            <span className="text-sm font-semibold text-emerald-300 font-mono">{calculateSubjectProgress("Chemistry")}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2.5 mt-2">
            <div
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${calculateSubjectProgress("Chemistry")}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">Physical, Inorganic and GOC control</p>
        </div>

        {/* Math meter */}
        <div className="bg-slate-950 p-4 rounded-xl border border-blue-500/10">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider font-mono">MATHEMATICS (MnC Goal)</span>
            <span className="text-sm font-semibold text-blue-300 font-mono">{calculateSubjectProgress("Mathematics")}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2.5 mt-2">
            <div
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${calculateSubjectProgress("Mathematics")}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">Coordinate, Calculus & Algebra excellence</p>
        </div>
      </div>

      {/* Control row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-2">
        {/* Navigation Tabs */}
        <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-xl max-w-full overflow-x-auto">
          {["All", "Physics", "Chemistry", "Mathematics"].map((sub) => (
            <button
              key={sub}
              onClick={() => setActiveSubject(sub as any)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeSubject === sub
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex gap-2 w-full md:w-auto items-center">
          <div className="relative flex-1 md:w-60 bg-slate-950 rounded-xl border border-slate-800">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search chapters..."
              className="w-full bg-transparent border-0 pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
            />
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-slate-950 border border-slate-850 hover:bg-slate-900 text-blue-300 p-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition"
          >
            <PlusCircle className="w-4 h-4 text-blue-400" />
            <span className="hidden md:inline">Add Chapter</span>
          </button>
        </div>
      </div>

      {/* Custom Add Chapter Dialog Form */}
      {showAddForm && (
        <form onSubmit={handleAddNewChapter} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase font-mono text-slate-300">Add Custom Chapter to Tracker</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] text-slate-500 font-mono mb-1">CHAPTER NAME</label>
              <input
                type="text"
                required
                value={newChapterName}
                onChange={(e) => setNewChapterName(e.target.value)}
                placeholder="Limits, Rotational 3, etc."
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-mono mb-1">SUBJECT</label>
              <select
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
              >
                <option>Physics</option>
                <option>Chemistry</option>
                <option>Mathematics</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-mono mb-1">CATEGORY</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
              >
                <option value="Both">Mains + Advanced</option>
                <option value="Mains">Mains Only</option>
                <option value="Advanced">Advanced Only</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-mono mb-1">LECTURES COUNT</label>
              <input
                type="number"
                value={newLectures}
                onChange={(e) => setNewLectures(parseInt(e.target.value) || 1)}
                min="1"
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 bg-slate-900 text-slate-400 hover:text-slate-300 rounded text-xs"
            >
              Cancel
            </button>
            <button
               type="submit"
               className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs"
             >
              Create Chapter
            </button>
          </div>
        </form>
      )}

      {/* Chapters Grid / List */}
      <div className="space-y-3">
        {filteredChapters.map((ch) => {
          // Color coding for subjects
          const subjectColor =
            ch.subject === "Physics"
              ? "border-l-rose-500"
              : ch.subject === "Chemistry"
              ? "border-l-emerald-500"
              : "border-l-blue-500";

          return (
            <div
              key={ch.id}
              className={`bg-slate-950 rounded-xl p-4 border border-slate-850 border-l-4 ${subjectColor} hover:border-slate-800 transition duration-150 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between`}
            >
              {/* Essential details */}
              <div className="space-y-1 lg:max-w-xs w-full">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                      ch.subject === "Physics"
                        ? "bg-rose-500/10 text-rose-400"
                        : ch.subject === "Chemistry"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-blue-500/10 text-blue-400"
                    }`}
                  >
                    {ch.subject.toUpperCase()}
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded font-semibold font-mono bg-slate-900 text-slate-400 border border-slate-800">
                    {ch.category}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-200">{ch.chapterName}</h3>
                
                {/* Status indicator drop */}
                <div className="pt-1 select-none">
                  <span className="text-[9px] text-slate-500 font-mono uppercase block">Status</span>
                  <div className="flex gap-1 mt-0.5">
                    {["Not Started", "In Progress", "Completed"].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(ch.id, st as any)}
                        className={`px-2 py-0.5 rounded-[4px] text-[8px] font-mono border transition ${
                          ch.status === st
                            ? st === "Completed"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : st === "In Progress"
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                              : "bg-slate-800 text-slate-300 border-slate-700"
                            : "bg-transparent text-slate-600 hover:text-slate-400 border-transparent"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Progress: lectures/DPP/HW */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full flex-1">
                {/* Lectures Watched */}
                <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-900 flex flex-col justify-center">
                  <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-400" /> LECTURES WATCHED
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => updateNumeric(ch.id, "lecturesWatched", -1)}
                      className="bg-slate-800 hover:bg-slate-700 w-5 h-5 flex items-center justify-center rounded text-xs text-slate-300"
                    >
                      -
                    </button>
                    <span className="text-xs font-semibold text-slate-200 font-mono">
                      {ch.lecturesWatched} / {ch.totalLectures}
                    </span>
                    <button
                      onClick={() => updateNumeric(ch.id, "lecturesWatched", 1)}
                      className="bg-slate-800 hover:bg-slate-700 w-5 h-5 flex items-center justify-center rounded text-xs text-slate-300"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Checklist (DPP / HW / NOTES) */}
                <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-900 col-span-2 flex flex-row items-center justify-around gap-2">
                  {/* DPP */}
                  <button
                    onClick={() => toggleBoolean(ch.id, "dppDone")}
                    className={`flex flex-col items-center p-1.5 rounded transition w-full ${
                      ch.dppDone ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-950/20 text-slate-600 border border-dashed border-slate-900"
                    }`}
                  >
                    <FileCheck className="w-4.5 h-4.5 mb-0.5" />
                    <span className="text-[8px] font-mono font-bold uppercase">DPP Done</span>
                  </button>

                  {/* HW */}
                  <button
                    onClick={() => toggleBoolean(ch.id, "hwDone")}
                    className={`flex flex-col items-center p-1.5 rounded transition w-full ${
                      ch.hwDone ? "bg-cyan-500/15 text-cyan-400" : "bg-slate-950/20 text-slate-600 border border-dashed border-slate-900"
                    }`}
                  >
                    <BookOpen className="w-4.5 h-4.5 mb-0.5" />
                    <span className="text-[8px] font-mono font-bold uppercase">HW Done</span>
                  </button>

                  {/* NOTES REVISED */}
                  <button
                    onClick={() => toggleBoolean(ch.id, "notesRevised")}
                    className={`flex flex-col items-center p-1.5 rounded transition w-full ${
                      ch.notesRevised ? "bg-amber-500/15 text-amber-400" : "bg-slate-950/20 text-slate-600 border border-dashed border-slate-900"
                    }`}
                  >
                    <Award className="w-4.5 h-4.5 mb-0.5" />
                    <span className="text-[8px] font-mono font-bold uppercase">Revised</span>
                  </button>
                </div>

                {/* Questions practiced and PYQs */}
                <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-900 flex flex-col justify-center">
                  <span className="text-[9px] text-slate-500 font-mono">PRACTICED QUESTIONS</span>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => updateNumeric(ch.id, "totalQuestions", -10)}
                      className="bg-slate-800 hover:bg-slate-700 p-0.5 text-[9px] px-1 text-slate-300 rounded"
                    >
                      -10
                    </button>
                    <span className="text-xs font-bold text-slate-200 font-mono">
                      {ch.totalQuestions}
                    </span>
                    <button
                      onClick={() => updateNumeric(ch.id, "totalQuestions", 10)}
                      className="bg-slate-800 hover:bg-slate-700 p-0.5 text-[9px] px-1 text-slate-300 rounded"
                    >
                      +10
                    </button>
                  </div>
                  
                  {/* PYQs */}
                  <div className="mt-1 pt-1 border-t border-slate-900 flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 text-[8px] font-mono">PYQs:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateNumeric(ch.id, "pyqsSolved", -5)}
                        className="text-[8px] text-slate-500 hover:text-slate-300"
                      >
                        -5
                      </button>
                      <span className="font-mono font-medium text-slate-300">{ch.pyqsSolved}</span>
                      <button
                        onClick={() => updateNumeric(ch.id, "pyqsSolved", 5)}
                        className="text-[8px] text-slate-500 hover:text-slate-300"
                      >
                        +5
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredChapters.length === 0 && (
          <p className="text-slate-500 text-xs italic text-center p-6 bg-slate-950 rounded-xl border border-dotted border-slate-800">
            No active JEE chapters find on search string. Try clearing your filter criteria.
          </p>
        )}
      </div>
    </div>
  );
}
