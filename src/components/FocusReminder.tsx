import React, { useState, useEffect } from "react";
import { Clock, Volume2, ShieldAlert, CheckCircle, RotateCcw, Award, Play, Pause } from "lucide-react";

export default function FocusReminder() {
  const [secondsLeft, setSecondsLeft] = useState(1800); // 30 mins = 1800 seconds
  const [isActive, setIsActive] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  
  // Stats inside session
  const [cyclesCompleted, setCyclesCompleted] = useState(() => {
    return Number(localStorage.getItem("jsp_focus_cycles") || "0");
  });

  const [postureChecked, setPostureChecked] = useState(false);
  const [waterChecked, setWaterChecked] = useState(false);
  const [pmoConfirmed, setPmoConfirmed] = useState(false);

  // Sound Synth double bell
  const triggerBuzzerMusic = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      
      // Dual high-alert bell chime
      playTone(660, audioCtx.currentTime, 0.5);
      playTone(660, audioCtx.currentTime + 0.3, 0.6);
      playTone(880, audioCtx.currentTime + 0.6, 0.8);
    } catch (e) {
      // Audio fallback
    }
  };

  useEffect(() => {
    let timerIdx: any = null;
    if (isActive && secondsLeft > 0) {
      timerIdx = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      triggerBuzzerMusic();
      setShowNotification(true);
      setIsActive(false);
    }
    return () => {
      if (timerIdx) clearInterval(timerIdx);
    };
  }, [isActive, secondsLeft]);

  const handleResetTimer = () => {
    setSecondsLeft(1800);
    setIsActive(true);
    setShowNotification(false);
    setPostureChecked(false);
    setWaterChecked(false);
    setPmoConfirmed(false);
  };

  const handleCompleteCheck = () => {
    const nextCount = cyclesCompleted + 1;
    setCyclesCompleted(nextCount);
    localStorage.setItem("jsp_focus_cycles", String(nextCount));
    handleResetTimer();
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainSecs = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(remainSecs).padStart(2, "0")}`;
  };

  return (
    <>
      {/* Mini Persistent Widget in Header */}
      <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded animate-pulse">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-[8px] text-slate-500 font-mono tracking-wider uppercase font-bold">
              30-Min Focused Block
            </h4>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-slate-200 font-mono">
                {formatTime(secondsLeft)}
              </span>
              <span className="bg-blue-500/10 text-blue-400 text-[8px] font-mono px-1.5 py-0.5 rounded border border-blue-500/20">
                {isActive ? "Ticking" : "Paused"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsActive(!isActive)}
            className="p-1 px-2 rounded bg-slate-950 border border-slate-800 hover:bg-slate-800 text-[9px] font-mono font-bold text-slate-300 transition"
          >
            {isActive ? "Pause" : "Start"}
          </button>
          
          <button
            onClick={handleResetTimer}
            className="p-1 px-1.5 rounded bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 transition"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Focus Check Notification Alert Popup Modal */}
      {showNotification && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-blue-500 rounded-lg p-5 max-w-sm w-full shadow-2xl space-y-4">
            
            <div className="text-center space-y-1">
              <span className="text-2xl">⏰ 🧠 🔥</span>
              <h2 className="text-sm font-black text-slate-100 uppercase tracking-widest font-mono">
                Kunal, 30 Minutes Focus Check!
              </h2>
              <p className="text-[11px] text-blue-300 leading-relaxed italic">
                "IIT Delhi MN&C seat requires high mental stamina. Do this focus restoration checkpoint immediately."
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-2 bg-slate-950 p-3 rounded border border-slate-800 text-xs">
              <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase block mb-1">
                Mandatory Restorations:
              </span>

              <label className="flex items-center gap-2 cursor-pointer text-slate-200 py-1 select-none">
                <input
                  type="checkbox"
                  checked={postureChecked}
                  onChange={(e) => setPostureChecked(e.target.checked)}
                  className="rounded accent-blue-600 w-3.5 h-3.5"
                />
                Spine posture check. Sit upright.
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-200 py-1 select-none">
                <input
                  type="checkbox"
                  checked={waterChecked}
                  onChange={(e) => setWaterChecked(e.target.checked)}
                  className="rounded accent-blue-600 w-3.5 h-3.5"
                />
                Take 3 sips of water to hydrate brain cells.
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-200 py-1 select-none">
                <input
                  type="checkbox"
                  checked={pmoConfirmed}
                  onChange={(e) => setPmoConfirmed(e.target.checked)}
                  className="rounded accent-blue-600 w-3.5 h-3.5"
                />
                Defeat all adult video impulses instantly. Clean state.
              </label>
            </div>

            <div className="flex gap-2 text-xs">
              <button
                onClick={handleResetTimer}
                className="flex-1 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 p-2 rounded font-mono"
              >
                Remind in 5
              </button>

              <button
                disabled={!postureChecked || !waterChecked || !pmoConfirmed}
                onClick={handleCompleteCheck}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 disabled:opacity-30 disabled:cursor-not-allowed text-white p-2 rounded font-bold transition flex items-center justify-center gap-1"
              >
                <CheckCircle className="w-4 h-4" /> Next Cycle
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
