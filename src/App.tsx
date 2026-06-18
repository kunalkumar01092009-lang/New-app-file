import React, { useState, useEffect } from "react";
import {
  Flame,
  Award,
  BookOpen,
  Calendar,
  Sparkles,
  TrendingUp,
  MessageSquare,
  ShieldAlert,
  Compass,
  CheckCircle,
  HelpCircle,
  Trophy,
  Zap,
  ChevronRight,
  Target,
  FileCheck2,
  BrainCircuit,
  GraduationCap
} from "lucide-react";

// Import custom high-performance modules
import GuideAI from "./components/GuideAI";
import AntiPmoTracker from "./components/AntiPmoTracker";
import SyllabusTracker from "./components/SyllabusTracker";
import TtsSheet from "./components/TtsSheet";
import TestAnalysis from "./components/TestAnalysis";
import ChessTrainer from "./components/ChessTrainer";
import Journal from "./components/Journal";
import FocusReminder from "./components/FocusReminder";
import PyqYearTracker from "./components/PyqYearTracker";
import GoogleSyncPanel from "./components/GoogleSyncPanel";
import { loadGoogleConfig, saveGoogleConfig } from "./lib/googleWorkspace";

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "Dashboard" | "AntiPmo" | "Syllabus" | "PyqYearly" | "TTS" | "TestStats" | "ChessDoubts" | "Journal"
  >("Dashboard");

  // Motivational goals and target card states
  const [targetRank, setTargetRank] = useState("Under AIR 500 in JEE Advanced");
  const [motivationQuote, setMotivationQuote] = useState(
    "Mathematics & Computing at IIT Delhi is not just a seat, it is a testament to your absolute mental mastery."
  );

  // Daily Quick Check vows checkboxes
  const [vows, setVows] = useState([
    { text: "Avoid instant dopamine & adult videos", checked: false },
    { text: "Complete at least 50 high-quality practice questions", checked: false },
    { text: "Solve JEE Mains and Advanced PYQs", checked: false },
    { text: "Fill out the TTS sheet before wrapping up the day", checked: false },
    { text: "Review active weak topics on calculus/mechanics", checked: false }
  ]);

  // Overall cumulative stats calculated from localStorage
  const [totalStudyHoursCount, setTotalStudyHoursCount] = useState(0);
  const [questionsPracticedCount, setQuestionsPracticedCount] = useState(0);
  const [pyqsSolvedCount, setPyqsSolvedCount] = useState(0);
  const [sobrietyDays, setSobrietyDays] = useState(10);

  // Google OAuth callback and listener
  useEffect(() => {
    // 1. If we are in the popup redirect and have access_token, communicate to parent opener
    if (window.location.hash && window.location.hash.includes("access_token")) {
      if (window.opener) {
        window.opener.postMessage(
          { type: "GSP_AUTH_SUCCESS", hash: window.location.hash },
          "*"
        );
        window.close();
      }
    }

    // 2. Parent window listens for successful messages from popup
    const handleGoogleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === "GSP_AUTH_SUCCESS") {
        const hash = e.data.hash;
        const params = new URLSearchParams(hash.substring(1));
        const token = params.get("access_token");
        const expires = params.get("expires_in") || "3600";
        if (token) {
          const cfg = loadGoogleConfig();
          cfg.accessToken = token;
          cfg.expiresAt = Date.now() + Number(expires) * 1000;
          saveGoogleConfig(cfg);
          
          // trigger a global update so component states re-read
          window.dispatchEvent(new Event("jsp_google_sync_updated"));
        }
      }
    };

    window.addEventListener("message", handleGoogleMessage);
    return () => window.removeEventListener("message", handleGoogleMessage);
  }, []);

  // Load statistical values periodically
  useEffect(() => {
    // 1. Study Hours & Questions Practiced
    const savedTts = localStorage.getItem("jsp_tts_records");
    if (savedTts) {
      try {
        const records = JSON.parse(savedTts);
        const hours = records.reduce((sum: number, r: any) => sum + (r.studyHours || 0), 0);
        const ques = records.reduce((sum: number, r: any) => sum + (r.questionsPracticed || 0), 0);
        const pyqs = records.reduce((sum: number, r: any) => sum + (r.pyqsSolvedCount || 0), 0);
        setTotalStudyHoursCount(hours);
        setQuestionsPracticedCount(ques);
        setPyqsSolvedCount(pyqs);
      } catch (e) {}
    }

    // 2. Sobriety Days
    const savedSob = localStorage.getItem("jsp_sobriety");
    if (savedSob) {
      try {
        const sob = JSON.parse(savedSob);
        const elapsedMs = Date.now() - new Date(sob.lastRelapseDate).getTime();
        const days = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
        setSobrietyDays(days);
      } catch (e) {}
    }
  }, [activeTab]);

  const handleToggleVow = (index: number) => {
    const updated = [...vows];
    updated[index].checked = !updated[index].checked;
    setVows(updated);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* High Density Header */}
      <header className="h-20 md:h-16 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between px-6 bg-slate-950 sticky top-0 z-40 gap-2 py-2">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 bg-blue-600 rounded text-slate-100 flex items-center justify-center font-black text-sm shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            JSP
          </div>
          <div>
            <h1 className="text-xs font-black tracking-tighter text-blue-500 uppercase font-mono flex items-center gap-1.5">
              JEE SELECTOR PARTY
            </h1>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">IIT Delhi MnC Edition</p>
          </div>
        </div>

        {/* Center: Live Consolidated Analytics Row (High Density Theme) */}
        <div className="flex gap-6 md:gap-8 items-center bg-slate-900 px-4 py-1.5 rounded-lg border border-slate-800">
          <div className="text-center">
            <p className="text-[9px] text-slate-500 uppercase font-bold">Study Streak</p>
            <p className="text-sm font-bold text-orange-500">🔥 14 Days</p>
          </div>
          <div className="h-6 w-px bg-slate-800"></div>
          <div className="text-center">
            <p className="text-[9px] text-slate-500 uppercase font-bold">Clean Days</p>
            <p className="text-sm font-bold text-emerald-500">✨ {sobrietyDays.toString().padStart(2, '0')} Days</p>
          </div>
          <div className="h-6 w-px bg-slate-800"></div>
          <div className="text-center">
            <p className="text-[9px] text-slate-500 uppercase font-bold">Total Hours</p>
            <p className="text-sm font-bold text-slate-200">{totalStudyHoursCount || 128.5}h</p>
          </div>
        </div>

        {/* Right: Ticking Timer & Custom Focus Check */}
        <div className="w-full md:w-auto max-w-xs scale-90 md:scale-100 origin-right">
          <FocusReminder />
        </div>
      </header>

      {/* Main layout frame */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Navigation Rail / Sidebar */}
        <aside className="w-full lg:w-64 bg-slate-900 border-r border-slate-800 p-4 space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            {/* Sidebar Target Callout Panel */}
            <div className="bg-blue-600/10 text-blue-400 p-2.5 rounded border border-blue-500/20 mb-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
              <p className="text-[9px] font-bold uppercase tracking-widest text-blue-500/80 mb-0.5">Target</p>
              <p className="font-serif text-sm font-black text-slate-100">IIT Delhi (MnC)</p>
            </div>

            <span className="text-[9px] font-bold font-mono tracking-widest text-slate-500 uppercase block pl-2 pb-2">
              SELECTOR SHEETS
            </span>
            {[
              { id: "Dashboard", label: "🏠 Dashboard Overview", tabId: "Dashboard" },
              { id: "AntiPmo", label: "⚡ Dopamine Shield", tabId: "AntiPmo" },
              { id: "Syllabus", label: "📚 Syllabus Tracker", tabId: "Syllabus" },
              { id: "PyqYearly", label: "📅 Yearwise PYQs", tabId: "PyqYearly" },
              { id: "TTS", label: "📝 TTS Daily Sheet", tabId: "TTS" },
              { id: "TestStats", label: "📊 Test Analytics", tabId: "TestStats" },
              { id: "ChessDoubts", label: "♟️ Tactics & Doubts", tabId: "ChessDoubts" },
              { id: "Journal", label: "📓 Private Journal", tabId: "Journal" }
            ].map((t) => {
              const isActive = activeTab === t.tabId;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.tabId as any)}
                  className={`w-full text-left px-3 py-2 rounded text-xs transition duration-150 flex items-center ${
                    isActive
                      ? "bg-blue-600 text-white font-bold shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Quick Guide AI container or status bar at sidebar bottom */}
          <div className="pt-4 border-t border-slate-800 hidden lg:block space-y-3">
            <div className="bg-slate-950 p-3 rounded border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-[9px] uppercase font-mono font-bold text-slate-400">
                <BrainCircuit className="w-3.5 h-3.5 text-blue-400" />
                <span>Guide AI Assistant</span>
              </div>
              <p className="text-[9px] text-slate-500 leading-relaxed font-sans">
                Always live in bottom-right grid to resolve questions crispy & quick.
              </p>
            </div>

            {/* Sidebar high-density reminder bar */}
            <div className="p-3 bg-red-950/20 border border-red-900/40 rounded flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase font-bold text-red-400">Focus Session</span>
                <span className="text-[9px] text-red-500 animate-pulse">ACTIVE</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-2/3 h-full bg-red-500"></div>
              </div>
            </div>
            
            <div className="text-center text-[9px] text-slate-600 font-mono">
              JEE SECTOR PARTY v1.1.0
            </div>
          </div>
        </aside>

        {/* Content canvas workspace */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {/* DASHBOARD TAB OVERVIEW */}
          {activeTab === "Dashboard" && (
            <div className="space-y-6">
              {/* Wallpaper Hero Block with IIT Delhi generated visual banner */}
              <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-900 group h-64 md:h-72 shadow-lg flex items-end">
                {/* Fallback pattern to visual picsum if generated file shows issues */}
                <img
                  src="/src/assets/images/iit_delhi_campus_1781745724442.jpg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1920&auto=format&fit=crop";
                  }}
                  alt="IIT Delhi Main Administrative Building illustration"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover brightness-[0.35] group-hover:scale-[1.01] transition-transform duration-700"
                />

                {/* Decorative border overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>

                <div className="relative p-6 md:p-8 space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="bg-yellow-500/20 text-yellow-500 text-[9px] border border-yellow-500/30 font-bold font-mono px-2 py-0.5 rounded tracking-widest uppercase">
                      My Ultimate Oath
                    </span>
                    <span className="text-[10px] text-blue-400 font-bold font-mono uppercase tracking-wider">
                      Mathematics & Computing (MnC)
                    </span>
                  </div>

                  <h1 className="text-xl md:text-3xl font-black tracking-tight text-white leading-tight font-serif italic">
                    IIT DELHI MAIN CAMPUS
                  </h1>

                  <p className="text-xs text-slate-300 italic bg-black/50 p-3 rounded border border-slate-800/40 backdrop-blur-sm leading-relaxed max-w-xl">
                    "{motivationQuote}"
                  </p>

                  <div className="pt-1 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <Target className="w-3.5 h-3.5 text-blue-500" />
                    <span>Target Target:</span>
                    <strong className="text-slate-200">{targetRank}</strong>
                  </div>
                </div>
              </div>

              {/* Statistics Row summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-2">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex items-center gap-3">
                  <div className="p-3 rounded bg-orange-500/10 text-orange-400 font-bold text-lg font-mono">
                    {sobrietyDays}d
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono uppercase font-bold block">PMO Clean Streak</span>
                    <span className="block text-xs font-semibold text-slate-300">Defeating Urges</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex items-center gap-3">
                  <div className="p-3 rounded bg-blue-500/10 text-blue-400 font-mono font-bold text-lg">
                    {totalStudyHoursCount}h
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono uppercase font-bold block">Logged Practice</span>
                    <span className="block text-xs font-semibold text-slate-300">Study Duration</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex items-center gap-3">
                  <div className="p-3 rounded bg-purple-500/10 text-purple-400 font-mono font-bold text-lg">
                    {questionsPracticedCount}
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono uppercase font-bold block">Practice Questions</span>
                    <span className="block text-xs font-semibold text-slate-300">Total Solved</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex items-center gap-3">
                  <div className="p-3 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold text-lg">
                    {pyqsSolvedCount}
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono uppercase font-bold block">JEE PYQ Bank</span>
                    <span className="block text-xs font-semibold text-slate-300">Completed PYQs</span>
                  </div>
                </div>
              </div>

              {/* Grid: Daily Vows (Self Accountability) VS AI Chat Assistant widget side-by-side */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Daily vows check */}
                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                        Daily Vows & Mindset
                      </h2>
                      <p className="text-[10px] text-slate-500">Tick check Kunal to build instant selector party energy today</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                      TODAY ACTIVE
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    {vows.map((v, index) => (
                      <div
                        key={index}
                        onClick={() => handleToggleVow(index)}
                        className={`flex items-start gap-3 p-2.5 rounded border cursor-pointer select-none transition ${
                          v.checked
                            ? "bg-blue-600/10 border-blue-500/30 text-blue-300"
                            : "bg-slate-950 border-slate-850 text-slate-300 hover:border-slate-800"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center text-[10px] ${
                            v.checked ? "bg-blue-600 text-slate-100" : "bg-slate-900 border border-slate-800"
                          }`}
                        >
                          {v.checked && "✓"}
                        </div>
                        <span className="text-xs font-sans leading-relaxed">{v.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Motivational Quote Banner bottom */}
                  <div className="bg-red-500/5 p-3.5 rounded border border-red-500/10 text-[11px] leading-relaxed relative overflow-hidden">
                    <span className="absolute -right-4 -bottom-4 font-mono font-black text-6xl text-red-500/5 select-none uppercase">MNC</span>
                    <strong className="text-red-400 uppercase tracking-widest font-mono">Selector Party Quote:</strong>
                    <p className="text-slate-350 mt-0.5">
                      "I used to watch videos 2 times in a week... Drains motivation. Every second saved from those is converted directly into 1 additional mark in JEE Mathematics paper. Take control."
                    </p>
                  </div>
                </div>

                {/* Sidebar Quick AI chat assistant right inside dashboard */}
                <div className="lg:col-span-5 flex flex-col">
                  <GuideAI />
                </div>
              </div>

              {/* Secure Cloud Sync Console at Dashboard bottom */}
              <GoogleSyncPanel />
            </div>
          )}

          {/* ACTIVE SOVRIETY PMO TAB SCREEN */}
          {activeTab === "AntiPmo" && (
            <div className="space-y-6">
              <AntiPmoTracker />
            </div>
          )}

          {/* ACTIVE SYLLABUS SCREEN PANEL */}
          {activeTab === "Syllabus" && (
            <div className="space-y-6">
              <SyllabusTracker />
            </div>
          )}

          {/* ACTIVE YEARWISE PYQ TRACKER PANEL */}
          {activeTab === "PyqYearly" && (
            <div className="space-y-6">
              <PyqYearTracker />
            </div>
          )}

          {/* ACTIVE TTS TIMELINE SHEET WORKSHEET */}
          {activeTab === "TTS" && (
            <div className="space-y-6">
              <TtsSheet />
            </div>
          )}

          {/* ACTIVE TEST ANALYTICS PROGRESS SCREEN */}
          {activeTab === "TestStats" && (
            <div className="space-y-6">
              <TestAnalysis />
            </div>
          )}

          {/* CHESS MIND GYM AND TACTICAL PUZZLES + CHAPTER DOUBTS SCREEN */}
          {activeTab === "ChessDoubts" && (
            <div className="space-y-6">
              <ChessTrainer />
            </div>
          )}

          {/* JOURNAL DIARY */}
          {activeTab === "Journal" && (
            <div className="space-y-6">
              <Journal />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
