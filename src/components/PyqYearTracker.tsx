import React, { useState, useEffect } from "react";
import { Search, Trophy, CheckSquare, RefreshCw, Star, Layers, CheckCircle } from "lucide-react";
import { SyllabusItem, ChapterPyqState } from "../types";
import { INITIAL_SYLLABUS } from "../constants/syllabusData";

const YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

export default function PyqYearTracker() {
  const [syllabus, setSyllabus] = useState<SyllabusItem[]>(() => {
    const saved = localStorage.getItem("jsp_syllabus");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_SYLLABUS;
  });

  const [pyqState, setPyqState] = useState<{ [chapterId: string]: { [year: number]: "not_done" | "in_progress" | "solved" } }>(() => {
    const saved = localStorage.getItem("jsp_pyq_yearwise");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {};
  });

  const [activeSubject, setActiveSubject] = useState<"All" | "Physics" | "Chemistry" | "Mathematics">("All");
  const [searchTerm, setSearchTerm] = useState("");

  const savePyqState = (updated: typeof pyqState) => {
    setPyqState(updated);
    localStorage.setItem("jsp_pyq_yearwise", JSON.stringify(updated));
  };

  const handleToggleYear = (chapterId: string, year: number) => {
    const chapterYears = pyqState[chapterId] || {};
    const currentStatus = chapterYears[year] || "not_done";
    
    let nextStatus: "not_done" | "in_progress" | "solved" = "not_done";
    if (currentStatus === "not_done") nextStatus = "in_progress";
    else if (currentStatus === "in_progress") nextStatus = "solved";

    const updated = {
      ...pyqState,
      [chapterId]: {
        ...chapterYears,
        [year]: nextStatus,
      },
    };
    savePyqState(updated);
  };

  const handleMarkAllSolved = (chapterId: string) => {
    const allSolved: { [year: number]: "not_done" | "in_progress" | "solved" } = {};
    YEARS.forEach((y) => {
      allSolved[y] = "solved";
    });

    const updated = {
      ...pyqState,
      [chapterId]: allSolved,
    };
    savePyqState(updated);
  };

  const handleClearChapter = (chapterId: string) => {
    const cleared: { [year: number]: "not_done" | "in_progress" | "solved" } = {};
    YEARS.forEach((y) => {
      cleared[y] = "not_done";
    });

    const updated = {
      ...pyqState,
      [chapterId]: cleared,
    };
    savePyqState(updated);
  };

  // Filtered chapters for display
  const filteredChapters = syllabus.filter((item) => {
    const matchesSubject = activeSubject === "All" || item.subject === activeSubject;
    const matchesSearch = item.chapterName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  // Calculate yearwise global completion stats (out of filtered chapters)
  const calculateYearStats = () => {
    const stats: { [year: number]: { solved: number; total: number } } = {};
    YEARS.forEach((y) => {
      stats[y] = { solved: 0, total: filteredChapters.length };
    });

    filteredChapters.forEach((ch) => {
      const chapterYears = pyqState[ch.id] || {};
      YEARS.forEach((y) => {
        if (chapterYears[y] === "solved") {
          stats[y].solved += 1;
        }
      });
    });

    return stats;
  };

  const yearStats = calculateYearStats();

  // Get total chapter statistics
  const getChapterStats = (chapterId: string) => {
    const chapterYears = pyqState[chapterId] || {};
    const solvedCount = YEARS.filter((y) => chapterYears[y] === "solved").length;
    const progressCount = YEARS.filter((y) => chapterYears[y] === "in_progress").length;
    const percent = Math.round((solvedCount / YEARS.length) * 100);
    return { solvedCount, progressCount, percent };
  };

  // Total syllabus stats
  const totalSolvedYearsCount = Object.values(pyqState).reduce((total: number, chYears) => {
    return total + Object.values(chYears).filter((v) => v === "solved").length;
  }, 0);

  const totalPossiblePyqsCount = syllabus.length * YEARS.length;
  const overallPyqCompletionPercentage = totalPossiblePyqsCount > 0 
    ? Math.round(((totalSolvedYearsCount as number) / totalPossiblePyqsCount) * 100) 
    : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-xl">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Yearwise PYQ Mastery Planner
              <span className="text-[10px] bg-yellow-500/10 text-yellow-400 font-mono tracking-widest uppercase border border-yellow-500/20 px-2 py-0.5 rounded-full">
                Syllabus Tracker
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Check off solved JEE Main & Advanced Pyqs (2019 - 2026) for each chapter.
            </p>
          </div>
        </div>

        {/* Dynamic percentage counter */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col justify-center">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">OVERALL PYQ PROGRESS</span>
          <div className="text-2xl font-black text-slate-100 font-mono mt-1 flex items-baseline gap-1.5">
            {overallPyqCompletionPercentage}% 
            <span className="text-[10px] text-yellow-400 font-sans font-medium">({totalSolvedYearsCount}/{totalPossiblePyqsCount} Slots)</span>
          </div>
          <div className="w-32 bg-slate-900 h-1 rounded-full overflow-hidden mt-1.5">
            <div 
              className="bg-yellow-500 h-full transition-all duration-300"
              style={{ width: `${overallPyqCompletionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Yearwise summary grid cards */}
      <div className="space-y-2">
        <h3 className="text-xs font-mono font-bold text-slate-400 tracking-wider uppercase block">Yearwise Coverage (Current Search Filter)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {YEARS.map((y) => {
            const stat = yearStats[y] || { solved: 0, total: 0 };
            const pct = stat.total > 0 ? Math.round((stat.solved / stat.total) * 100) : 0;
            return (
              <div key={y} className="bg-slate-950/70 p-3 rounded-xl border border-slate-850/60 text-center flex flex-col justify-between">
                <span className="text-xs font-mono font-black text-slate-100">{y}</span>
                <span className="text-[10px] font-mono font-extrabold text-yellow-400 mt-1">{pct}% Solved</span>
                <span className="text-[8px] text-slate-500 block font-mono mt-0.5">{stat.solved} / {stat.total} Chs</span>
                <div className="w-full bg-slate-900 h-1 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-yellow-500 h-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Control bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-850">
        <div className="flex gap-1.5 p-1 bg-slate-900 rounded-lg">
          {(["All", "Physics", "Chemistry", "Mathematics"] as const).map((sub) => (
            <button
              key={sub}
              onClick={() => setActiveSubject(sub)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
                activeSubject === sub
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-600" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search JEE Chapters..."
            className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 pl-9 pr-4 py-2 rounded-lg focus:outline-none focus:border-slate-700 placeholder-slate-600 font-mono"
          />
        </div>
      </div>

      {/* Chapters list grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredChapters.map((ch) => {
          const stats = getChapterStats(ch.id);
          const chState = pyqState[ch.id] || {};

          // Colors based on subject
          const subjectColorClass =
            ch.subject === "Physics"
              ? "border-rose-500/25 bg-rose-500/5 text-rose-400"
              : ch.subject === "Chemistry"
              ? "border-emerald-500/25 bg-emerald-500/5 text-emerald-400"
              : "border-blue-500/25 bg-blue-500/5 text-blue-400";

          return (
            <div
              key={ch.id}
              className="bg-slate-950 border border-slate-850 p-4 rounded-xl hover:border-slate-800 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1 lg:max-w-xs">
                <div className="flex items-center gap-2">
                  <span className={`text-[8px] font-bold font-mono tracking-wider uppercase border px-2 py-0.5 rounded-full ${subjectColorClass}`}>
                    {ch.subject}
                  </span>
                  <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 font-mono text-center px-1.5 py-0.5 rounded">
                    {ch.category}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-100 font-sans mt-1.5 tracking-tight">
                  {ch.chapterName}
                </h4>
                <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono mt-1">
                  <span>🎯 Done: <strong className="text-slate-300 font-bold">{stats.percent}%</strong></span>
                  <span>({stats.solvedCount}/{YEARS.length} solved)</span>
                </div>
              </div>

              {/* Years controls */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 lg:justify-end">
                {/* Year matrix */}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {YEARS.map((year) => {
                    const status = chState[year] || "not_done";
                    
                    let bgBorder = "bg-slate-900 border-slate-850 text-slate-500 hover:border-slate-800";
                    let glowIcon = null;

                    if (status === "in_progress") {
                      bgBorder = "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:border-amber-400/40";
                    } else if (status === "solved") {
                      bgBorder = "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-black shadow-[0_0_8px_rgba(16,185,129,0.1)]";
                    }

                    return (
                      <button
                        key={year}
                        onClick={() => handleToggleYear(ch.id, year)}
                        title={`Click to toggle ${year} PYQ status. Current: ${status}`}
                        className={`py-1.5 rounded-lg border text-[10px] font-mono transition-all text-center flex flex-col items-center justify-center cursor-pointer select-none relative ${bgBorder}`}
                      >
                        <span className="font-bold">{year}</span>
                        <span className="text-[7px] font-mono uppercase mt-0.5 opacity-60">
                          {status === "not_done" ? "Not Solved" : status === "in_progress" ? "Working" : "Solved"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Batch toggles */}
                <div className="flex sm:flex-col justify-end gap-1.5 shrink-0">
                  <button
                    onClick={() => handleMarkAllSolved(ch.id)}
                    className="flex-1 sm:flex-initial text-[9px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-bold font-mono px-2 py-1 rounded-md transition"
                  >
                    100% Done
                  </button>
                  <button
                    onClick={() => handleClearChapter(ch.id)}
                    className="flex-1 sm:flex-initial text-[9px] bg-slate-900 hover:bg-slate-850 text-slate-400 border border-slate-800 font-semibold font-mono px-2 py-1 rounded-md transition"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredChapters.length === 0 && (
          <p className="text-slate-500 text-xs italic text-center p-8 bg-slate-950 rounded-xl border border-dashed border-slate-800">
            No JEE chapters found matching filters.
          </p>
        )}
      </div>
    </div>
  );
}
