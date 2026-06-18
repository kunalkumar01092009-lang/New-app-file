import React, { useState } from "react";
import { JournalEntry } from "../types";
import { PenTool, Calendar, Smile, BookOpen, Trash2, ShieldAlert } from "lucide-react";

export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem("jsp_journal");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ...
      }
    }
    // Seed an initial entry
    return [
      {
        id: "j-1",
        date: new Date().toISOString().split("T")[0],
        content: "Today was highly productive. Mathematics coordinates felt straightforward and I easily avoided triggers. No adult videos, pristine energy levels. Focus target remains MNC at IIT Delhi! JSP selector party is on track.",
        mood: "Determined",
      }
    ];
  });

  const todayStr = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(todayStr); // Date auto-selected as today!
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("Determined");

  const saveEntries = (updated: JournalEntry[]) => {
    setEntries(updated);
    localStorage.setItem("jsp_journal", JSON.stringify(updated));
  };

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    // Check if entry already exists for selected date and prompt override
    const existingIdx = entries.findIndex((entry) => entry.date === date);
    let updated = [...entries];

    if (existingIdx !== -1) {
      const override = window.confirm(`Kunal, you already have a journal on ${date}. Do you want to append/override today's emotional record?`);
      if (!override) return;
      updated[existingIdx] = {
        ...updated[existingIdx],
        content: updated[existingIdx].content + "\n\n[Appended]: " + content.trim(),
        mood: mood,
      };
    } else {
      const newEntry: JournalEntry = {
        id: `j-${Date.now()}`,
        date,
        content: content.trim(),
        mood,
      };
      updated = [newEntry, ...updated];
    }

    saveEntries(updated);
    setContent("");
  };

  const handleDeleteEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    saveEntries(updated);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            Mind Dump & Emotional Journal
            <span className="text-[10px] bg-blue-500/10 text-blue-400 font-mono tracking-widest uppercase border border-blue-500/20 px-2 py-0.5 rounded-full">
              Mental Clarity
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Express urges, fatigue, victories, Calculus doubts, and reinforce your oath to enter IIT Delhi MnC department.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-350">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span>Auto-date:</span>
          <strong className="text-slate-100">{date}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Writer column */}
        <form onSubmit={handleAddEntry} className="lg:col-span-5 bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-4">
          <div className="flex items-center gap-2 text-blue-300 font-bold text-sm">
            <PenTool className="w-5 h-5 text-blue-400" />
            <h3>Express Yourself, Kunal</h3>
          </div>

          <div>
            <label className="block text-[10px] text-slate-500 font-mono mb-1 uppercase">Write down thoughts / stress dump</label>
            <textarea
              required
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Dump all emotions here. Got urged today? Feeling math stress? Did nice study? Write it out to let your brain relax."
              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-100 p-3 rounded-lg focus:outline-none placeholder-slate-600 leading-relaxed font-sans"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-[10px] text-slate-500 font-mono mb-1 uppercase">Vibe / Mood</label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-100 p-2 rounded focus:outline-none"
              >
                <option>Determined</option>
                <option>Motivated</option>
                <option>Stressed but Fighting</option>
                <option>Calm / Focused</option>
                <option>Slightly Anxious</option>
                <option>Tired / Rebuilding</option>
              </select>
            </div>

            <button
              type="submit"
              className="mt-5 w-full bg-blue-600 hover:bg-blue-500 text-white p-2 py-2.5 rounded-xl font-bold text-xs transition duration-150 flex items-center justify-center gap-1.5"
            >
              Save Diary
            </button>
          </div>
        </form>

        {/* List column */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            Past Journal Logs ({entries.length})
          </h3>

          <div className="space-y-4 overflow-y-auto max-h-[420px] pr-2 scrollbar-thin scrollbar-thumb-slate-800">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-slate-950 border border-slate-850 p-4 rounded-xl relative hover:border-slate-800 transition"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs font-bold text-slate-300">{entry.date}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold font-mono px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded">
                      {entry.mood}
                    </span>
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="text-slate-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line mt-3">
                  {entry.content}
                </p>
              </div>
            ))}

            {entries.length === 0 && (
              <p className="text-slate-500 italic text-xs text-center p-6 bg-slate-950 rounded-xl">
                The emotional slate is clean. Express your thoughts during stress or success to build high mental fortitude!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
