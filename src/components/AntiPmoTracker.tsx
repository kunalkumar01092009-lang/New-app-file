import React, { useState, useEffect } from "react";
import { Shield, Sparkles, Flame, AlertCircle, Calendar, Plus, RefreshCw, Zap, HeartCrack } from "lucide-react";
import { SobrietyState } from "../types";

const EMERGENCY_MOTIVATIONS = [
  "MnC at IIT Delhi isn't won by giving in to cheap dopamine. Stop! Lock your phone away. Do 20 squats right now!",
  "That instant dopamine drains your mental agility. If you fail now, you trade your real future for a 5-minute illusion. Reset your energy, take deep breaths!",
  "Kunal, stands of IIT Delhi CSE/MnC classrooms are filled with focus. PMO drains your motivation. Go splash cold water on your face instantly!",
  "Your struggle is tough, but your manganese and math skills are tougher. Cleanse your eyes and get back to your Calculus/JEE sheet!",
  "A high-scoring rank requires high self-control. Close that browser tab! JEE Mains & Advanced is your only selector party."
];

const EMERGENCY_EXERCISES = [
  "Do 20 solid Pushups right now to move blood to your muscles.",
  "Immediately splash cold tap water on your eyes and face 5 times.",
  "Stand up, walk out of your room, take 10 deep diaphragmatic breaths.",
  "Close your eyes and recite: 'I will grab a seat in Mathematics & Computing in IIT Delhi.'",
  "Write down the next single math problem and start solving it immediately."
];

export default function AntiPmoTracker() {
  const [sobriety, setSobriety] = useState<SobrietyState>(() => {
    const saved = localStorage.getItem("jsp_sobriety");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // default
      }
    }
    // Default: 10 days ago base
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() - 10);
    return {
      streakDays: 10,
      lastRelapseDate: defaultDate.toISOString(),
      urgeCount: 2,
      urgesLog: [
        { timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), note: "Felt heavy fatigue after physics session." },
        { timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), note: "Late night study trigger." }
      ]
    };
  });

  const [emergencyActive, setEmergencyActive] = useState(false);
  const [motivationText, setMotivationText] = useState("");
  const [exerciseText, setExerciseText] = useState("");
  const [urgeNote, setUrgeNote] = useState("");
  const [timerText, setTimerText] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Update real-time clock timer
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsedMs = Date.now() - new Date(sobriety.lastRelapseDate).getTime();
      const seconds = Math.floor((elapsedMs / 1000) % 60);
      const minutes = Math.floor((elapsedMs / (1000 * 60)) % 60);
      const hours = Math.floor((elapsedMs / (1000 * 60 * 60)) % 24);
      const days = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
      setTimerText({ days, hours, minutes, seconds });
    }, 1000);
    return () => clearInterval(interval);
  }, [sobriety.lastRelapseDate]);

  // Save sobriety block to localStorage
  const saveSobriety = (newState: SobrietyState) => {
    setSobriety(newState);
    localStorage.setItem("jsp_sobriety", JSON.stringify(newState));
  };

  const triggerUrgeControl = () => {
    const randMot = EMERGENCY_MOTIVATIONS[Math.floor(Math.random() * EMERGENCY_MOTIVATIONS.length)];
    const randEx = EMERGENCY_EXERCISES[Math.floor(Math.random() * EMERGENCY_EXERCISES.length)];
    setMotivationText(randMot);
    setExerciseText(randEx);
    setEmergencyActive(true);

    const updatedLog = [
      { timestamp: new Date().toISOString(), note: "Triggered emergency button" },
      ...sobriety.urgesLog
    ].slice(0, 8);

    saveSobriety({
      ...sobriety,
      urgeCount: sobriety.urgeCount + 1,
      urgesLog: updatedLog
    });
  };

  const handleLogUrgeNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urgeNote.trim()) return;

    const updatedLog = [
      { timestamp: new Date().toISOString(), note: urgeNote.trim() },
      ...sobriety.urgesLog
    ].slice(0, 10);

    saveSobriety({
      ...sobriety,
      urgesLog: updatedLog
    });
    setUrgeNote("");
  };

  // Log Relapse resetting state
  const handleRelapse = () => {
    const conf = window.confirm("Kunal, are you sure you want to log a failure? Be honest. Your IIT Delhi MnC dreams are waiting. If yes, the counter resets. Failures are lessons. We learn and make the next wall stronger.");
    if (conf) {
      const now = new Date().toISOString();
      const updatedLog = [
        { timestamp: now, note: "Logged relapse. Re-committing to high-focus JEE prep." },
        ...sobriety.urgesLog
      ].slice(0, 10);

      saveSobriety({
        streakDays: 0,
        lastRelapseDate: now,
        urgeCount: sobriety.urgeCount,
        urgesLog: updatedLog
      });
      setEmergencyActive(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Dopamine Guard & Sobriety
              <span className="text-xs bg-blue-500/20 text-blue-300 font-mono border border-blue-400/20 px-2 py-0.5 rounded-full">
                Focus Recovery
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Recovering clean focus and brain motivation for JEE Mains & Advanced.
            </p>
          </div>
        </div>

        <button
          onClick={triggerUrgeControl}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-semibold text-xs transition shadow-lg shadow-red-600/10 animate-pulse"
        >
          <Zap className="w-4 h-4 fill-white" />
          ⚡ FELEING AN URGE? RESET FOCUS
        </button>
      </div>

      {/* Emergency Focus Block */}
      {emergencyActive && (
        <div className="bg-gradient-to-br from-red-950/40 to-slate-900 border-2 border-red-600/40 p-5 rounded-xl space-y-3 relative overflow-hidden">
          <span className="absolute -right-6 -bottom-6 text-red-500/5 select-none font-bold text-8xl">JSP</span>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest font-mono">
                IIT Delhi Selector Emergency Shield
              </h4>
              <p className="text-sm font-medium text-slate-200 mt-1 whitespace-pre-line leading-relaxed">
                "{motivationText}"
              </p>
              
              <div className="mt-3 bg-red-950/60 border border-red-800/30 p-3 rounded-lg">
                <p className="text-[11px] text-red-400 font-mono uppercase tracking-wider">
                  INSTANT SHIFT ACTION REQUIRED:
                </p>
                <p className="text-xs font-bold text-amber-300 mt-0.5">
                  {exerciseText}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setEmergencyActive(false)}
              className="text-[11px] bg-slate-800 text-slate-300 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 font-mono"
            >
              Okay, Focus Reset Successfully
            </button>
          </div>
        </div>
      )}

      {/* Counter Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Counter Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
          <Flame className="absolute right-3 top-3 w-16 h-16 text-red-600/10" />
          <div>
            <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase block">
              RECOVERED STREAK TIMER
            </span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-4xl font-extrabold text-slate-100 font-mono">
                {timerText.days}
              </span>
              <span className="text-xs text-slate-400 font-mono">d</span>
              <span className="text-2xl font-semibold text-slate-200 font-mono ml-2">
                {String(timerText.hours).padStart(2, "0")}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">h</span>
              <span className="text-xl font-medium text-slate-300 font-mono ml-1">
                {String(timerText.minutes).padStart(2, "0")}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">m</span>
              <span className="text-sm text-slate-400 font-mono ml-1 text-red-400">
                {String(timerText.seconds).padStart(2, "0")}
              </span>
              <span className="text-[10px] text-red-500 font-mono">s</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-mono">
              Last restart: {new Date(sobriety.lastRelapseDate).toLocaleDateString()}
            </span>
            <button
              onClick={handleRelapse}
              className="text-[9px] font-sans text-red-400 bg-red-400/5 hover:bg-red-400/10 border border-red-500/20 px-2 py-0.5 rounded transition"
            >
              Log Failure
            </button>
          </div>
        </div>

        {/* Benefits Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase block">
              DOPAMINE DENSITY STATUS
            </span>
            <h4 className="text-sm font-semibold text-slate-200 mt-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              {timerText.days < 3 ? "Rebuilding Receptors" : timerText.days < 7 ? "Energy Surging" : "Supercharged Motivation"}
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {timerText.days < 3
                ? "First 72 hrs: dopamine demands run high. Focus on high-intensity physics/math problem solving."
                : timerText.days < 7
                ? "Week 1: Motivation returning, complex concepts are easier to focus. Keep the guard up!"
                : "Your motivation circuits are pristine. Time for the ultimate MNC seat push."}
            </p>
          </div>
          <span className="text-[10px] text-blue-400 font-mono block mt-2">
            Goal: MNC Branch at IIT Delhi
          </span>
        </div>

        {/* Records Urge Tracker card */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase block">
              URGE SHIELD LOG
            </span>
            <div className="mt-2 text-slate-200 text-sm font-bold font-mono">
              {sobriety.urgeCount} Urges Defeated
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
              Logging every time you beat a craving strengthens your self-command neural pathways.
            </p>
          </div>

          <form onSubmit={handleLogUrgeNote} className="mt-3 flex gap-1.5">
            <input
              type="text"
              value={urgeNote}
              onChange={(e) => setUrgeNote(e.target.value)}
              placeholder="What triggered it? (eg: Boredom)"
              className="flex-1 bg-slate-900 border border-slate-850 px-2 py-1 text-[10px] text-slate-200 placeholder-slate-600 rounded bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 p-1 text-[10px] text-slate-100 font-mono rounded"
            >
              Log
            </button>
          </form>
        </div>
      </div>

      {/* Logs timeline showing past triggers */}
      <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl">
        <h4 className="text-xs font-semibold text-slate-200 mb-3 font-mono uppercase tracking-wide">
          Recent Focus Battlefronts:
        </h4>
        <div className="max-h-[120px] overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-slate-800 text-[11px]">
          {sobriety.urgesLog.map((log, index) => (
            <div key={index} className="flex justify-between items-start p-2 rounded bg-slate-900/60 border border-slate-850">
              <span className="text-slate-300 font-sans">{log.note}</span>
              <span className="text-slate-500 font-mono text-[9px] whitespace-nowrap ml-2">
                {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
          {sobriety.urgesLog.length === 0 && (
            <p className="text-slate-500 italic">No urge logs recorded yet. Clean streak starts strong!</p>
          )}
        </div>
      </div>
    </div>
  );
}
