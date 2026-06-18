import React, { useState, useEffect } from "react";
import { Clock, Plus, BarChart, Calendar, Trash2, Milestone, BookOpen, Layers, Cloud, CloudOff, RefreshCw } from "lucide-react";
import { TTSRecord } from "../types";
import { loadGoogleConfig, appendSheetsRow, sendToWebhook } from "../lib/googleWorkspace";

export default function TtsSheet() {
  const [records, setRecords] = useState<TTSRecord[]>(() => {
    const saved = localStorage.getItem("jsp_tts_records");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ...
      }
    }
    
    // Default seed records for today
    const todayStr = new Date().toISOString().split("T")[0];
    return [
      {
        id: "tts-1",
        timeSlot: "09:00 AM - 12:00 PM",
        subject: "Mathematics",
        description: "Quadratic equations: complex roots lecture 5 & solved advanced sheet",
        lecturesWatchedCount: 1,
        dppCompleted: true,
        hwCompleted: true,
        questionsPracticed: 30,
        pyqsSolvedCount: 15,
        studyHours: 3.0,
        date: todayStr,
      },
      {
        id: "tts-2",
        timeSlot: "02:00 PM - 05:00 PM",
        subject: "Physics",
        description: "Kinematics 2D: lecture 6, projectile motion on inclined plane practice",
        lecturesWatchedCount: 1,
        dppCompleted: true,
        hwCompleted: false,
        questionsPracticed: 25,
        pyqsSolvedCount: 10,
        studyHours: 3.0,
        date: todayStr,
      },
    ];
  });

  // Today string
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Google Sync settings and status
  const [googleConfig, setGoogleConfig] = useState(() => loadGoogleConfig());
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncError, setSyncError] = useState("");

  useEffect(() => {
    setGoogleConfig(loadGoogleConfig());
  }, [records]);

  // Form states
  const [timeSlot, setTimeSlot] = useState("06:00 AM - 09:00 AM");
  const [subject, setSubject] = useState("Mathematics");
  const [description, setDescription] = useState("");
  const [lecturesCount, setLecturesCount] = useState(1);
  const [dppDone, setDppDone] = useState(true);
  const [hwDone, setHwDone] = useState(true);
  const [questionsCount, setQuestionsCount] = useState(20);
  const [pyqsCount, setPyqsCount] = useState(8);
  const [hoursCount, setHoursCount] = useState(3);

  // Save logs
  const saveRecords = (newRecs: TTSRecord[]) => {
    setRecords(newRecs);
    localStorage.setItem("jsp_tts_records", JSON.stringify(newRecs));
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const newRec: TTSRecord = {
      id: `tts-${Date.now()}`,
      timeSlot,
      subject,
      description: description.trim(),
      lecturesWatchedCount: Number(lecturesCount),
      dppCompleted: dppDone,
      hwCompleted: hwDone,
      questionsPracticed: Number(questionsCount),
      pyqsSolvedCount: Number(pyqsCount),
      studyHours: Number(hoursCount),
      date: selectedDate,
    };

    saveRecords([newRec, ...records]);
    setDescription("");

    // Send to Google Sheets if authorized, or Webhook if enabled
    const config = loadGoogleConfig();
    const isTokenValid = config.accessToken && config.expiresAt > Date.now();

    if (config.useWebhook && config.webhookUrl) {
      setSyncStatus("syncing");
      const ok = await sendToWebhook(config.webhookUrl, {
        type: "tts",
        ...newRec,
      });
      if (ok) {
        setSyncStatus("success");
      } else {
        setSyncStatus("error");
        setSyncError("Webhook post failed");
      }
    } else if (isTokenValid && config.spreadsheetId) {
      setSyncStatus("syncing");
      try {
        await appendSheetsRow(
          config.accessToken,
          config.spreadsheetId,
          "TTS Daily Sheets!A:J",
          [
            [
              newRec.date,
              newRec.timeSlot,
              newRec.subject,
              newRec.description,
              newRec.lecturesWatchedCount,
              newRec.questionsPracticed,
              newRec.pyqsSolvedCount,
              newRec.dppCompleted ? "YES" : "NO",
              newRec.hwCompleted ? "YES" : "NO",
              newRec.studyHours,
            ],
          ]
        );
        setSyncStatus("success");
      } catch (err: any) {
        console.error(err);
        setSyncStatus("error");
        setSyncError(err.message || "Spreadsheet append error");
      }
    }
  };

  const handleDeleteRecord = (id: string) => {
    const updated = records.filter((r) => r.id !== id);
    saveRecords(updated);
  };

  // Filter for selected date
  const selectedRecords = records.filter((r) => r.date === selectedDate);

  // Cumulative metrics for selected day
  const totalHours = selectedRecords.reduce((sum, r) => sum + r.studyHours, 0);
  const totalQuestions = selectedRecords.reduce((sum, r) => sum + r.questionsPracticed, 0);
  const totalPyqs = selectedRecords.reduce((sum, r) => sum + r.pyqsSolvedCount, 0);
  const totalLecturesCount = selectedRecords.reduce((sum, r) => sum + r.lecturesWatchedCount, 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Subject control date picker & overall summative widgets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            Time-Task-Status (TTS) Sheet
            <span className="text-[10px] bg-blue-500/10 text-blue-400 font-mono tracking-widest uppercase border border-blue-500/20 px-2 py-0.5 rounded-full">
              Full Record Form
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Log time slots, study details, practice questions, and physical hours.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <Calendar className="w-4 h-4 text-blue-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer border-none p-0"
          />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col justify-center">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">TOTAL STUDY TIME</span>
          <div className="text-2xl font-black text-slate-100 font-mono mt-1 flex items-baseline gap-1">
            {totalHours} <span className="text-xs text-blue-400 font-sans font-medium">hrs</span>
          </div>
          <p className="text-[9px] text-blue-300 mt-1 font-mono">Target: 10+ hrs daily</p>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col justify-center">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">PRACTICE QUESTIONS</span>
          <div className="text-2xl font-black text-slate-100 font-mono mt-1 flex items-baseline gap-1">
            {totalQuestions} <span className="text-xs text-amber-500 font-sans font-medium">items</span>
          </div>
          <p className="text-[9px] text-amber-300 mt-1 font-mono">Quality selection focus</p>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col justify-center">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">PYQS SOLVED</span>
          <div className="text-2xl font-black text-teal-400 font-mono mt-1 flex items-baseline gap-1">
            {totalPyqs} <span className="text-xs text-teal-500 font-sans font-medium">PYQs</span>
          </div>
          <p className="text-[9px] text-teal-500 mt-1 font-mono">Mains + Advanced keys</p>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col justify-center">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">LECTURES ATTENDED</span>
          <div className="text-2xl font-black text-slate-100 font-mono mt-1 flex items-baseline gap-1">
            {totalLecturesCount} <span className="text-xs text-slate-400 font-sans font-medium">Lecs</span>
          </div>
          <p className="text-[9px] text-slate-500 mt-1 font-mono">Revision notes compiled</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form panel */}
        <form onSubmit={handleCreateRecord} className="lg:col-span-5 bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-blue-300 flex items-center gap-1.5">
              <Milestone className="w-4 h-4 text-blue-400" />
              Log New Activity Slot
            </h3>
            
            {/* Sync badge feedback */}
            {googleConfig.useWebhook && googleConfig.webhookUrl ? (
              <span className="text-[8px] font-mono flex items-center gap-1 text-purple-400">
                <Cloud className="w-3 h-3" /> Webhook
              </span>
            ) : googleConfig.spreadsheetId && googleConfig.accessToken && googleConfig.expiresAt > Date.now() ? (
              <span className="text-[8px] font-mono flex items-center gap-1 text-emerald-400">
                <Cloud className="w-3 h-3" /> GSheet Link
              </span>
            ) : (
              <span className="text-[8px] font-mono flex items-center gap-1 text-slate-500">
                <CloudOff className="w-3 h-3" /> Offline Mode
              </span>
            )}
          </div>

          {syncStatus === "syncing" && (
            <div className="p-2 bg-slate-900 border border-slate-800 text-[10px] text-blue-400 font-mono flex items-center gap-2 rounded-lg justify-center">
              <RefreshCw className="w-3 h-3 animate-spin" /> Syncing to Google Spreadsheet...
            </div>
          )}

          {syncStatus === "success" && (
            <div className="p-2 bg-emerald-950/20 border border-emerald-900/30 text-[10px] text-emerald-400 font-mono text-center rounded-lg">
              ✨ Row appended to Google Sheet successfully!
            </div>
          )}

          {syncStatus === "error" && (
            <div className="p-2 bg-red-950/20 border border-red-900/30 text-[10px] text-red-400 font-mono text-center rounded-lg">
              ⚠️ Sync failed: {syncError || "spreadsheet offline"}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-500 font-mono mb-1">TIME SLOT</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-100 p-2 rounded focus:outline-none"
              >
                <option>06:00 AM - 09:00 AM</option>
                <option>09:00 AM - 12:00 PM</option>
                <option>12:00 PM - 02:00 PM</option>
                <option>02:00 PM - 05:00 PM</option>
                <option>05:00 PM - 07:00 PM</option>
                <option>07:00 PM - 10:00 PM</option>
                <option>10:00 PM - 12:00 AM</option>
                <option>Late Night Session</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 font-mono mb-1">SUBJECT</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-100 p-2 rounded focus:outline-none"
              >
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Chemistry</option>
                <option>Mock Test / Revision</option>
                <option>Personal Dev / Chess</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-500 font-mono mb-1">TASK DETAILS</label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g. Watched Lec 6, attempted DPP projectile motion question 1-15, cleared notes."
              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-100 p-2 rounded focus:outline-none placeholder-slate-600"
            ></textarea>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[9px] text-slate-500 font-mono mb-1 uppercase">Study Hours</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="12"
                value={hoursCount}
                onChange={(e) => setHoursCount(Number(e.target.value) || 1)}
                className="w-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-100 p-2 rounded focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[9px] text-slate-500 font-mono mb-1 uppercase">Questions</label>
              <input
                type="number"
                min="0"
                value={questionsCount}
                onChange={(e) => setQuestionsCount(Number(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-100 p-2 rounded focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[9px] text-slate-500 font-mono mb-1 uppercase">PYQs Solved</label>
              <input
                type="number"
                min="0"
                value={pyqsCount}
                onChange={(e) => setPyqsCount(Number(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-100 p-2 rounded focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer bg-slate-900 p-2 rounded border border-slate-800 justify-center select-none text-slate-300">
              <input
                type="checkbox"
                checked={dppDone}
                onChange={(e) => setDppDone(e.target.checked)}
                className="rounded accent-blue-600"
              />
              DPP Completed
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-slate-900 p-2 rounded border border-slate-800 justify-center select-none text-slate-300">
              <input
                type="checkbox"
                checked={hwDone}
                onChange={(e) => setHwDone(e.target.checked)}
                className="rounded accent-blue-600"
              />
              HW Completed
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-slate-100 p-3 rounded-xl font-bold text-xs transition duration-150 flex items-center justify-center gap-2 mt-4"
          >
            <Plus className="w-4 h-4" />
            Add To Daily Sheet
          </button>
        </form>

        {/* Display listing slots for selected date */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            Timeline list for {new Date(selectedDate).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
          </h3>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[440px] pr-2 scrollbar-thin scrollbar-thumb-slate-800">
            {selectedRecords.map((r) => (
              <div
                key={r.id}
                className="bg-slate-950 border border-slate-850 p-4 rounded-xl relative hover:border-slate-800 transition"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">
                      {r.timeSlot}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-mono ml-2 border border-slate-800">
                      {r.subject}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteRecord(r.id)}
                    className="p-1 text-slate-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-300 font-sans mt-2.5 leading-relaxed">
                  {r.description}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-900 flex flex-wrap gap-4 text-[10px] text-slate-400 font-mono">
                  <span>🚀 Hours: <strong className="text-blue-400 font-bold">{r.studyHours}</strong></span>
                  <span>✏️ Solved: <strong className="text-amber-400 font-bold">{r.questionsPracticed}</strong></span>
                  <span>🔥 PYQs: <strong className="text-teal-400 font-bold">{r.pyqsSolvedCount}</strong></span>
                  {r.dppCompleted && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] uppercase">
                      DPP Done
                    </span>
                  )}
                  {r.hwCompleted && (
                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[8px] uppercase">
                      HW Done
                    </span>
                  )}
                </div>
              </div>
            ))}

            {selectedRecords.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-950 border border-dashed border-slate-850 rounded-xl">
                <BookOpen className="w-8 h-8 text-slate-600 mb-2 animate-bounce" />
                <p className="text-slate-450 text-xs italic text-center">
                  No slots logged for {selectedDate} yet. Use the form to your left to preserve today's high-performance record!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
