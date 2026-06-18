import React, { useState, useEffect } from "react";
import { MessageSquare, Award, Play, BookOpen, Volume2, Sparkles, HelpCircle, Dumbbell, Send, Trash2, ShieldAlert, Upload, Image as ImageIcon, Cloud, CloudOff, RefreshCw } from "lucide-react";
import { DoubtQuestion } from "../types";
import { loadGoogleConfig, appendSheetsRow, uploadFileToDrive, sendToWebhook } from "../lib/googleWorkspace";

// Chess Puzzles definers for learning
interface ChessPuzzle {
  id: string;
  title: string;
  theme: string;
  description: string;
  boardState: string[][]; // 8x8 list representing Unicode symbols or empty
  aiMoveExplain: string;
}

const CHESS_PUZZLES: ChessPuzzle[] = [
  {
    id: "puz-1",
    title: "Tactical Fork (Double Attack)",
    theme: "Forking Queen and King",
    description: "Move your White Knight (♘) to C7 to Fork the Black King (♚) and Queen (♛) simultaneously!",
    aiMoveExplain: "A Knight Fork is like finding a common link in Physics. A single formula tackles both mechanics and thermal equations instantly. Look for dual leverage!",
    boardState: [
      ["♜", "♞", "♝", "♛", "♚", "♝", "", "♜"],
      ["♟", "♟", "♟", "♟", "", "♟", "♟", "♟"],
      ["", "", "", "", "", "♞", "", ""],
      ["", "", "", "", "♟", "", "", ""],
      ["", "", "", "", "♙", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["♙", "♙", "♙", "♙", "", "♙", "♙", "♙"],
      ["♖", "♘", "♗", "♕", "♔", "♗", "", "♖"],
    ]
  },
  {
    id: "puz-2",
    title: "The Ultimate Pin Tactic",
    theme: "Absolut Pin of the Rook",
    description: "Position your White Bishop (♗) at B5 to pin the Black Rook (♜) directly against the Black King (♚). The Rook can't run!",
    aiMoveExplain: "A Chess pin isolates high value targets. In JEE, bind your weak topics (like coordination chemistry) in strict timetables so they cannot escape.",
    boardState: [
      ["♜", "", "", "", "♚", "", "", ""],
      ["♟", "♟", "", "♟", "♟", "♟", "♟", "♟"],
      ["", "", "", "", "", "", "", ""],
      ["", "", "♜", "", "", "", "", ""],
      ["", "", "", "", "♙", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["♙", "♙", "♙", "♙", "", "♙", "♙", "♙"],
      ["♖", "♘", "♗", "♕", "♔", "", "", "♖"],
    ]
  }
];

export default function ChessTrainer() {
  // Navigation tabs state inside component
  const [innerTab, setInnerTab] = useState<"Chess" | "Doubts">("Chess");

  // --- Doubts States ---
  const [doubts, setDoubts] = useState<DoubtQuestion[]>(() => {
    const saved = localStorage.getItem("jsp_doubts");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: "d-1",
        subject: "Mathematics",
        chapter: "Quadratic Equations",
        questionText: "How to find common roots of x^3 + ax + b = 0 and x^2 + bx + a = 0 under dynamic complex bounds?",
        dateAdded: "2026-06-16",
        notes: "Try equating coefficients after multiplying second equation with x. Look out for x=1 as potential root.",
        status: "Unsolved",
      },
      {
        id: "d-2",
        subject: "Physics",
        chapter: "Rotational Dynamics",
        questionText: "A solid cylinder of mass M and radius R rolls down on an inclined plane with friction. Find acceleration of COM using torque method and verify with energy method.",
        dateAdded: "2026-06-17",
        notes: "Torque = I * alpha. Force of friction f acts upwards. Solving both equations gives a = 2/3 * g * sin(theta). Solved in morning lecture class.",
        status: "Solved",
      }
    ];
  });

  const [doubtText, setDoubtText] = useState("");
  const [doubtSubject, setDoubtSubject] = useState<"Physics" | "Chemistry" | "Mathematics">("Mathematics");
  const [doubtChapter, setDoubtChapter] = useState("");

  // Google Sync & File selection states
  const [googleConfig, setGoogleConfig] = useState(() => loadGoogleConfig());
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncError, setSyncError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    setGoogleConfig(loadGoogleConfig());
  }, [doubts]);
  
  // --- Chess States ---
  const [activePuzzleIdx, setActivePuzzleIdx] = useState(0);
  const [celebrationActive, setCelebrationActive] = useState(false);
  const [completionMessage, setCompletionMessage] = useState("");
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);

  // Puzzle board interactive copy
  const activePuzzle = CHESS_PUZZLES[activePuzzleIdx];

  const triggerCelebrate = () => {
    // Generate motivational celebration message
    const msgs = [
      "Kunal, you absolutely crushed today's targets! IIT Delhi MnC class is proud of your persistent hard work. Let's celebrate our dedication!",
      "Superb focus Kunal! Today's lectures are fully covered and DPP is solved. The gate of IIT Delhi in MNC department moves 1 step closer. Selector party is live!",
      "Bravo, Kunal! Deep commitment to avoid porn, focus on studies, and solve standard hours. Keep this streak blazing!"
    ];
    setCompletionMessage(msgs[Math.floor(Math.random() * msgs.length)]);
    setCelebrationActive(true);
    
    // In-app audio alert sound synth to celebrate targets
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = (freq: number, startTime: number, duration: number, type: "sine" | "triangle" = "sine") => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(freq, startTime);
        osc.type = type;
        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      // Play ascending fanfare chords
      playTone(523.25, audioCtx.currentTime, 0.2, "triangle"); // C5
      playTone(659.25, audioCtx.currentTime + 0.15, 0.2, "triangle"); // E5
      playTone(783.99, audioCtx.currentTime + 0.3, 0.25, "triangle"); // G5
      playTone(1046.50, audioCtx.currentTime + 0.45, 0.4, "sine"); // C6
    } catch (e) {
      // AudioCtx fallback
    }
  };

  const saveDoubts = (updated: DoubtQuestion[]) => {
    setDoubts(updated);
    localStorage.setItem("jsp_doubts", JSON.stringify(updated));
  };

  const handleAddDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtText.trim() || !doubtChapter.trim()) return;

    setSyncStatus("idle");
    setSyncError("");

    let uploadedImageUrl = "";
    let driveId = "";

    // If an image is selected, handle either true cloud upload or local previewing URL first
    if (selectedFile) {
      const isTokenValid = googleConfig.accessToken && googleConfig.expiresAt > Date.now();
      if (isTokenValid) {
        setSyncStatus("syncing");
        try {
          const uploadRes = await uploadFileToDrive(googleConfig.accessToken, selectedFile);
          uploadedImageUrl = uploadRes.webViewLink;
          driveId = uploadRes.fileId;
        } catch (err: any) {
          console.error(err);
          setSyncStatus("error");
          setSyncError("File upload to Drive failed: " + (err.message || err));
        }
      } else {
        // Local fallback URL so the user can see state offline
        uploadedImageUrl = URL.createObjectURL(selectedFile);
      }
    }

    const newDoubt: DoubtQuestion = {
      id: `doubt-${Date.now()}`,
      subject: doubtSubject,
      chapter: doubtChapter.trim(),
      questionText: doubtText.trim(),
      dateAdded: new Date().toISOString().split("T")[0],
      notes: "",
      status: "Unsolved",
      imageUrl: uploadedImageUrl,
      driveFileId: driveId,
    };

    saveDoubts([...doubts, newDoubt]);
    setDoubtText("");
    setDoubtChapter("");
    setSelectedFile(null);

    // Sync sheet entry as well
    const config = loadGoogleConfig();
    const isTokenValid = config.accessToken && config.expiresAt > Date.now();

    if (config.useWebhook && config.webhookUrl) {
      setSyncStatus("syncing");
      const ok = await sendToWebhook(config.webhookUrl, {
        type: "doubt",
        ...newDoubt,
      });
      if (ok) {
        setSyncStatus("success");
      } else {
        setSyncStatus("error");
        setSyncError("Webhook doubt sync failed");
      }
    } else if (isTokenValid && config.spreadsheetId) {
      setSyncStatus("syncing");
      try {
        await appendSheetsRow(
          config.accessToken,
          config.spreadsheetId,
          "Doubt Solvers!A:G",
          [
            [
              newDoubt.dateAdded,
              newDoubt.subject,
              newDoubt.chapter,
              newDoubt.questionText,
              newDoubt.imageUrl || "No Image",
              newDoubt.notes || "",
              newDoubt.status,
            ],
          ]
        );
        setSyncStatus("success");
      } catch (err: any) {
        console.error(err);
        setSyncStatus("error");
        setSyncError(err.message || "Spreadsheet append failed");
      }
    }
  };

  const toggleDoubtStatus = (id: string) => {
    const updated = doubts.map((d) => {
      if (d.id === id) {
        return {
          ...d,
          status: d.status === "Solved" ? "Unsolved" : ("Solved" as const)
        };
      }
      return d;
    });
    saveDoubts(updated);
  };

  const handleUpdateDoubtNotes = (id: string, notes: string) => {
    const updated = doubts.map((d) => {
      if (d.id === id) {
        return { ...d, notes };
      }
      return d;
    });
    saveDoubts(updated);
  };

  const handleDeleteDoubt = (id: string) => {
    const updated = doubts.filter((d) => d.id !== id);
    saveDoubts(updated);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Header and custom celebrate trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Strategic Mind: Chess & Doubts
              <span className="text-[10px] bg-blue-500/10 text-blue-400 font-mono tracking-widest uppercase border border-blue-500/20 px-2 py-0.5 rounded-full animate-pulse">
                Mental Gymnasium
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Engage tactical logic training through chess puzzles and log chapter-wise doub questions.
            </p>
          </div>
        </div>

        <button
          onClick={triggerCelebrate}
          className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase transition tracking-wider shadow-lg shadow-blue-600/20"
        >
          <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
          🎉 Achieve: Celebrate Target
        </button>
      </div>

      {/* Target celebration banner modal panel */}
      {celebrationActive && (
        <div className="bg-gradient-to-br from-blue-950/70 to-slate-950 border border-blue-400/40 p-5 rounded-xl text-center space-y-3 relative overflow-hidden transition-all duration-300">
          <div className="absolute inset-0 bg-blue-600/5 select-none pointer-events-none animate-ping"></div>
          <span className="text-3xl">🥳 🎓 🎉</span>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest">
            Kunal, Targets Completed Successfully! Celebrate Party Mode Live
          </h3>
          <p className="text-xs text-blue-200 whitespace-pre-line leading-relaxed max-w-xl mx-auto italic font-medium">
            "{completionMessage}"
          </p>
          <div className="flex justify-center gap-2 pt-1.5">
            <button
              onClick={() => setCelebrationActive(false)}
              className="text-[10px] bg-blue-600 hover:bg-blue-500 text-slate-100 font-mono px-3 py-1.5 rounded-lg font-bold"
            >
              Shukriya! Back to Studies
            </button>
          </div>
        </div>
      )}

      {/* Selector switches */}
      <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-xl max-w-xs select-none">
        <button
          onClick={() => setInnerTab("Chess")}
          className={`flex-1 text-center py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            innerTab === "Chess"
              ? "bg-blue-600 text-white shadow"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Chess Trainer
        </button>
        <button
          onClick={() => setInnerTab("Doubts")}
          className={`flex-1 text-center py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            innerTab === "Doubts"
              ? "bg-blue-600 text-white shadow"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Chapter Doubts ({doubts.length})
        </button>
      </div>

      {/* CHESS TRAINER MODULE */}
      {innerTab === "Chess" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Instructions and Puzzle Details */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
              <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">Puzzle Level</span>
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black text-blue-400 uppercase tracking-wide">
                  {activePuzzle.title}
                </h4>
                <div className="flex gap-1.5">
                  {CHESS_PUZZLES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setActivePuzzleIdx(i);
                        setSelectedCell(null);
                      }}
                      className={`w-5 h-5 flex items-center justify-center font-bold text-[10px] rounded font-mono ${
                        activePuzzleIdx === i
                          ? "bg-blue-600 text-white"
                          : "bg-slate-900 text-slate-400 hover:bg-slate-800"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-blue-950/20 rounded border border-blue-500/10 text-xs">
                <span className="text-[10px] text-blue-400 font-bold uppercase block tracking-wider">
                  Tactical goal:
                </span>
                <p className="text-slate-200 font-sans mt-0.5">
                  {activePuzzle.description}
                </p>
              </div>

              {/* Motivational JEE application mapping */}
              <div className="bg-slate-900/60 p-3 rounded text-[11px] leading-relaxed border border-slate-850">
                <div className="flex gap-1.5 text-amber-400 font-bold font-mono">
                  <Play className="w-3.5 h-3.5 mt-0.5 fill-amber-400" />
                  GRANDMASTER FOR JEE ADVICE:
                </div>
                <p className="text-slate-350 italic mt-0.5">
                  "{activePuzzle.aiMoveExplain}"
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-1.5 text-xs text-slate-300">
              <h5 className="font-bold text-slate-200">♟️ Chess Learning Moves:</h5>
              <p>1. Move the pieces by clicking an active piece (White) and clicking its destination grid slot.</p>
              <p>2. Keep practicing tactical planning to make your brain sharp, building critical spatial mapping needed for JEE Mathematics matrices/determinants.</p>
            </div>
          </div>

          {/* Graphical Chess Board layout */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 flex flex-col items-center">
              {/* Board */}
              <div className="grid grid-cols-8 border-2 border-slate-700 w-72 h-72 sm:w-80 sm:h-80 select-none">
                {activePuzzle.boardState.map((rowArr, rIdx) => {
                  return rowArr.map((symbol, cIdx) => {
                    const isDarkSquare = (rIdx + cIdx) % 2 === 1;
                    const squareBg = isDarkSquare ? "bg-slate-800" : "bg-slate-200";
                    const isSelected = selectedCell?.r === rIdx && selectedCell?.c === cIdx;
                    const highlight = isSelected ? "ring-2 ring-blue-500 ring-inset" : "";

                    return (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        onClick={() => {
                          if (symbol && !symbol.match(/[♟♜♞♝♛♚]/)) {
                            // Selected white piece
                            setSelectedCell({ r: rIdx, c: cIdx });
                          } else if (selectedCell) {
                            // Attempt move
                            alert(`Kunal moved white component from row ${8-selectedCell.r} col ${String.fromCharCode(65+selectedCell.c)} to row ${8-rIdx} col ${String.fromCharCode(65+cIdx)}! Tactical pattern completed. Great spatial thinking. Keep learning!`);
                            setSelectedCell(null);
                          }
                        }}
                        className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-xl sm:text-2xl cursor-pointer font-bold ${squareBg} ${highlight} transition`}
                      >
                        <span className={symbol.match(/[♟♜♞♝♛♚]/) ? "text-slate-900" : "text-blue-400 animate-pulse"}>
                          {symbol}
                        </span>
                      </div>
                    );
                  });
                })}
              </div>
              
              {/* Board bottom letters */}
              <div className="grid grid-cols-8 w-72 sm:w-80 text-center font-mono text-[9px] text-slate-500 py-1.5">
                {["A", "B", "C", "D", "E", "F", "G", "H"].map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DOUBTS QUESTIONS MODULE */}
      {innerTab === "Doubts" && (
        <div className="space-y-6">
          {/* Synchronizing Feedback badges */}
          {syncStatus !== "idle" && (
            <div className={`p-2.5 rounded-lg text-xs leading-5 flex items-center gap-2 border ${
              syncStatus === "success"
                ? "bg-emerald-950/20 border-emerald-600/30 text-emerald-400"
                : syncStatus === "error"
                ? "bg-red-950/20 border-red-600/30 text-red-400"
                : "bg-blue-950/20 border-blue-600/30 text-blue-400"
            }`}>
              {syncStatus === "syncing" && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span className="font-mono">
                {syncStatus === "syncing" && "Uploading doubt image to Google Drive & updating your Sheet..."}
                {syncStatus === "success" && "✨ Doubt question logged and appended to Google Spreadsheet successfully!"}
                {syncStatus === "error" && `⚠️ Google sync problem: ${syncError}`}
              </span>
            </div>
          )}

          <form onSubmit={handleAddDoubt} className="bg-slate-950 p-4 rounded-xl border border-slate-850 gap-4 items-end grid grid-cols-1 md:grid-cols-12">
            <div className="md:col-span-2">
              <label className="block text-[10px] text-slate-500 font-mono mb-1 uppercase">Doubt Subject</label>
              <select
                value={doubtSubject}
                onChange={(e) => setDoubtSubject(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-100 p-2 rounded focus:outline-none"
              >
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Chemistry</option>
              </select>
            </div>
            
            <div className="md:col-span-3">
              <label className="block text-[10px] text-slate-500 font-mono mb-1 uppercase">Chapter/Topic</label>
              <input
                type="text"
                required
                value={doubtChapter}
                onChange={(e) => setDoubtChapter(e.target.value)}
                placeholder="eg. Complex Roots, Rotational COM"
                className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-100 p-2 rounded focus:outline-none placeholder-slate-650"
              />
            </div>

            <div className="md:col-span-4">
              <label className="block text-[10px] text-slate-550 font-mono mb-1 uppercase">Explain your doubt question</label>
              <input
                type="text"
                required
                value={doubtText}
                onChange={(e) => setDoubtText(e.target.value)}
                placeholder="eg. Finding torque center relative to rolling..."
                className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-100 p-2 rounded focus:outline-none placeholder-slate-650"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-[10px] text-slate-500 font-mono mb-1 uppercase">Image/Attach (Drop/Click)</label>
              <div 
                className={`relative border border-dashed rounded p-1.5 text-center transition flex items-center justify-center gap-1.5 cursor-pointer max-h-[34px] ${
                  selectedFile 
                    ? "border-emerald-500 bg-emerald-500/5 text-emerald-400" 
                    : "border-slate-800 hover:border-slate-700 hover:bg-slate-900 bg-slate-900/40 text-slate-400"
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) {
                    setSelectedFile(e.dataTransfer.files[0]);
                  }
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono truncate max-w-[120px]">
                  {selectedFile ? selectedFile.name : "Drop Image here"}
                </span>
                {selectedFile && (
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                    className="text-[9px] hover:text-red-400 font-bold ml-1 text-emerald-400 font-mono"
                  >
                    [X]
                  </button>
                )}
              </div>
            </div>

            <div className="md:col-span-12 flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-slate-100 px-6 py-2 text-xs font-bold rounded transition flex items-center gap-1.5 shadow-md shadow-blue-600/10 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> Submit Doubt Question
              </button>
            </div>
          </form>

          {/* Listing */}
          <div className="space-y-3">
            {doubts.map((d) => (
              <div
                key={d.id}
                className="bg-slate-950 border border-slate-850 p-4 rounded-xl relative hover:border-slate-800"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[9px] font-mono font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded mr-2">
                      {d.subject.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Chapter: {d.chapter}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleDoubtStatus(d.id)}
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border transition ${
                        d.status === "Solved"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {d.status}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteDoubt(d.id)}
                      className="text-slate-500 hover:text-red-400 p-0.5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs font-semibold text-slate-200 mt-2.5 bg-slate-900/50 p-2.5 rounded border border-slate-900 leading-relaxed">
                  "{d.questionText}"
                </p>

                {d.imageUrl && (
                  <div className="mt-3 relative rounded-lg border border-slate-850 overflow-hidden bg-slate-950/40 p-2 max-w-sm">
                    <span className="text-[8px] font-mono uppercase bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded absolute top-3 left-3 flex items-center gap-1 z-10 border border-slate-800">
                      <ImageIcon className="w-2.5 h-2.5 text-blue-400" /> Image Attachment
                    </span>
                    <img 
                      src={d.imageUrl} 
                      alt="Doubt reference attachment" 
                      className="rounded max-h-48 object-contain w-full brightness-90 hover:brightness-100 transition mt-6"
                      onError={(e) => {
                        // fallback if blob URL was revoked after reload
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    {d.driveFileId && (
                      <a 
                        href={d.imageUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[9px] text-blue-400 hover:underline block mt-2 font-mono"
                      >
                        📂 View on Google Drive ↗
                      </a>
                    )}
                  </div>
                )}

                {/* Chapterwise notes */}
                <div className="mt-3">
                  <label className="block text-[9px] text-slate-500 font-mono mb-1">Doubt Notes / Hints to crack:</label>
                  <input
                    type="text"
                    value={d.notes}
                    onChange={(e) => handleUpdateDoubtNotes(d.id, e.target.value)}
                    placeholder="Write self hints or equation variables here..."
                    className="w-full bg-slate-900/40 border border-slate-850 text-xs text-slate-300 p-2 rounded focus:outline-none hover:border-slate-800 focus:bg-slate-900"
                  />
                </div>
              </div>
            ))}

            {doubts.length === 0 && (
              <p className="text-slate-500 italic text-xs text-center p-6 bg-slate-950 rounded-xl">
                No active doubts logged yet. Clear your mindset and post doubts as they come!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
