import React, { useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from "recharts";
import { Plus, Award, AlertTriangle, ArrowRight, TrendingUp, HelpCircle, Trash2 } from "lucide-react";
import { TestAnalysisRecord } from "../types";

export default function TestAnalysis() {
  const [tests, setTests] = useState<TestAnalysisRecord[]>(() => {
    const saved = localStorage.getItem("jsp_tests");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ...
      }
    }
    
    // Seed initial tests
    return [
      {
        id: "test-1",
        testName: "JEE Mains Part Test 1",
        date: "2026-05-15",
        marksPhysics: 65,
        marksChemistry: 72,
        marksMaths: 55,
        totalMarks: 192,
        possibleMarks: 300,
        weakTopics: "Rotational Dynamics (Inertia calculations), Organic GOC acid strength, Quad Equations complex roots",
        remarks: "Need deep practice in maths. Chemistry scores are satisfying. General accuracy is good.",
      },
      {
        id: "test-2",
        testName: "JEE Mains Part Test 2",
        date: "2026-06-01",
        marksPhysics: 70,
        marksChemistry: 65,
        marksMaths: 68,
        totalMarks: 203,
        possibleMarks: 300,
        weakTopics: "Projectiles on inclined plane, Equilibrium calculations, Complex numbers geometry",
        remarks: "Math improved. Physical chemistry needs formula revisions. Speed was better than test 1.",
      },
      {
        id: "test-3",
        testName: "Advanced Full Mock 1",
        date: "2026-06-12",
        marksPhysics: 82,
        marksChemistry: 70,
        marksMaths: 78,
        totalMarks: 230,
        possibleMarks: 300,
        weakTopics: "Gauss Law advanced application, Coordination compounds color isomerism, Limits sandwich theorem",
        remarks: "Excellent jump! High concentration during calculus section saved multiple marks. Keep it up!",
      },
    ];
  });

  const [testName, setTestName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [marksPhysics, setMarksPhysics] = useState(70);
  const [marksChemistry, setMarksChemistry] = useState(70);
  const [marksMaths, setMarksMaths] = useState(75);
  const [possibleMarks, setPossibleMarks] = useState(300);
  const [weakTopics, setWeakTopics] = useState("");
  const [remarks, setRemarks] = useState("");

  const saveTests = (updated: TestAnalysisRecord[]) => {
    setTests(updated);
    localStorage.setItem("jsp_tests", JSON.stringify(updated));
  };

  const handleAddTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim()) return;

    const total = marksPhysics + marksChemistry + marksMaths;
    const newRecord: TestAnalysisRecord = {
      id: `test-${Date.now()}`,
      testName: testName.trim(),
      date,
      marksPhysics: Number(marksPhysics),
      marksChemistry: Number(marksChemistry),
      marksMaths: Number(marksMaths),
      totalMarks: total,
      possibleMarks: Number(possibleMarks),
      weakTopics: weakTopics.trim() || "All concepts robust",
      remarks: remarks.trim() || "No remarks logged.",
    };

    saveTests([...tests, newRecord]);
    setTestName("");
    setWeakTopics("");
    setRemarks("");
  };

  const handleDeleteTest = (id: string) => {
    const updated = tests.filter((t) => t.id !== id);
    saveTests(updated);
  };

  // Create chart data
  const chartData = [...tests].reverse().map((t) => ({
    name: t.testName.substring(0, 15) + (t.testName.length > 15 ? ".." : ""),
    Physics: t.marksPhysics,
    Chemistry: t.marksChemistry,
    Maths: t.marksMaths,
    Total: t.totalMarks,
    Target: Math.round(t.possibleMarks * 0.75), // 75% target rank score
  }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          Test Analytics & Comparison
          <span className="text-[10px] bg-red-500/10 text-red-400 font-mono tracking-widest uppercase border border-red-500/20 px-2 py-0.5 rounded-full">
            Performance Index
          </span>
        </h2>
        <p className="text-xs text-slate-400 font-sans">
          Log mock exam marks, evaluate weak subject-topics, and view progressive scoring curves.
        </p>
      </div>

      {/* Analytics Performance Graphic charts check */}
      {tests.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-950 p-4 rounded-xl border border-slate-850">
          {/* Trend chart */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-blue-300 font-mono tracking-wider uppercase">Subject Breakdown (Score Curves)</h4>
            <div className="h-60 w-full text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Line type="monotone" dataKey="Physics" stroke="#ec4899" activeDot={{ r: 6 }} strokeWidth={2.5} />
                  <Line type="monotone" dataKey="Chemistry" stroke="#10b981" strokeWidth={2.5} />
                  <Line type="monotone" dataKey="Maths" stroke="#6366f1" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grand total comparison bar chart */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-blue-300 font-mono tracking-wider uppercase">Total Marks Comparison vs 75% Target</h4>
            <div className="h-60 w-full text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="Total" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Target" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-500 italic bg-slate-950 rounded-xl border border-slate-850 text-xs">
          No tests recorded yet to compare. Add your first mock score logs below to see trend lines!
        </div>
      )}

      {/* Grid container: form vs history list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-2">
        {/* Record creation side */}
        <form onSubmit={handleAddTest} className="lg:col-span-5 bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-4">
          <h3 className="text-sm font-bold text-blue-300 flex items-center gap-1.5 font-mono uppercase tracking-wide">
            Add Test Record
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-500 font-mono mb-1">TEST NAME</label>
              <input
                type="text"
                required
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="eg. AITS Advanced Full Test"
                className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-100 p-2 rounded focus:outline-none placeholder-slate-650"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-mono mb-1">DATE</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-100 p-2 rounded focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-[9px] text-slate-500 font-mono mb-1">PHYSICS</label>
              <input
                type="number"
                min="0"
                required
                value={marksPhysics}
                onChange={(e) => setMarksPhysics(Number(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-800 text-xs text-pink-400 font-mono p-2 rounded focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[9px] text-slate-500 font-mono mb-1">CHEMISTRY</label>
              <input
                type="number"
                min="0"
                required
                value={marksChemistry}
                onChange={(e) => setMarksChemistry(Number(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-mono p-2 rounded focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[9px] text-slate-500 font-mono mb-1">MATHS</label>
              <input
                type="number"
                min="0"
                required
                value={marksMaths}
                onChange={(e) => setMarksMaths(Number(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-800 text-xs text-blue-400 font-mono p-2 rounded focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[9px] text-slate-500 font-mono mb-1">GRAND TOTAL</label>
              <div className="w-full bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-slate-300 p-2 rounded flex items-center justify-center">
                {marksPhysics + marksChemistry + marksMaths}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-500 font-mono mb-1">GRAND POSSIBLE MARKS</label>
            <input
              type="number"
              min="1"
              value={possibleMarks}
              onChange={(e) => setPossibleMarks(Number(e.target.value) || 300)}
              className="w-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-100 p-2 rounded focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-550 font-mono mb-1">WEAK TOPICS / CHAPTERS TO IMPROVE</label>
            <textarea
              rows={2}
              value={weakTopics}
              onChange={(e) => setWeakTopics(e.target.value)}
              placeholder="List weak concepts spotted, eg: Inertia calculations, GOC inductive effect isomers, Definite integral bounds."
              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-100 p-2 rounded focus:outline-none placeholder-slate-650"
            ></textarea>
          </div>

          <div>
            <label className="block text-[10px] text-slate-500 font-mono mb-1">CRITICAL REACTION & REMARKS</label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="General remarks on exam pressure, accuracy errors, or strategy changes."
              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-100 p-2 rounded focus:outline-none placeholder-slate-650"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl font-bold text-xs transition duration-150 flex items-center justify-center gap-2"
          >
            <Plus className="w-4.5 h-4.5" />
            Save Test Audit
          </button>
        </form>

        {/* Display listing of past tests */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            Past Test Papers Logs ({tests.length})
          </h3>

          <div className="space-y-3 overflow-y-auto max-h-[460px] pr-2 scrollbar-thin scrollbar-thumb-slate-800">
            {tests.map((t) => {
              const perc = Math.round((t.totalMarks / t.possibleMarks) * 100);
              const rankColor = perc >= 70 ? "text-emerald-400 font-black border-emerald-500/20 bg-emerald-500/5" : perc >= 50 ? "text-amber-400 font-bold border-amber-500/20 bg-amber-500/5" : "text-rose-400 border-rose-500/20 bg-rose-500/5";

              return (
                <div
                  key={t.id}
                  className="bg-slate-950 border border-slate-850 p-4 rounded-xl relative hover:border-slate-800 transition shadow"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{t.testName}</h4>
                      <span className="text-[9px] text-slate-500 font-mono">Exam Date: {t.date}</span>
                    </div>

                    <div className="flex gap-2 items-center">
                      <div className={`px-2.5 py-1 text-xs font-mono rounded border flex flex-col items-center justify-center ${rankColor}`}>
                        <span className="text-[14px] font-bold">{perc}%</span>
                        <span className="text-[8px] tracking-widest font-mono">SCORE</span>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteTest(t.id)}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Marks breakdown details */}
                  <div className="grid grid-cols-3 gap-2 mt-3 bg-slate-900/40 p-2 rounded-lg text-center font-mono text-[10px]">
                    <div className="border-r border-slate-850">
                      <span className="text-[8px] text-slate-500 block">PHYSICS</span>
                      <strong className="text-pink-400">{t.marksPhysics}</strong> / 100
                    </div>
                    <div className="border-r border-slate-850">
                      <span className="text-[8px] text-slate-500 block">CHEMISTRY</span>
                      <strong className="text-emerald-400">{t.marksChemistry}</strong> / 100
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-500 block">MATHS</span>
                      <strong className="text-blue-400">{t.marksMaths}</strong> / 100
                    </div>
                  </div>

                  {/* Weak topics list highlights */}
                  <div className="mt-3 bg-red-950/20 border border-red-500/10 p-2.5 rounded-lg space-y-1">
                    <div className="flex items-center gap-1.5 text-[9px] text-red-400 font-bold font-mono">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      WEAK TOPICS & TOPICS FOR FOCUS:
                    </div>
                    <p className="text-[10.5px] text-slate-300 leading-relaxed font-sans font-medium italic">
                      "{t.weakTopics}"
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2 font-sans pl-1">
                    <strong className="text-blue-300">Strategy block:</strong> {t.remarks}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
